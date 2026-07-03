import { FastifyInstance } from 'fastify';
import { db } from '../services/db.service.js';
import { complianceService } from '../services/compliance.service.js';
import { walletService } from '../services/wallet.service.js';
import { zkService } from '../services/zk.service.js';

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
}
