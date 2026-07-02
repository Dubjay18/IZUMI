import { FastifyInstance } from 'fastify';
import { db } from '../services/db.service.js';
import { complianceService } from '../services/compliance.service.js';

export async function borrowerRoutes(app: FastifyInstance) {
  app.post('/borrowers/onboard', async (request, reply) => {
    try {
      const body = request.body as any;

      if (!body || typeof body !== 'object') {
        return reply.code(400).send({ error: 'Invalid request body' });
      }

      const { name, email, directorBvn, companyName, cacRcNumber, businessTin, sector } = body;

      // Validate required fields
      if (!name || !email || !directorBvn || !companyName || !cacRcNumber || !businessTin || !sector) {
        return reply.code(400).send({
          error: 'Missing required onboarding fields: name, email, directorBvn, companyName, cacRcNumber, businessTin, sector'
        });
      }

      // Check if user or borrower already registered
      const existingUser = await db.user.findFirst({
        where: {
          OR: [
            { email },
            { bvn: directorBvn }
          ]
        },
        include: { borrowerProfile: true }
      });

      if (existingUser?.borrowerProfile) {
        return reply.code(400).send({ error: 'Borrower already registered under this email or BVN' });
      }

      // 1. Perform Compliance checks
      const bvnCheck = await complianceService.verifyBvn(directorBvn, name);
      if (!bvnCheck.success) {
        return reply.code(400).send({ error: `KYC Failed: ${bvnCheck.message}` });
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
            bvn: directorBvn,
          },
          create: {
            email,
            name,
            role: 'BORROWER',
            kycStatus: 'VERIFIED',
            bvn: directorBvn,
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
    }
  });
}
