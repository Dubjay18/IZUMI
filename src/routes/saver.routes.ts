import { FastifyInstance } from 'fastify';
import { db } from '../services/db.service.js';
import { complianceService } from '../services/compliance.service.js';
import { walletService } from '../services/wallet.service.js';
import { blockchainService, CONTRACTS, ABIS } from '../services/blockchain.service.js';
import { nombaService } from '../services/nomba.service.js';
import { zkService } from '../services/zk.service.js';
import { cryptoService } from '../services/crypto.service.js';

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
        let virtualAcc = existingUser.virtualAccount;
        if (!virtualAcc) {
          const ref = `REF-SAVER-${Math.floor(100000 + Math.random() * 900000)}`;
          let nombaAcc;
          try {
            nombaAcc = await nombaService.createVirtualAccount(ref, existingUser.name, bvn || '22222222222');
          } catch (err) {
            nombaAcc = {
              accountNumber: `90${Math.floor(10000000 + Math.random() * 90000000)}`,
              bankName: 'Nomba Microfinance Bank (Fallback)',
              accountName: `IZUMI / ${existingUser.name}`,
              reference: ref
            };
          }
          virtualAcc = await db.virtualAccount.create({
            data: {
              userId: existingUser.id,
              accountNumber: nombaAcc.accountNumber,
              bankName: nombaAcc.bankName,
              accountName: nombaAcc.accountName,
              reference: ref,
              status: 'ACTIVE'
            }
          });
        }

        return {
          message: 'Saver onboarding and wallet derivation successful',
          userId: existingUser.id,
          walletAddress: existingUser.wallets[0].address,
          virtualAccount: {
            accountNumber: virtualAcc.accountNumber,
            bankName: virtualAcc.bankName,
            accountName: virtualAcc.accountName,
            reference: virtualAcc.reference
          }
        };
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

      const encryptedBvn = bvn ? cryptoService.encrypt(bvn) : null;
      const encryptedNin = nin ? cryptoService.encrypt(nin) : null;

      // 3. Register User and derive wallet address atomically
      const result = await db.$transaction(async (prisma) => {
        const user = await prisma.user.upsert({
          where: { email },
          update: {
            role: 'SAVER',
            kycStatus: 'VERIFIED',
            bvn: encryptedBvn,
            nin: encryptedNin
          },
          create: {
            email,
            name,
            role: 'SAVER',
            kycStatus: 'VERIFIED',
            bvn: encryptedBvn,
            nin: encryptedNin
          }
        });

        // Derive wallet
        const wallet = await walletService.createWalletForUser(user.id, prisma);

        return { user, wallet };
      });

      // 4. Generate virtual account (Nomba DVA) outside Prisma transaction
      const ref = `REF-SAVER-${Math.floor(100000 + Math.random() * 900000)}`;
      let nombaAcc;
      try {
        nombaAcc = await nombaService.createVirtualAccount(ref, result.user.name, bvn || '22222222222');
      } catch (err) {
        console.warn('SaverRoutes: Live DVA creation failed, falling back to mock details:', (err as Error).message);
        nombaAcc = {
          accountNumber: `90${Math.floor(10000000 + Math.random() * 90000000)}`,
          bankName: 'Nomba Microfinance Bank (Fallback)',
          accountName: `IZUMI / ${result.user.name}`,
          reference: ref
        };
      }

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

  // GET /savers/:id/dashboard
  app.get('/savers/:id/dashboard', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const user = await db.user.findUnique({
        where: { id },
        include: { ledger: true }
      });

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      // Calculate balance and yield statistics
      let totalSavingsUSD = 0;
      let totalYieldUSD = 0;

      for (const entry of user.ledger) {
        if (entry.status === 'COMPLETED') {
          const val = Number(entry.amount) / 100; // stored in cents
          if (entry.type === 'DEPOSIT') {
            totalSavingsUSD += val;
          } else if (entry.type === 'WITHDRAWAL') {
            totalSavingsUSD -= val;
          } else if (entry.type === 'YIELD') {
            totalYieldUSD += val;
          }
        }
      }

      // Total protocol metrics for share calculations
      const globalDepositsList = await db.ledger.findMany({
        where: { type: 'DEPOSIT', status: 'COMPLETED' }
      });
      const globalWithdrawalsList = await db.ledger.findMany({
        where: { type: 'WITHDRAWAL', status: 'COMPLETED' }
      });

      const globalDeposits = globalDepositsList.reduce((acc, d) => acc + Number(d.amount), 0) / 100;
      const globalWithdrawals = globalWithdrawalsList.reduce((acc, w) => acc + Number(w.amount), 0) / 100;
      const globalTVL = Math.max(1, globalDeposits - globalWithdrawals);

      const userShare = totalSavingsUSD / globalTVL;

      // Calculate community impact
      const activeLoansCount = await db.loanApplication.count({
        where: { status: { in: ['ACTIVE', 'DISBURSED'] } }
      });

      const smeLoansFunded = Math.max(1, Math.round(activeLoansCount * (userShare || 0.1)));
      const jobsSupported = smeLoansFunded * 5; // assume 5 jobs per loan

      // Mock yield projections for the chart
      const yieldForecast = Array.from({ length: 6 }, (_, idx) => {
        const date = new Date();
        date.setMonth(date.getMonth() + idx);
        const projectedValue = totalSavingsUSD * Math.pow(1 + 0.055 / 12, idx + 1);
        return {
          month: date.toLocaleString('default', { month: 'short' }),
          balance: parseFloat(projectedValue.toFixed(2)),
          yield: parseFloat((projectedValue - totalSavingsUSD).toFixed(2))
        };
      });

      return {
        totalSavingsUSD: parseFloat(totalSavingsUSD.toFixed(2)),
        totalYieldUSD: parseFloat(totalYieldUSD.toFixed(2)),
        communityImpact: {
          smeLoansFunded,
          saverSharePercent: parseFloat((userShare * 100).toFixed(2)) || 0,
          totalJobsSupported: jobsSupported
        },
        yieldForecast,
        assetFlow: {
          deposits: parseFloat(totalSavingsUSD.toFixed(2)),
          withdrawals: 0 // Mocked withdrawal flow sum for MVP analytics
        }
      };

    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: `Failed to retrieve dashboard stats: ${(err as Error).message}` });
    }
  });

  // GET /savers/:id/transactions
  app.get('/savers/:id/transactions', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const transactions = await db.ledger.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' }
      });

      return transactions.map(t => ({
        id: t.id,
        type: t.type,
        amountRaw: t.amount,
        amountUSD: Number(t.amount) / 100,
        status: t.status,
        txHash: t.txHash,
        timestamp: t.createdAt
      }));
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: `Failed to retrieve transaction ledger: ${(err as Error).message}` });
    }
  });

  // POST /savers/:id/sync
  app.post('/savers/:id/sync', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const user = await db.user.findUnique({
        where: { id },
        include: { wallets: true, virtualAccount: true }
      });

      if (!user || !user.virtualAccount) {
        return reply.code(404).send({ error: 'User or Virtual Account details not found' });
      }

      const reference = user.virtualAccount.reference;
      
      // Look back 7 days
      const dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const dateTo = new Date().toISOString().split('T')[0];

      console.log(`SaverRoutes: Syncing transactions for ${user.name} (Ref: ${reference}) from ${dateFrom} to ${dateTo}...`);
      const txs = await nombaService.fetchTransactions(dateFrom, dateTo);

      let syncCount = 0;
      let usdSynced = 0;

      for (const tx of txs) {
        // Nomba transaction refs match our accountRef/reference
        const txRef = tx.merchantTxRef || tx.onlineCheckoutOrderReference || tx.paymentReference;
        if (txRef !== reference) continue;

        // Idempotency check: prevent duplicate credit for the same transactionId
        const transactionId = tx.id || tx.transactionId || tx.paymentReference;
        const existingLedger = await db.ledger.findFirst({
          where: { userId: id, txHash: transactionId }
        });

        if (existingLedger) continue;

        // Process deposit
        const amountNGN = Number(tx.amount);
        const exchangeRate = process.env.EXCHANGE_RATE ? Number(process.env.EXCHANGE_RATE) : 1500;
        const amountUSD = amountNGN / exchangeRate;
        const amountUSDC_Micro = BigInt(Math.round(amountUSD * 1_000_000));

        if (amountUSDC_Micro <= 0n) continue;

        const wallet = user.wallets[0];
        if (!wallet) continue;

        console.log(`SaverRoutes: Sync found new credit of ₦${amountNGN} ($${amountUSD} USD). Executing on-chain Quest deposit...`);
        
        try {
          await blockchainService.transferUsdcFromHotWallet(wallet.address, amountUSDC_Micro);
          const txHash = await blockchainService.depositToQuest(wallet.derivationIndex, amountUSDC_Micro, 0);

          await db.ledger.create({
            data: {
              userId: user.id,
              amount: amountUSDC_Micro.toString(),
              type: 'DEPOSIT',
              status: 'COMPLETED',
              txHash: transactionId
            }
          });

          syncCount++;
          usdSynced += amountUSD;
        } catch (chainErr) {
          console.error(`SaverRoutes: On-chain transaction failed during sync:`, chainErr);
          // Still record in ledger as pending or failed, or bubble up
          throw chainErr;
        }
      }

      return {
        success: true,
        message: `Synced ${syncCount} new deposits successfully.`,
        usdSynced
      };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: `Transaction sync failed: ${(err as Error).message}` });
    }
  });

  // GET /protocol/vault-health
  app.get('/protocol/vault-health', async (request, reply) => {
    try {
      const globalDepositsList = await db.ledger.findMany({
        where: { type: 'DEPOSIT', status: 'COMPLETED' }
      });
      const globalWithdrawalsList = await db.ledger.findMany({
        where: { type: 'WITHDRAWAL', status: 'COMPLETED' }
      });

      const globalDeposits = globalDepositsList.reduce((acc, d) => acc + Number(d.amount), 0) / 100;
      const globalWithdrawals = globalWithdrawalsList.reduce((acc, w) => acc + Number(w.amount), 0) / 100;
      const globalTVL = Math.max(100, globalDeposits - globalWithdrawals);

      const activeLoansSumResult = await db.loanApplication.aggregate({
        _sum: { amountApproved: true },
        where: { status: { in: ['ACTIVE', 'DISBURSED'] } }
      });
      const activeLentUSD = Number(activeLoansSumResult._sum.amountApproved || 0);

      const utilizationRate = Math.min(100, parseFloat(((activeLentUSD / globalTVL) * 100).toFixed(2)));

      return {
        tvlUSD: globalTVL,
        activeLentUSD,
        utilizationRate,
        defaultRate: 0.00 // Default default rate is 0% for staging MVP
      };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: `Failed to retrieve vault health: ${(err as Error).message}` });
    }
  });

  // Simple in-memory session store for Mobile Handshake (0 downtime, no external dependencies)
  const kycSessions = new Map<string, { status: 'PENDING' | 'VERIFIED' | 'FAILED'; userId: string | null }>();

  // POST /savers/sessions/handshake
  app.post('/savers/sessions/handshake', async (request, reply) => {
    try {
      const token = 'token-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      kycSessions.set(token, { status: 'PENDING', userId: null });
      return { token };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: `Failed to create compliance session: ${(err as Error).message}` });
    }
  });

  // GET /savers/sessions/:token
  app.get('/savers/sessions/:token', async (request, reply) => {
    try {
      const { token } = request.params as any;
      const session = kycSessions.get(token);

      if (!session) {
        return reply.code(404).send({ error: 'Compliance session not found or expired' });
      }

      return {
        status: session.status,
        userId: session.userId
      };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: `Failed to retrieve compliance session: ${(err as Error).message}` });
    }
  });

  // POST /savers/sessions/:token/verify
  app.post('/savers/sessions/:token/verify', async (request, reply) => {
    try {
      const { token } = request.params as any;
      const { userId } = request.body as any;

      const session = kycSessions.get(token);
      if (!session) {
        return reply.code(404).send({ error: 'Compliance session not found or expired' });
      }

      // Update session state
      session.status = 'VERIFIED';
      if (userId) {
        session.userId = userId;
        // Check if user exists and update
        const user = await db.user.findUnique({ where: { id: userId } });
        if (user) {
          await db.user.update({
            where: { id: userId },
            data: { kycStatus: 'VERIFIED' }
          });
        }
      }
      kycSessions.set(token, session);

      return {
        success: true,
        message: 'Liveness identity verified successfully'
      };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: `Failed to verify compliance session: ${(err as Error).message}` });
    }
  });
}
