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
}
