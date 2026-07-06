import { FastifyInstance } from 'fastify';
import { db } from '../services/db.service.js';
import { complianceService } from '../services/compliance.service.js';
import { walletService } from '../services/wallet.service.js';
import { blockchainService, CONTRACTS, ABIS } from '../services/blockchain.service.js';
import { nombaService } from '../services/nomba.service.js';
import { zkService } from '../services/zk.service.js';
export async function saverRoutes(app: FastifyInstance) {
  // Get Next Derivation Address (used by ZK KYC binding)
  app.get('/savers/next-address', async (request, reply) => {
    try {
      const address = await walletService.getNextDerivationAddress();
      return { address };
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: (error as Error).message });
    }
  });

  // Onboard Saver
  app.post('/savers/onboard', async (request, reply) => {
    const unlock = await walletService.registrationMutex.lock();
    try {
      const body = request.body as any;
      if (!body || typeof body !== 'object') {
        return reply.code(400).send({ error: 'Invalid request body' });
      }

      const { name, email, bvn, nin, zkProof } = body;

      if (!name || !email) {
        return reply.code(400).send({ error: 'Missing required onboarding fields: name, email' });
      }

      if (!bvn && !zkProof) {
        return reply.code(400).send({ error: 'Either bvn or zkProof must be provided' });
      }

      // 1. Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email },
        include: { wallets: true, virtualAccount: true }
      });

      if (existingUser && existingUser.role === 'SAVER' && existingUser.wallets.length > 0) {
        return reply.code(400).send({ error: 'Saver profile already registered and wallet derived.' });
      }

      // 2. Perform KYC
      if (zkProof) {
        // Predict the next derived address
        const nextAddress = await walletService.getNextDerivationAddress();
        const isZkValid = await zkService.verifyKycProof(zkProof, nextAddress);
        if (!isZkValid) {
          return reply.code(400).send({ error: 'KYC ZK-SNARK proof verification failed' });
        }
        console.log(`SaverRoutes: ZK-KYC verification succeeded for predicted address ${nextAddress}`);
      } else {
        // Perform standard KYC (BVN check)
        const bvnCheck = await complianceService.verifyBvn(bvn, name);
        if (!bvnCheck.success) {
          return reply.code(400).send({ error: `KYC Failed: ${bvnCheck.message}` });
        }
      }

      // 3. Register User and derive wallet address atomically
      const result = await db.$transaction(async (prisma) => {
        const user = await prisma.user.upsert({
          where: { email },
          update: {
            role: 'SAVER',
            kycStatus: 'VERIFIED',
            bvn: bvn || null,
            nin: nin || null
          },
          create: {
            email,
            name,
            role: 'SAVER',
            kycStatus: 'VERIFIED',
            bvn: bvn || null,
            nin: nin || null
          }
        });

        // Derive wallet
        const wallet = await walletService.createWalletForUser(user.id, prisma);

        return { user, wallet };
      });

      // 4. Generate virtual account (Nomba DVA) outside Prisma transaction
      const ref = `REF-SAVER-${Math.floor(100000 + Math.random() * 900000)}`;
      const nombaAcc = await nombaService.createVirtualAccount(ref, result.user.name, bvn || '22222222222');

      const virtualAcc = await db.virtualAccount.create({
        data: {
          userId: result.user.id,
          accountNumber: nombaAcc.accountNumber,
          bankName: nombaAcc.bankName,
          accountName: nombaAcc.accountName,
          reference: ref,
          status: 'ACTIVE'
        }
      });

      return {
        message: 'Saver onboarding and wallet derivation successful',
        userId: result.user.id,
        walletAddress: result.wallet.address,
        virtualAccount: {
          accountNumber: virtualAcc.accountNumber,
          bankName: virtualAcc.bankName,
          accountName: virtualAcc.accountName,
          reference: virtualAcc.reference
        }
      };

    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: `Failed to onboard saver: ${(error as Error).message}` });
    } finally {
      unlock();
    }
  });

  // Get Saver balance (combines deposits and withdrawals using BigInt math)
  app.get('/savers/:id/balance', async (request, reply) => {
    try {
      const { id } = request.params as any;

      if (!id) {
        return reply.code(400).send({ error: 'Missing saver user id' });
      }

      const user = await db.user.findUnique({
        where: { id },
        include: { wallets: true }
      });

      if (!user) {
        return reply.code(404).send({ error: 'Saver not found' });
      }

      // Automatically claim on-chain yield rewards if lockup has matured
      if (user.wallets.length > 0) {
        const wallet = user.wallets[0];
        try {
          const claimableOnChain = await blockchainService.getClaimableRewardsForUser(wallet.derivationIndex);
          if (claimableOnChain > 0n) {
            console.log(`SaverRoutes: Claiming ${claimableOnChain.toString()} USDC rewards on-chain for user ${user.name}`);
            const txHash = await blockchainService.claimRewardsForUser(wallet.derivationIndex);
            
            // Record yield entry in local Ledger
            await db.ledger.create({
              data: {
                userId: user.id,
                amount: claimableOnChain.toString(),
                type: 'YIELD',
                status: 'COMPLETED',
                txHash
              }
            });
          }
        } catch (chainError) {
          app.log.error(`SaverRoutes: Failed to auto-claim on-chain yield rewards: ${(chainError as Error).message}`);
        }
      }

      const ledgerEntries = await db.ledger.findMany({
        where: {
          userId: id,
          status: 'COMPLETED'
        }
      });

      let balance = 0n;

      for (const entry of ledgerEntries) {
        const val = BigInt(entry.amount);
        if (entry.type === 'DEPOSIT' || entry.type === 'YIELD') {
          balance += val;
        } else if (entry.type === 'WITHDRAWAL') {
          balance -= val;
        }
      }

      // Convert to decimal representation for display (USDC has 6 decimals)
      const balanceDecimal = Number(balance) / 1_000_000;

      return {
        userId: id,
        balanceRaw: balance.toString(), // Wei/Micro-USDC string
        balanceUSD: balanceDecimal
      };
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: `Failed to calculate balance: ${(error as Error).message}` });
    }
  });

  // Saver Ledger History
  app.get('/savers/:id/ledger', async (request, reply) => {
    try {
      const { id } = request.params as any;

      if (!id) {
        return reply.code(400).send({ error: 'Missing saver user id' });
      }

      const user = await db.user.findUnique({ where: { id } });
      if (!user) {
        return reply.code(404).send({ error: 'Saver not found' });
      }

      const entries = await db.ledger.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return entries;
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: `Failed to fetch ledger: ${(error as Error).message}` });
    }
  });

  // Saver Payout / Withdrawal
  app.post('/savers/withdraw', async (request, reply) => {
    try {
      const body = request.body as any;
      if (!body || typeof body !== 'object') {
        return reply.code(400).send({ error: 'Invalid request body' });
      }

      const { userId, amountUSD } = body;

      if (!userId || !amountUSD) {
        return reply.code(400).send({ error: 'Missing required fields: userId, amountUSD' });
      }

      const amountUSDC = BigInt(Math.round(Number(amountUSD) * 1_000_000));

      // 1. Fetch user wallets
      const user = await db.user.findUnique({
        where: { id: userId },
        include: { wallets: true }
      });

      if (!user || user.wallets.length === 0) {
        return reply.code(404).send({ error: 'User wallet not found.' });
      }

      const wallet = user.wallets[0];

      // 2. Check balance (including pending withdrawals to prevent double spend)
      const ledgerEntries = await db.ledger.findMany({
        where: { userId }
      });

      let availableBalance = 0n;
      for (const entry of ledgerEntries) {
        const val = BigInt(entry.amount);
        if (entry.type === 'DEPOSIT' || entry.type === 'YIELD') {
          if (entry.status === 'COMPLETED') {
            availableBalance += val;
          }
        } else if (entry.type === 'WITHDRAWAL') {
          // Subtract both completed and pending withdrawals
          if (entry.status === 'COMPLETED' || entry.status === 'PENDING') {
            availableBalance -= val;
          }
        }
      }

      if (availableBalance < amountUSDC) {
        return reply.code(400).send({ error: 'Insufficient balance for withdrawal' });
      }

      // 3. Create a PENDING withdrawal ledger entry
      const ledgerEntry = await db.ledger.create({
        data: {
          userId,
          amount: amountUSDC.toString(),
          type: 'WITHDRAWAL',
          status: 'PENDING'
        }
      });

      let txHash: string;
      try {
        const hotWalletAddr = process.env.HOT_WALLET_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
        
        // Check user's QuestToken vault balance
        const questBalance = await blockchainService.publicClient.readContract({
          address: CONTRACTS.QUEST_TOKEN,
          abi: ABIS.QUEST_TOKEN,
          functionName: 'balanceOf',
          args: [wallet.address]
        });

        const vaultAmount = amountUSDC > questBalance ? questBalance : amountUSDC;
        const remainingAmount = amountUSDC - vaultAmount;

        let withdrawHash = '';
        if (vaultAmount > 0n) {
          withdrawHash = await blockchainService.withdrawFromQuest(
            wallet.derivationIndex,
            vaultAmount,
            hotWalletAddr
          );
        }

        let sweepHash = '';
        if (remainingAmount > 0n) {
          // Transfer yield USDC from user's derived wallet to hot wallet
          sweepHash = await blockchainService.executeUserTx(
            wallet.derivationIndex,
            CONTRACTS.USDC,
            ABIS.ERC20,
            'transfer',
            [hotWalletAddr as `0x${string}`, remainingAmount]
          );
        }

        txHash = withdrawHash || sweepHash;

        // 4. Trigger Payout via Nomba payout API
        const payoutRef = `REF-SAVER-OUT-${Math.floor(100000 + Math.random() * 900000)}`;
        const exchangeRate = process.env.EXCHANGE_RATE ? Number(process.env.EXCHANGE_RATE) : 1500;
        const payoutAmountNGN = Number(amountUSD) * exchangeRate;
        await nombaService.disbursePayout(
          payoutAmountNGN,
          '0123456789', // Default mock recipient bank account for MVP
          '058',        // Default GTBank code
          user.name,
          payoutRef
        );
        
        // Update Ledger Status to COMPLETED
        await db.ledger.update({
          where: { id: ledgerEntry.id },
          data: {
            status: 'COMPLETED',
            txHash
          }
        });

        return {
          message: 'Withdrawal processed and disbursed successfully',
          amountUSD,
          txHash
        };

      } catch (blockchainError) {
        // If blockchain transaction fails, rollback the ledger status to FAILED
        await db.ledger.update({
          where: { id: ledgerEntry.id },
          data: { status: 'FAILED' }
        });
        throw blockchainError;
      }

    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: `Withdrawal failed: ${(error as Error).message}` });
    }
  });

  // Saver Transactions History (paginated, filterable)
  app.get('/savers/:id/transactions', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const query = request.query as { page?: string; limit?: string; type?: string };

      if (!id) {
        return reply.code(400).send({ error: 'Missing saver user id' });
      }

      const user = await db.user.findUnique({ where: { id } });
      if (!user) {
        return reply.code(404).send({ error: 'Saver not found' });
      }

      const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10) || 20));
      const skip = (page - 1) * limit;

      const where: any = { userId: id };
      if (query.type && ['DEPOSIT', 'WITHDRAWAL', 'YIELD'].includes(query.type.toUpperCase())) {
        where.type = query.type.toUpperCase();
      }

      const [entries, total] = await Promise.all([
        db.ledger.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        db.ledger.count({ where }),
      ]);

      return {
        entries,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: `Failed to fetch transactions: ${(error as Error).message}` });
    }
  });

  // Saver Deposit Positions (locked positions with maturity info)
  app.get('/savers/:id/positions', async (request, reply) => {
    try {
      const { id } = request.params as any;

      if (!id) {
        return reply.code(400).send({ error: 'Missing saver user id' });
      }

      const user = await db.user.findUnique({
        where: { id },
        include: { wallets: true },
      });

      if (!user) {
        return reply.code(404).send({ error: 'Saver not found' });
      }

      // Get all completed deposit entries to build positions
      const deposits = await db.ledger.findMany({
        where: { userId: id, type: 'DEPOSIT', status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
      });

      // Try to read on-chain balance for vault holdings
      let vaultBalance = 0n;
      if (user.wallets.length > 0) {
        try {
          vaultBalance = await blockchainService.publicClient.readContract({
            address: CONTRACTS.QUEST_TOKEN,
            abi: ABIS.QUEST_TOKEN,
            functionName: 'balanceOf',
            args: [user.wallets[0].address],
          });
        } catch {
          // On-chain read failed; fall back to ledger-only view
        }
      }

      const positions = deposits.map((deposit, index) => {
        const amountUSD = Number(deposit.amount) / 1_000_000;
        const createdAt = new Date(deposit.createdAt);
        const maturityDays = 30; // Default tier 0 (30-day lockup)
        const maturityDate = new Date(createdAt);
        maturityDate.setDate(maturityDate.getDate() + maturityDays);

        const now = new Date();
        const elapsed = now.getTime() - createdAt.getTime();
        const total = maturityDate.getTime() - createdAt.getTime();
        const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
        const isMatured = now >= maturityDate;

        return {
          id: deposit.id,
          txHash: deposit.txHash,
          type: 'Fixed Yield',
          name: `Quest Vault Deposit #${index + 1}`,
          status: isMatured ? 'Matured' : 'Locked',
          principalUSD: amountUSD,
          apy: '4.2%',
          createdAt: deposit.createdAt,
          maturityDate: maturityDate.toISOString(),
          progress: Math.round(progress),
        };
      });

      // Add current vault balance as an "active" position if on-chain balance > 0
      const activePositions = positions.filter((p) => p.status === 'Locked');
      const maturedPositions = positions.filter((p) => p.status === 'Matured');

      return {
        positions: activePositions,
        matured: maturedPositions,
        vaultBalanceRaw: vaultBalance.toString(),
        vaultBalanceUSD: Number(vaultBalance) / 1_000_000,
        totalPositions: positions.length,
      };
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: `Failed to fetch positions: ${(error as Error).message}` });
    }
  });

  // Saver Portfolio (aggregated metrics, allocation, performance)
  app.get('/savers/:id/portfolio', async (request, reply) => {
    try {
      const { id } = request.params as any;

      if (!id) {
        return reply.code(400).send({ error: 'Missing saver user id' });
      }

      const user = await db.user.findUnique({
        where: { id },
        include: { wallets: true },
      });

      if (!user) {
        return reply.code(404).send({ error: 'Saver not found' });
      }

      // Fetch all completed ledger entries
      const ledgerEntries = await db.ledger.findMany({
        where: { userId: id, status: 'COMPLETED' },
        orderBy: { createdAt: 'asc' },
      });

      // ── Compute Metrics ────────────────────────────────────────────
      let totalDeposits = 0n;
      let totalYield = 0n;
      let totalWithdrawals = 0n;

      for (const entry of ledgerEntries) {
        const val = BigInt(entry.amount);
        if (entry.type === 'DEPOSIT') totalDeposits += val;
        else if (entry.type === 'YIELD') totalYield += val;
        else if (entry.type === 'WITHDRAWAL') totalWithdrawals += val;
      }

      const netBalance = totalDeposits + totalYield - totalWithdrawals;
      const netBalanceUSD = Number(netBalance) / 1_000_000;
      const totalYieldUSD = Number(totalYield) / 1_000_000;

      // Optimistic on-chain balance for vault holdings
      let onChainBalanceUSD = 0;
      if (user.wallets.length > 0) {
        try {
          const onChainBal = await blockchainService.publicClient.readContract({
            address: CONTRACTS.QUEST_TOKEN,
            abi: ABIS.QUEST_TOKEN,
            functionName: 'balanceOf',
            args: [user.wallets[0].address],
          });
          onChainBalanceUSD = Number(onChainBal) / 1_000_000;
        } catch {
          // fallback
        }
      }

      const portfolioValue = Math.max(netBalanceUSD, onChainBalanceUSD);
      const depositCount = ledgerEntries.filter((e) => e.type === 'DEPOSIT').length;

      const metrics = [
        {
          label: 'Total Portfolio Value',
          value: `$${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          icon: 'account_balance',
          change: depositCount > 0 ? `Based on ${depositCount} deposit${depositCount > 1 ? 's' : ''}` : 'No deposits yet',
          positive: portfolioValue > 0,
        },
        {
          label: 'Current APY',
          value: depositCount > 0 ? '4.2%' : '--',
          icon: 'trending_up',
          change: 'Fixed yield (30-day tier)',
          positive: true,
        },
        {
          label: 'Total Yield Earned',
          value: `$${totalYieldUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          icon: 'payments',
          change: totalYieldUSD > 0 ? `+$${totalYieldUSD.toFixed(2)} this period` : 'No yield yet',
          positive: totalYieldUSD > 0,
        },
        {
          label: 'Unrealized Gains',
          value: `$${totalYieldUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          icon: 'show_chart',
          change: 'Auto-compounding',
          positive: totalYieldUSD > 0,
        },
      ];

      // ── Allocation ─────────────────────────────────────────────────
      // For MVP, all deposits go into the single Fixed Yield pool
      const totalAllocated = Number(totalDeposits) / 1_000_000;
      const allocation = [
        { label: 'Treasury Bonds', pct: totalAllocated > 0 ? 38 : 0, color: '#001512' },
        { label: 'Stable Yield Pools', pct: totalAllocated > 0 ? 28 : 0, color: '#2b4d46' },
        { label: 'Private Credit', pct: totalAllocated > 0 ? 20 : 0, color: '#735c00' },
        { label: 'Liquid Equities', pct: totalAllocated > 0 ? 10 : 0, color: '#a9cec5' },
        { label: 'Cash Reserve', pct: totalAllocated > 0 ? 4 : 100, color: '#c1c8c5' },
      ];

      // ── Performance (monthly yield rate) ───────────────────────────
      const monthlyMap = new Map<string, { yield: number; principal: number; count: number }>();

      for (const entry of ledgerEntries) {
        const date = new Date(entry.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const val = Number(entry.amount) / 1_000_000;

        if (!monthlyMap.has(key)) {
          monthlyMap.set(key, { yield: 0, principal: 0, count: 0 });
        }
        const m = monthlyMap.get(key)!;
        if (entry.type === 'YIELD') m.yield += val;
        if (entry.type === 'DEPOSIT') m.principal += val;
        m.count++;
      }

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const performance = Array.from(monthlyMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, data]) => {
          const [, monthNum] = key.split('-');
          const month = monthNames[parseInt(monthNum) - 1] || monthNum;
          const principal = Math.round(data.principal);
          const yieldRate = principal > 0 ? Math.round((data.yield / principal) * 100 * 10) / 10 : 0;
          return { month, yield: yieldRate, principal };
        });

      // ── Distribution (quarterly) ───────────────────────────────────
      const quarterMap = new Map<string, { principal: number; yield: number }>();

      for (const entry of ledgerEntries) {
        const date = new Date(entry.createdAt);
        const q = Math.floor(date.getMonth() / 3) + 1;
        const key = `${date.getFullYear()}-Q${q}`;
        const val = Number(entry.amount) / 1_000_000;

        if (!quarterMap.has(key)) {
          quarterMap.set(key, { principal: 0, yield: 0 });
        }
        const qd = quarterMap.get(key)!;
        if (entry.type === 'DEPOSIT') qd.principal += val;
        if (entry.type === 'YIELD') qd.yield += val;
      }

      const distribution = Array.from(quarterMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, data]) => ({
          period,
          principal: Math.round(data.principal),
          yield: Math.round(data.yield),
        }));

      // ── Strategy Mix ───────────────────────────────────────────────
      const strategyMix = totalAllocated > 0
        ? [
            { label: 'Conservative', pct: 66, desc: 'Bonds + stable pools' },
            { label: 'Growth', pct: 20, desc: 'Private credit' },
            { label: 'Opportunistic', pct: 14, desc: 'Equities + reserve' },
          ]
        : [
            { label: 'Conservative', pct: 0, desc: 'Bonds + stable pools' },
            { label: 'Growth', pct: 0, desc: 'Private credit' },
            { label: 'Opportunistic', pct: 100, desc: 'Awaiting allocation' },
          ];

      // ── Next Yield Event ──────────────────────────────────────────
      const latestDeposit = ledgerEntries.filter((e) => e.type === 'DEPOSIT').pop();
      let nextYieldDate: string;
      let estimatedPayoutUSD = 0;

      if (latestDeposit) {
        const depositDate = new Date(latestDeposit.createdAt);
        const maturityDate = new Date(depositDate);
        maturityDate.setDate(maturityDate.getDate() + 30); // 30-day tier
        nextYieldDate = maturityDate.toISOString();
        const depositUSD = Number(latestDeposit.amount) / 1_000_000;
        estimatedPayoutUSD = Math.round(depositUSD * 0.042 * 30 / 365 * 100) / 100; // pro-rata APY
      } else {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        nextYieldDate = futureDate.toISOString();
      }

      // ── Yield Forecast (quarterly projections) ────────────────────
      const apyRate = depositCount > 0 ? 0.048 : 0; // 4.8% APY for active users
      const yieldForecast = portfolioValue > 0
        ? [
            { quarter: 'Q1', projectedValue: Math.round(portfolioValue * (1 + apyRate * 0.25) * 100) / 100 },
            { quarter: 'Q2', projectedValue: Math.round(portfolioValue * (1 + apyRate * 0.5) * 100) / 100 },
            { quarter: 'Q3', projectedValue: Math.round(portfolioValue * (1 + apyRate * 0.75) * 100) / 100 },
            { quarter: 'Target', projectedValue: Math.round(portfolioValue * (1 + apyRate) * 100) / 100 },
          ]
        : [];

      // ── Asset Flow (allocation breakdown) ─────────────────────────
      const assetFlow = totalAllocated > 0
        ? [
            { label: 'Nomba Cash Pool (Liquid)', percentage: 15, color: 'bg-outline-variant', desc: 'Short term liquidity' },
            { label: 'SME Credit Bonds', percentage: 50, color: 'bg-primary', desc: 'Secured business lending' },
            { label: 'Sustainable Agricultural Yields', percentage: 35, color: 'bg-secondary', desc: 'Direct agro project loans' },
          ]
        : [];

      return {
        metrics,
        allocation,
        performance,
        distribution,
        strategyMix,
        nextYieldEvent: {
          date: nextYieldDate,
          estimatedPayoutUSD,
        },
        yieldForecast,
        assetFlow,
      };
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: `Failed to fetch portfolio: ${(error as Error).message}` });
    }
  });
}
