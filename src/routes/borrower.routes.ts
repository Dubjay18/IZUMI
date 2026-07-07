import { FastifyInstance } from 'fastify';
import { db } from '../services/db.service.js';
import { complianceService } from '../services/compliance.service.js';
import { walletService } from '../services/wallet.service.js';
import { zkService } from '../services/zk.service.js';
import { aiService } from '../services/ai.service.js';
import { cryptoService } from '../services/crypto.service.js';

const BORROWER_LEDGER_TYPES = ['DISBURSEMENT', 'REPAYMENT'] as const;

export async function borrowerRoutes(app: FastifyInstance) {
  // POST /borrowers/onboard
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

      // Check if user or borrower already registered by email
      let existingUser = await db.user.findUnique({
        where: { email },
        include: { borrowerProfile: true }
      });

      // If not found by email, but directorBvn is provided, check if BVN is already registered to someone else (decrypted match)
      if (!existingUser && directorBvn) {
        const allUsersWithBvn = await db.user.findMany({
          where: { bvn: { not: null } },
          include: { borrowerProfile: true }
        });
        for (const u of allUsersWithBvn) {
          if (u.bvn) {
            const decryptedBvn = cryptoService.decrypt(u.bvn);
            if (decryptedBvn === directorBvn) {
              existingUser = u;
              break;
            }
          }
        }
      }

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
        app.log.info(`BorrowerRoutes: ZK-KYC verification succeeded for predicted address ${nextAddress}`);
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

      const encryptedBvn = directorBvn ? cryptoService.encrypt(directorBvn) : null;

      // 2. Persist User and Borrower records in database
      const user = await db.$transaction(async (prisma) => {
        const userData = await prisma.user.upsert({
          where: { email },
          update: {
            role: 'BORROWER',
            kycStatus: 'VERIFIED',
            bvn: encryptedBvn,
          },
          create: {
            email,
            name,
            role: 'BORROWER',
            kycStatus: 'VERIFIED',
            bvn: encryptedBvn,
          }
        });

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

  // Get borrower profile
  app.get('/borrowers/:id', async (request, reply) => {
    try {
      const { id } = request.params as any;

      if (!id) {
        return reply.code(400).send({ error: 'Missing borrower id' });
      }

      const borrower = await db.borrower.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
              kycStatus: true,
            },
          },
        },
      });

      if (!borrower) {
        return reply.code(404).send({ error: 'Borrower not found' });
      }

      return borrower;
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: `Failed to fetch borrower: ${(error as Error).message}` });
    }
  });

  // Update borrower profile
  app.put('/borrowers/:id', async (request, reply) => {
    try {
      const { id } = request.params as any;

      if (!id) {
        return reply.code(400).send({ error: 'Missing borrower id' });
      }

      const body = request.body as any;
      if (!body || typeof body !== 'object') {
        return reply.code(400).send({ error: 'Invalid request body' });
      }

      const borrowerData: any = {};
      if (body.companyName) borrowerData.companyName = body.companyName;
      if (body.sector) borrowerData.sector = body.sector;

      const userData: any = {};
      if (body.name) userData.name = body.name;
      if (body.phoneNumber) userData.phoneNumber = body.phoneNumber;

      const borrowerRecord = await db.borrower.findUnique({ where: { id } });
      if (!borrowerRecord) {
        return reply.code(404).send({ error: 'Borrower not found' });
      }

      const txOps: any[] = [
        db.borrower.update({
          where: { id },
          data: borrowerData,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                kycStatus: true,
              },
            },
          },
        }),
      ];

      if (Object.keys(userData).length > 0) {
        txOps.push(db.user.update({ where: { id: borrowerRecord.userId }, data: userData }));
      }

      const [updatedBorrower] = await db.$transaction(txOps);

      return updatedBorrower;
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: `Failed to update borrower: ${(error as Error).message}` });
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
        data: { splitIntensity: intensity } as any,
      });

      return {
        message: 'Repayment split intensity updated successfully',
        splitIntensity: (borrower as any).splitIntensity,
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

      const borrower = await db.borrower.findUnique({ where: { id } }) as any;
      if (!borrower) {
        return reply.code(404).send({ error: 'Borrower not found' });
      }
      const updatedTerminals = Array.isArray(borrower.terminals) ? [...borrower.terminals] : [];
      if (!updatedTerminals.includes(serialNumber)) {
        updatedTerminals.push(serialNumber);
      }

      const updated = await db.borrower.update({
        where: { id },
        data: { terminals: updatedTerminals } as any,
      });

      return {
        message: 'POS terminal linked successfully',
        terminals: (updated as any).terminals,
      };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: `Failed to link terminal: ${(err as Error).message}` });
    }
  });

  // Get borrower transaction ledger
  app.get('/borrowers/:id/ledger', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const query = request.query as { type?: string; page?: string; limit?: string; search?: string };

      if (!id) {
        return reply.code(400).send({ error: 'Missing borrower id' });
      }

      const borrower = await db.borrower.findUnique({
        where: { id },
        include: {
          loanApplications: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!borrower) {
        return reply.code(404).send({ error: 'Borrower not found' });
      }

      const derivedEntries: any[] = [];

      for (const loan of borrower.loanApplications) {
        if (loan.status === 'ACTIVE' || loan.status === 'REPAID' || loan.status === 'DEFAULTED' || loan.status === 'DISBURSED') {
          derivedEntries.push({
            id: `${loan.id}-disbursement`,
            name: 'Loan Disbursement',
            type: 'DISBURSEMENT',
            amount: Number(loan.amountApproved ?? loan.amountRequested),
            status: 'Completed',
            createdAt: loan.createdAt.toISOString(),
            reference: loan.id,
          });
        }
      }

      // Query actual sweep repayments from WebhookLog
      let hasWebhooks = false;
      const virtualAccount = await db.virtualAccount.findUnique({
        where: { borrowerId: id }
      });
      if (virtualAccount) {
        const webhookLogs = await db.webhookLog.findMany({
          where: {
            status: 'PROCESSED',
            payload: {
              path: ['data', 'transaction', 'aliasAccountReference'],
              equals: virtualAccount.reference
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        if (webhookLogs.length > 0) {
          hasWebhooks = true;
          for (const log of webhookLogs) {
            const payload = log.payload as any;
            const tx = payload.data?.transaction || {};
            derivedEntries.push({
              id: log.id,
              name: 'Daily POS Sweep',
              type: 'REPAYMENT',
              amount: Number(tx.transactionAmount),
              status: 'Completed',
              createdAt: log.createdAt.toISOString(),
              reference: tx.transactionId || log.id,
            });
          }
        }
      }

      // Fallback to aggregated repayments if no webhook logs exist
      if (!hasWebhooks) {
        for (const loan of borrower.loanApplications) {
          if (Number(loan.amountRepaid) > 0) {
            derivedEntries.push({
              id: `${loan.id}-repayment`,
              name: loan.status === 'REPAID' ? 'Full Repayment' : 'Partial Repayment',
              type: 'REPAYMENT',
              amount: Number(loan.amountRepaid),
              status: 'Completed',
              createdAt: loan.updatedAt.toISOString(),
              reference: loan.id,
            });
          }
        }
      }

      let filtered = derivedEntries;
      if (query.type && ['DISBURSEMENT', 'REPAYMENT'].includes(query.type.toUpperCase())) {
        filtered = filtered.filter((e) => e.type === query.type!.toUpperCase());
      }
      if (query.search) {
        const search = query.search.toLowerCase();
        filtered = filtered.filter(
          (e) => e.name.toLowerCase().includes(search) || e.reference.toLowerCase().includes(search)
        );
      }

      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10) || 20));
      const skip = (page - 1) * limit;
      const paginated = filtered.slice(skip, skip + limit);
      const total = filtered.length;

      return {
        entries: paginated,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: `Failed to fetch borrower ledger: ${(error as Error).message}` });
    }
  });

  // Get borrower dashboard stats
  app.get('/borrowers/:id/dashboard', async (request, reply) => {
    try {
      const { id } = request.params as any;

      if (!id) {
        return reply.code(400).send({ error: 'Missing borrower id' });
      }

      const borrower = await db.borrower.findUnique({
        where: { id },
        include: {
          user: true,
          loanApplications: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!borrower) {
        return reply.code(404).send({ error: 'Borrower not found' });
      }

      const loans = borrower.loanApplications;

      let totalOutstanding = 0;
      let totalRepaid = 0;
      let activeLoansCount = 0;
      let nextInstallmentAmount = 0;
      let nextInstallmentDate: string | null = null;

      for (const loan of loans) {
        if (loan.status === 'ACTIVE' || loan.status === 'DISBURSED') {
          const approved = Number(loan.amountApproved ?? loan.amountRequested);
          const repaid = Number(loan.amountRepaid);
          totalOutstanding += approved - repaid;
          activeLoansCount++;

          if (!nextInstallmentDate) {
            const monthlyPayment =
              approved * (1 + Number(loan.interestRate ?? 10) / 100) / Math.max(1, loan.termDays / 30);
            nextInstallmentAmount = Math.round(monthlyPayment * 100) / 100;
            const nextDate = new Date(loan.createdAt);
            nextDate.setDate(nextDate.getDate() + 30);
            nextInstallmentDate = nextDate.toISOString();
          }
        }
        if (loan.status === 'ACTIVE' || loan.status === 'REPAID') {
          totalRepaid += Number(loan.amountRepaid);
        }
      }

      const approvedLimit = Number(borrower.approvedLimit ?? 5_000_000);
      const availableCredit = Math.max(0, approvedLimit - totalOutstanding);

      const totalApproved = loans
        .filter((l) => l.status !== 'REJECTED' && l.status !== 'PENDING')
        .reduce((sum, l) => sum + Number(l.amountApproved ?? l.amountRequested), 0);
      const healthScore =
        totalApproved > 0
          ? Math.round((totalRepaid / totalApproved) * 100 * 10) / 10
          : 99.8;

      return {
        totalOutstanding: Math.round(totalOutstanding * 100) / 100,
        totalRepaid: Math.round(totalRepaid * 100) / 100,
        totalCreditLimit: approvedLimit,
        availableCredit: Math.round(availableCredit * 100) / 100,
        creditScore: borrower.creditScore ?? null,
        creditGrade: borrower.creditGrade ?? null,
        accountHealth: Math.min(100, healthScore),
        activeLoansCount,
        nextInstallmentDate,
        nextInstallmentAmount,
      };
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: `Failed to fetch dashboard: ${(error as Error).message}` });
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

      const doc = await (db as any).kycDocument.create({
        data: {
          borrowerId: id,
          type,
          fileName,
          fileSize: Number(fileSize),
          base64Data,
        },
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

      const documents = await (db as any).kycDocument.findMany({
        where: { borrowerId: id },
        select: {
          id: true,
          type: true,
          fileName: true,
          fileSize: true,
          uploadedAt: true,
        },
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

      const doc = await (db as any).kycDocument.findUnique({
        where: { id: docId },
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
