import { FastifyInstance } from 'fastify';
import { db } from '../services/db.service.js';
import { aiService } from '../services/ai.service.js';

export async function loanRoutes(app: FastifyInstance) {
  // Apply for a loan
  app.post('/loans/apply', async (request, reply) => {
    try {
      const body = request.body as any;

      if (!body || typeof body !== 'object') {
        return reply.code(400).send({ error: 'Invalid request body' });
      }

      const { borrowerId, amountRequested, termDays, salesLogs } = body;

      if (!borrowerId || !amountRequested || !salesLogs) {
        return reply.code(400).send({
          error: 'Missing required fields: borrowerId, amountRequested, salesLogs'
        });
      }

      // Check if borrower exists
      const borrower = await db.borrower.findUnique({
        where: { id: borrowerId }
      });

      if (!borrower) {
        return reply.code(404).send({ error: 'Borrower profile not found' });
      }

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

      // Save Loan Application to Database
      const loan = await db.loanApplication.create({
        data: {
          borrowerId: borrower.id,
          amountRequested: Number(amountRequested),
          amountApproved: Number(assessment.approvedLimit),
          interestRate: Number(assessment.recommendedInterestPremium),
          termDays: Number(termDays || 30),
          status: 'AI_ASSESSED',
          creditScore: assessment.creditScore,
          creditGrade: assessment.creditGrade,
          aiAnalysis: assessment.analysis as any,
        }
      });

      return {
        message: 'Loan application submitted and scored successfully',
        applicationId: loan.id,
        status: loan.status,
        creditAnalysis: {
          score: loan.creditScore,
          grade: loan.creditGrade,
          maxLimit: loan.amountApproved,
          monthlyRepayment: Number(loan.amountApproved ?? 0) * (1 + Number(loan.interestRate ?? 0) / 100) / (Number(termDays || 30) / 30),
          aiStrengths: assessment.analysis.strengths,
          aiWeaknesses: assessment.analysis.weaknesses,
          aiTips: assessment.analysis.businessTips
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
}
