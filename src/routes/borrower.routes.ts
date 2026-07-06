import { FastifyInstance } from 'fastify';
import { db } from '../services/db.service.js';
import { complianceService } from '../services/compliance.service.js';
import { walletService } from '../services/wallet.service.js';
import { zkService } from '../services/zk.service.js';

const BORROWER_LEDGER_TYPES = ['DISBURSEMENT', 'REPAYMENT'] as const;

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

      const borrower = await db.borrower.findUnique({ where: { id } });
      if (!borrower) {
        return reply.code(404).send({ error: 'Borrower not found' });
      }

      // Allowed borrower fields to update
      const borrowerData: any = {};
      if (body.companyName) borrowerData.companyName = body.companyName;
      if (body.sector) borrowerData.sector = body.sector;

      // Allowed user fields to update
      const userData: any = {};
      if (body.name) userData.name = body.name;
      if (body.phoneNumber) userData.phoneNumber = body.phoneNumber;

      const [updatedBorrower] = await db.$transaction([
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
        ...(Object.keys(userData).length > 0
          ? [db.user.update({ where: { id: borrower.userId }, data: userData })]
          : []),
      ]);

      return updatedBorrower;
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: `Failed to update borrower: ${(error as Error).message}` });
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

      // Derive transactions from loan applications
      const derivedEntries: any[] = [];

      for (const loan of borrower.loanApplications) {
        // Disbursement entry — created when loan became ACTIVE
        if (loan.status === 'ACTIVE' || loan.status === 'REPAID' || loan.status === 'DEFAULTED') {
          derivedEntries.push({
            id: `${loan.id}-disbursement`,
            name: 'Loan Disbursement',
            type: 'DISBURSEMENT',
            amount: Number(loan.amountApproved ?? loan.amountRequested),
            status: 'Completed',
            createdAt: loan.updatedAt.toISOString(),
            reference: loan.id,
          });
        }

        // Repayment entry — if any amount has been repaid
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

      // Apply filters
      let filtered = derivedEntries;
      if (query.type && ['DISBURSEMENT', 'REPAYMENT'].includes(query.type.toUpperCase())) {
        filtered = filtered.filter((e) => e.type === query.type!.toUpperCase());
      }
      if (query.search) {
        const search = query.search.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.name.toLowerCase().includes(search) ||
            e.reference.toLowerCase().includes(search)
        );
      }

      // Sort by createdAt desc
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Paginate
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

      // Compute totals
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

          // Compute next installment from the first active loan
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

      // Credit limit from borrower record, or default
      const approvedLimit = Number(borrower.approvedLimit ?? 5_000_000);
      const availableCredit = Math.max(0, approvedLimit - totalOutstanding);

      // Account health score based on repayment ratio
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
}
