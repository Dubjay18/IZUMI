import { FastifyInstance } from 'fastify';
import { db } from '../services/db.service.js';
import { aiService } from '../services/ai.service.js';
import { walletService } from '../services/wallet.service.js';
import { blockchainService, CONTRACTS } from '../services/blockchain.service.js';
import { nombaService } from '../services/nomba.service.js';
import { zkService } from '../services/zk.service.js';

export async function loanRoutes(app: FastifyInstance) {
  // Apply for a loan
  app.post('/loans/apply', async (request, reply) => {
    try {
      const body = request.body as any;

      if (!body || typeof body !== 'object') {
        return reply.code(400).send({ error: 'Invalid request body' });
      }

      const { borrowerId, amountRequested, termDays, salesLogs, zkProof } = body;

      if (!borrowerId || !amountRequested) {
        return reply.code(400).send({
          error: 'Missing required fields: borrowerId, amountRequested'
        });
      }

      if (!salesLogs && !zkProof) {
        return reply.code(400).send({
          error: 'Either salesLogs or zkProof must be provided'
        });
      }

      // Check if borrower exists
      const borrower = await db.borrower.findUnique({
        where: { id: borrowerId }
      });

      if (!borrower) {
        return reply.code(404).send({ error: 'Borrower profile not found' });
      }

      let score: number;
      let limit: number;
      let grade: string;
      let interestRate: number;
      let strengths: string[] = [];
      let weaknesses: string[] = [];
      let tips: string[] = [];

      if (zkProof) {
        // Extract parameters from public inputs: [commitment, proofUserId, proofScore, proofLimit]
        if (!zkProof.publicSignals || zkProof.publicSignals.length < 4) {
          return reply.code(400).send({ error: 'Invalid ZK proof format' });
        }
        const proofUserId = zkProof.publicSignals[1];
        score = Number(zkProof.publicSignals[2]);
        limit = Number(zkProof.publicSignals[3]);

        // Verify proof
        const isZkValid = await zkService.verifyCreditProof(zkProof, borrower.userId, score, limit);
        if (!isZkValid) {
          return reply.code(400).send({ error: 'Credit ZK-SNARK proof verification failed' });
        }

        console.log(`LoanRoutes: Credit ZK-SNARK proof verified successfully for user ${borrower.userId}. Score: ${score}, Limit: ₦${limit}`);

        if (score >= 80) {
          grade = 'A';
          interestRate = 5; // 5% interest
        } else if (score >= 60) {
          grade = 'B';
          interestRate = 10; // 10% interest
        } else {
          grade = 'C';
          interestRate = 15; // 15% interest
        }

        strengths = ['Verified via off-chain ZK-SNARK privacy pipeline.'];
        weaknesses = ['Financial records kept private off-chain.'];
        tips = ['Maintain healthy balance history.'];
      } else {
        // Process salesLogs to compute metrics
        let monthlyRevenue = 0;
        let transactionCount = 0;
        let averageTicketSize = 0;
        let revenueVolatility = 0.15; // default
        let operatingCosts = 0;

        if (Array.isArray(salesLogs) && salesLogs.length > 0) {
          const volumes = salesLogs.map(log => Number(log.volume || 0));
          const txCounts = salesLogs.map(log => Number(log.txCount || 0));

          const totalVolume = volumes.reduce((sum, v) => sum + v, 0);
          const totalTxCount = txCounts.reduce((sum, c) => sum + c, 0);

          monthlyRevenue = totalVolume / salesLogs.length;
          transactionCount = Math.round(totalTxCount / salesLogs.length);
          averageTicketSize = transactionCount > 0 ? (monthlyRevenue / transactionCount) : 0;
          operatingCosts = monthlyRevenue * 0.45; // simulate 45% operating expenses for Retail

          if (salesLogs.length > 1) {
            // Calculate volatility (standard deviation / mean)
            const mean = monthlyRevenue;
            const variance = volumes.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / volumes.length;
            const stdDev = Math.sqrt(variance);
            revenueVolatility = mean > 0 ? (stdDev / mean) : 0.15;
          }
        } else if (salesLogs && typeof salesLogs === 'object') {
          // If direct metrics object is supplied instead
          monthlyRevenue = Number(salesLogs.monthlyRevenue || 0);
          revenueVolatility = Number(salesLogs.revenueVolatility ?? 0.15);
          transactionCount = Number(salesLogs.transactionCount || 0);
          averageTicketSize = Number(salesLogs.averageTicketSize || 0);
          operatingCosts = Number(salesLogs.operatingCosts || (monthlyRevenue * 0.45));
        }

        // Invoke AI Credit Scoring
        const assessment = await aiService.scoreSmeCredit({
          monthlyRevenue,
          revenueVolatility,
          transactionCount,
          averageTicketSize,
          operatingCosts,
          sector: borrower.sector
        });

        score = assessment.creditScore;
        limit = Number(assessment.approvedLimit);
        grade = assessment.creditGrade;
        interestRate = Number(assessment.recommendedInterestPremium);
        strengths = assessment.analysis.strengths;
        weaknesses = assessment.analysis.weaknesses;
        tips = assessment.analysis.businessTips;
      }

      // Save Loan Application to Database
      const loan = await db.loanApplication.create({
        data: {
          borrowerId: borrower.id,
          amountRequested: Number(amountRequested),
          amountApproved: Math.min(limit, Number(amountRequested)),
          interestRate: interestRate,
          termDays: Number(termDays || 30),
          status: 'AI_ASSESSED',
          creditScore: score,
          creditGrade: grade,
          aiAnalysis: { strengths, weaknesses, businessTips: tips } as any,
        }
      });

      return {
        message: 'Loan application submitted and scored successfully',
        applicationId: loan.id,
        status: loan.status,
        creditAnalysis: {
          score: loan.creditScore,
          grade: loan.creditGrade,
          maxLimit: limit,
          monthlyRepayment: Number(loan.amountApproved ?? 0) * (1 + Number(loan.interestRate ?? 0) / 100) / (Number(termDays || 30) / 30),
          aiStrengths: strengths,
          aiWeaknesses: weaknesses,
          aiTips: tips
        }
      };

    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: `Failed to process loan application: ${(error as Error).message}` });
    }
  });

  // Get specific loan application
  app.get('/loans/:id', async (request, reply) => {
    try {
      const { id } = request.params as any;

      if (!id) {
        return reply.code(400).send({ error: 'Missing loan application id' });
      }

      const loan = await db.loanApplication.findUnique({
        where: { id },
        include: {
          borrower: {
            include: {
              user: true
            }
          }
        }
      });

      if (!loan) {
        return reply.code(404).send({ error: 'Loan application not found' });
      }

      return loan;
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: `Failed to fetch loan application: ${(error as Error).message}` });
    }
  });

  // Get all loan applications for a borrower
  app.get('/borrowers/:id/loans', async (request, reply) => {
    try {
      const { id } = request.params as any;

      if (!id) {
        return reply.code(400).send({ error: 'Missing borrower id' });
      }

      const loans = await db.loanApplication.findMany({
        where: { borrowerId: id },
        orderBy: { createdAt: 'desc' },
      });

      return loans;
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: `Failed to fetch loans: ${(error as Error).message}` });
    }
  });

  // Accept a scored loan application and disburse funds
  app.post('/loans/:id/accept', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const { splitIntensity } = (request.body as any) ?? {};

      if (!id) {
        return reply.code(400).send({ error: 'Missing loan application id' });
      }

      // 1. Fetch the loan application
      const loan = await db.loanApplication.findUnique({
        where: { id },
        include: {
          borrower: {
            include: {
              user: {
                include: { wallets: true }
              }
            }
          }
        }
      });

      if (!loan) {
        return reply.code(404).send({ error: 'Loan application not found' });
      }

      if (loan.status !== 'AI_ASSESSED') {
        return reply.code(400).send({ error: `Loan application cannot be accepted. Current status: ${loan.status}` });
      }

      const borrower = loan.borrower;
      const user = borrower.user;

      // 2. Resolve or derive wallet
      let wallet: any = user.wallets[0];
      if (!wallet) {
        wallet = await walletService.createWalletForUser(user.id);
      }

      // 3. Compute loan details in USDC
      const exchangeRate = process.env.EXCHANGE_RATE ? Number(process.env.EXCHANGE_RATE) : 1500;
      const amountApprovedNGN = Number(loan.amountApproved ?? loan.amountRequested);
      const amountUSD = amountApprovedNGN / exchangeRate;
      const amountUSDC_Micro = BigInt(Math.round(amountUSD * 1_000_000));

      if (amountUSDC_Micro <= 0n) {
        return reply.code(400).send({ error: 'Approved amount too low for USD conversion.' });
      }

      // Backing token amount representing collateral
      const tokenAmount = (amountUSDC_Micro * 130n) / 100n; // 1.3x backing for 30% discount

      console.log(`LoanRoutes: Setting up borrower ${user.name} for bond creation...`);

      // 4. Fund borrower and approve BondManager
      await blockchainService.setupBorrowerForBond(
        wallet.derivationIndex,
        CONTRACTS.USDC,
        tokenAmount
      );

      console.log(`LoanRoutes: Creating Quest Bond on-chain for borrower ${user.name}...`);

      // 5. Create the Quest Bond using the hot wallet
      const txHash = await blockchainService.createQuestBond(
        wallet.address,
        amountUSDC_Micro,
        tokenAmount,
        0, // Tier 0 (30 days lockup)
        3000, // 30% discount
        30, // 30 vesting days
        CONTRACTS.USDC
      );

      // 6. Trigger Nomba Payout via Payout API (disburse NGN to SME's bank account)
      const payoutRef = `REF-LOAN-OUT-${Math.floor(100000 + Math.random() * 900000)}`;
      await nombaService.disbursePayout(
        amountApprovedNGN,
        '0987654321', // Default recipient bank account for SME borrower in MVP
        '058',        // Default GTBank code
        borrower.companyName,
        payoutRef
      );

      // 7. Store splitIntensity and update loan application status to ACTIVE
      const existingAnalysis = (loan.aiAnalysis as Record<string, unknown>) ?? {};
      const updatedLoan = await db.loanApplication.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          contractBondId: txHash, // store transaction hash as bond identifier
          aiAnalysis: {
            ...existingAnalysis,
            splitIntensity: splitIntensity ?? 15,
          },
        },
      });

      return {
        message: 'Loan application accepted, bond created, and funds disbursed.',
        loanId: updatedLoan.id,
        status: updatedLoan.status,
        disbursedNGN: amountApprovedNGN,
        disbursedUSDC: amountUSD,
        txHash
      };

    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: `Failed to accept loan: ${(error as Error).message}` });
    }
  });
}
