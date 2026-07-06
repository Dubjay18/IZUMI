import { FastifyInstance } from 'fastify';
import { db } from '../services/db.service.js';
import { complianceService } from '../services/compliance.service.js';
import { walletService } from '../services/wallet.service.js';
import { zkService } from '../services/zk.service.js';
import { aiService } from '../services/ai.service.js';

export async function borrowerRoutes(app: FastifyInstance) {
  app.post('/borrowers/onboard', async (request, reply) => {
    const unlock = await walletService.registrationMutex.lock();
    try {
      const body = request.body as any;

      if (!body || typeof body !== 'object') {
        return reply.code(400).send({ error: 'Invalid request body' });
      }

      const { name, email, directorBvn, companyName, cacRcNumber, businessTin, sector, zkProof } = body;

      // Validate required fields
      if (!name || !email || !companyName || !cacRcNumber || !businessTin || !sector) {
        return reply.code(400).send({
          error: 'Missing required onboarding fields: name, email, companyName, cacRcNumber, businessTin, sector'
        });
      }

      if (!directorBvn && !zkProof) {
        return reply.code(400).send({ error: 'Either directorBvn or zkProof must be provided' });
      }

      // Check if user or borrower already registered
      const existingUser = await db.user.findFirst({
        where: {
          OR: [
            { email },
            ...(directorBvn ? [{ bvn: directorBvn }] : [])
          ]
        },
        include: { borrowerProfile: true }
      });

      if (existingUser?.borrowerProfile) {
        return reply.code(400).send({ error: 'Borrower already registered under this email or BVN' });
      }

      // 1. Perform Compliance/KYC checks
      if (zkProof) {
        // Predict the next derived address
        const nextAddress = await walletService.getNextDerivationAddress();
        const isZkValid = await zkService.verifyKycProof(zkProof, nextAddress);
        if (!isZkValid) {
          return reply.code(400).send({ error: 'KYC ZK-SNARK proof verification failed' });
        }
        console.log(`BorrowerRoutes: ZK-KYC verification succeeded for predicted address ${nextAddress}`);
      } else {
        const bvnCheck = await complianceService.verifyBvn(directorBvn, name);
        if (!bvnCheck.success) {
          return reply.code(400).send({ error: `KYC Failed: ${bvnCheck.message}` });
        }
      }

      const cacCheck = await complianceService.verifyCac(cacRcNumber, companyName, name);
      if (!cacCheck.success) {
        return reply.code(400).send({ error: `KYB Failed: ${cacCheck.message}` });
      }

      const tinCheck = await complianceService.verifyTin(businessTin);
      if (!tinCheck.success) {
        return reply.code(400).send({ error: `KYB Failed: ${tinCheck.message}` });
      }

      // 2. Persist User and Borrower records in database
      const user = await db.$transaction(async (prisma) => {
        // Upsert user if existing saver is registering as borrower, or create new
        const userData = await prisma.user.upsert({
          where: { email },
          update: {
            role: 'BORROWER',
            kycStatus: 'VERIFIED',
            bvn: directorBvn || null,
          },
          create: {
            email,
            name,
            role: 'BORROWER',
            kycStatus: 'VERIFIED',
            bvn: directorBvn || null,
          }
        });

        // Create Borrower profile
        const borrower = await prisma.borrower.create({
          data: {
            userId: userData.id,
            companyName,
            cacRcNumber,
            businessTin,
            sector,
            kybStatus: 'VERIFIED',
          }
        });

        // Derive wallet
        await walletService.createWalletForUser(userData.id, prisma);

        return { ...userData, borrowerProfile: borrower };
      });

      return {
        message: 'Onboarding completed successfully',
        kybStatus: 'verified',
        borrowerId: user.borrowerProfile.id,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          kycStatus: user.kycStatus
        }
      };

    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: `Failed to complete onboarding: ${(error as Error).message}` });
    } finally {
      unlock();
    }
  });

  // GET /borrowers/:id/dashboard
  app.get('/borrowers/:id/dashboard', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const borrower = await db.borrower.findUnique({
        where: { id },
        include: {
          loanApplications: {
            orderBy: { createdAt: 'desc' }
          },
          repaymentAccount: true
        }
      });

      if (!borrower) {
        return reply.code(404).send({ error: 'Borrower profile not found' });
      }

      // Check for active or disbursed loan
      const activeLoan = borrower.loanApplications.find(l => 
        ['ACTIVE', 'DISBURSED', 'AI_ASSESSED'].includes(l.status)
      );

      let outstandingBalance = 0;
      let totalRepaid = 0;
      let amortizationForecastDays = 0;

      if (activeLoan) {
        const approved = Number(activeLoan.amountApproved || activeLoan.amountRequested);
        const repaid = Number(activeLoan.amountRepaid || 0);
        outstandingBalance = Math.max(0, approved - repaid);
        totalRepaid = repaid;

        // Estimate repayment pace: assuming ₦5,000 daily sweep rate
        const dailySweepEstimate = 5000 / (process.env.EXCHANGE_RATE ? Number(process.env.EXCHANGE_RATE) : 1500); // in USD
        amortizationForecastDays = Math.ceil(outstandingBalance / (dailySweepEstimate || 3));
      }

      // Gather simulated transaction sweeps list for demo representation
      const recentSweeps = activeLoan ? [
        {
          id: 'sweep-101',
          amountRaw: '750000', // ₦7,500
          amountUSD: 5.00,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'COMPLETED'
        },
        {
          id: 'sweep-102',
          amountRaw: '450000', // ₦4,500
          amountUSD: 3.00,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'COMPLETED'
        }
      ] : [];

      return {
        borrowerId: borrower.id,
        companyName: borrower.companyName,
        splitIntensity: borrower.splitIntensity,
        terminals: borrower.terminals,
        activeLoan: activeLoan ? {
          id: activeLoan.id,
          amountRequested: Number(activeLoan.amountRequested),
          amountApproved: Number(activeLoan.amountApproved || activeLoan.amountRequested),
          interestRate: Number(activeLoan.interestRate || 10),
          status: activeLoan.status,
          outstandingBalance: parseFloat(outstandingBalance.toFixed(2)),
          totalRepaid: parseFloat(totalRepaid.toFixed(2)),
          termDays: activeLoan.termDays
        } : null,
        repaymentAccount: borrower.repaymentAccount,
        amortizationForecastDays,
        recentSweeps
      };

    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: `Failed to retrieve borrower dashboard: ${(err as Error).message}` });
    }
  });

  // POST /borrowers/:id/split-intensity
  app.post('/borrowers/:id/split-intensity', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const { intensity } = request.body as any;

      if (typeof intensity !== 'number' || intensity < 1 || intensity > 100) {
        return reply.code(400).send({ error: 'Invalid intensity. Must be a percentage number between 1 and 100.' });
      }

      const borrower = await db.borrower.update({
        where: { id },
        data: { splitIntensity: intensity }
      });

      return {
        message: 'Repayment split intensity updated successfully',
        splitIntensity: borrower.splitIntensity
      };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: `Failed to update split intensity: ${(err as Error).message}` });
    }
  });

  // POST /borrowers/:id/terminals
  app.post('/borrowers/:id/terminals', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const { serialNumber } = request.body as any;

      if (!serialNumber || typeof serialNumber !== 'string') {
        return reply.code(400).send({ error: 'Missing or invalid terminal serialNumber' });
      }

      const borrower = await db.borrower.findUnique({ where: { id } });
      if (!borrower) {
        return reply.code(404).send({ error: 'Borrower not found' });
      }

      const updatedTerminals = [...borrower.terminals, serialNumber];

      await db.borrower.update({
        where: { id },
        data: { terminals: updatedTerminals }
      });

      return {
        message: 'POS terminal linked successfully',
        terminals: updatedTerminals
      };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: `Failed to link terminal: ${(err as Error).message}` });
    }
  });

  // POST /ai/chat
  app.post('/ai/chat', async (request, reply) => {
    try {
      const { message, borrowerId } = request.body as any;

      if (!message || typeof message !== 'string') {
        return reply.code(400).send({ error: 'Missing or invalid prompt message' });
      }

      let contextStr = '';
      if (borrowerId) {
        const borrower = await db.borrower.findUnique({
          where: { id: borrowerId },
          include: { loanApplications: true }
        });
        if (borrower) {
          contextStr = `Business Name: ${borrower.companyName}. Sector: ${borrower.sector}. Credit Score: ${borrower.creditScore || 'Not Assessed yet'}. Approved Limit: ${borrower.approvedLimit || 0} NGN.`;
        }
      }

      const advice = await aiService.askAdvisoryQuestion(message, contextStr);
      return { response: advice };

    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: `Failed to generate AI advice: ${(err as Error).message}` });
    }
  });

  // POST /borrowers/:id/documents
  app.post('/borrowers/:id/documents', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const { type, fileName, fileSize, base64Data } = request.body as any;

      if (!type || !fileName || !fileSize || !base64Data) {
        return reply.code(400).send({ error: 'Missing required document upload fields: type, fileName, fileSize, base64Data' });
      }

      if (!['CAC_CERTIFICATE', 'DIRECTOR_ID'].includes(type)) {
        return reply.code(400).send({ error: 'Invalid document type. Must be CAC_CERTIFICATE or DIRECTOR_ID' });
      }

      const borrower = await db.borrower.findUnique({ where: { id } });
      if (!borrower) {
        return reply.code(404).send({ error: 'Borrower profile not found' });
      }

      const doc = await db.kycDocument.create({
        data: {
          borrowerId: id,
          type,
          fileName,
          fileSize: Number(fileSize),
          base64Data
        }
      });

      return {
        message: 'Document uploaded successfully',
        documentId: doc.id,
        type: doc.type,
        fileName: doc.fileName
      };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: `Failed to upload document: ${(err as Error).message}` });
    }
  });

  // GET /borrowers/:id/documents
  app.get('/borrowers/:id/documents', async (request, reply) => {
    try {
      const { id } = request.params as any;

      const documents = await db.kycDocument.findMany({
        where: { borrowerId: id },
        select: {
          id: true,
          type: true,
          fileName: true,
          fileSize: true,
          uploadedAt: true
        }
      });

      return documents;
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: `Failed to list documents: ${(err as Error).message}` });
    }
  });

  // GET /borrowers/documents/:docId
  app.get('/borrowers/documents/:docId', async (request, reply) => {
    try {
      const { docId } = request.params as any;

      const doc = await db.kycDocument.findUnique({
        where: { id: docId }
      });

      if (!doc) {
        return reply.code(404).send({ error: 'Document not found' });
      }

      return doc;
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: `Failed to retrieve document: ${(err as Error).message}` });
    }
  });
}
