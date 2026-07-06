import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { db } from '../services/db.service.js';
import { blockchainService } from '../services/blockchain.service.js';

/**
 * Generates a Nomba webhook signature following the official documentation.
 * 
 * The signature is an HMAC-SHA256 hash of a colon-separated string constructed
 * from 9 specific fields, encoded in base64.
 * 
 * Ref: https://developer.nomba.com/docs/api-basics/webhook
 */
function generateNombaSignature(payload: any, secret: string, timestamp: string): string {
  const data = payload.data || {};
  const merchant = data.merchant || {};
  const transaction = data.transaction || {};

  const eventType = payload.event_type || '';
  const requestId = payload.requestId || '';
  const userId = merchant.userId || '';
  const walletId = merchant.walletId || '';
  const transactionId = transaction.transactionId || '';
  const transactionType = transaction.type || '';
  const transactionTime = transaction.time || '';
  let transactionResponseCode = transaction.responseCode || '';

  if (transactionResponseCode === 'null') {
    transactionResponseCode = '';
  }

  const hashingPayload = `${eventType}:${requestId}:${userId}:${walletId}:${transactionId}:${transactionType}:${transactionTime}:${transactionResponseCode}:${timestamp}`;

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(hashingPayload);
  return hmac.digest('base64');
}

export async function webhookRoutes(app: FastifyInstance) {
  app.post('/webhooks/nomba', async (request, reply) => {
    try {
      // ============================
      // 1. Webhook Signature Verification (Nomba Official Method)
      // ============================
      const signature = request.headers['nomba-signature'] as string;
      const nombaTimestamp = request.headers['nomba-timestamp'] as string;
      const signingKey = process.env.NOMBA_SIGNING_KEY || 'NombaHackathon2026';

      if (!signature) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('WebhookRoutes: Bypassing signature verification due to missing nomba-signature header (non-production).');
        } else {
          return reply.code(401).send({ error: 'Unauthorized: Missing nomba-signature header' });
        }
      } else {
        const payload = request.body as any;
        const timestamp = nombaTimestamp || '';

        const computedSignature = generateNombaSignature(payload, signingKey, timestamp);

        try {
          const sigBuffer = Buffer.from(signature, 'utf8');
          const computedBuffer = Buffer.from(computedSignature, 'utf8');

          // timingSafeEqual requires equal-length buffers
          if (sigBuffer.length !== computedBuffer.length) {
            console.error('WebhookRoutes: Signature length mismatch.');
            return reply.code(401).send({ error: 'Unauthorized: Invalid nomba-signature' });
          }

          const match = crypto.timingSafeEqual(sigBuffer, computedBuffer);
          if (!match) {
            console.error('WebhookRoutes: Signature verification failed.');
            return reply.code(401).send({ error: 'Unauthorized: Invalid nomba-signature' });
          }
          console.log('WebhookRoutes: Signature verified successfully.');
        } catch (err) {
          console.error('WebhookRoutes: Error verifying signature:', err);
          return reply.code(401).send({ error: 'Unauthorized: Signature comparison error' });
        }
      }

      // ============================
      // 2. Parse Payload
      // ============================
      const payload = request.body as any;

      if (!payload || typeof payload !== 'object') {
        return reply.code(400).send({ error: 'Invalid webhook payload' });
      }

      // ============================
      // 3. Idempotency Check (Nomba recommends this for replay/re-push safety)
      // ============================
      const requestId = payload.requestId as string | undefined;
      if (requestId) {
        const existing = await db.webhookLog.findFirst({
          where: {
            provider: 'nomba',
            eventType: payload.event_type || 'unknown',
            status: 'PROCESSED',
            payload: {
              path: ['requestId'],
              equals: requestId
            }
          }
        });
        if (existing) {
          console.log(`WebhookRoutes: Duplicate webhook detected (requestId: ${requestId}). Skipping.`);
          return { status: 'SUCCESS', message: 'Webhook already processed (idempotent).' };
        }
      }

      // ============================
      // 4. Log Webhook Reception
      // ============================
      const log = await db.webhookLog.create({
        data: {
          provider: 'nomba',
          eventType: payload.event_type || 'unknown',
          payload: payload,
          status: 'PENDING'
        }
      });

      // ============================
      // 5. Extract Transaction Details from Nomba Payload
      // ============================
      // Real Nomba payload nests data under: payload.data.transaction
      const transaction = payload.data?.transaction || {};
      const reference = transaction.aliasAccountReference;
      const amount = transaction.transactionAmount;

      if (!reference || amount === undefined || amount === null) {
        await db.webhookLog.update({
          where: { id: log.id },
          data: { status: 'FAILED', error: 'Missing aliasAccountReference or transactionAmount in payload.data.transaction' }
        });
        return reply.code(400).send({ error: 'Invalid webhook data: missing reference or amount in data.transaction' });
      }

      // Find the associated virtual account
      const virtualAcc = await db.virtualAccount.findUnique({
        where: { reference },
        include: {
          user: {
            include: { wallets: true }
          }
        }
      });

      if (!virtualAcc) {
        await db.webhookLog.update({
          where: { id: log.id },
          data: { status: 'FAILED', error: `No virtual account found for reference: ${reference}` }
        });
        return reply.code(404).send({ error: 'Virtual account not found for reference' });
      }

      const user = virtualAcc.user;
      if (!user) {
        await db.webhookLog.update({
          where: { id: log.id },
          data: { status: 'FAILED', error: 'No user associated with virtual account' }
        });
        return reply.code(404).send({ error: 'User not found for virtual account' });
      }

      // ============================
      // 6. Process Based on Reference Type (Saver Deposit vs Borrower Repayment)
      // ============================

      const exchangeRate = process.env.EXCHANGE_RATE ? Number(process.env.EXCHANGE_RATE) : 1500;

      if (reference.startsWith('REF-SAVER-')) {
        if (user.wallets.length === 0) {
          await db.webhookLog.update({
            where: { id: log.id },
            data: { status: 'FAILED', error: `User ${user.id} has no derived wallet index` }
          });
          return reply.code(400).send({ error: 'User wallet not generated yet.' });
        }

        const wallet = user.wallets[0];

        const amountNGN = Number(amount);
        const amountUSD = amountNGN / exchangeRate;
        
        // USDC has 6 decimals on-chain
        const amountUSDC_Micro = BigInt(Math.round(amountUSD * 1_000_000));

        if (amountUSDC_Micro <= 0n) {
          await db.webhookLog.update({
            where: { id: log.id },
            data: { status: 'FAILED', error: 'Calculated USDC deposit amount is zero' }
          });
          return reply.code(400).send({ error: 'Deposit amount too low for USD conversion.' });
        }

        console.log(`WebhookRoutes: Detected deposit of ₦${amountNGN} for user ${user.name}. Swap result: $${amountUSD} USD`);

        // Transfer USDC from central hot wallet to saver's derived address first
        await blockchainService.transferUsdcFromHotWallet(
          wallet.address,
          amountUSDC_Micro
        );

        // Execute on-chain Quest deposit
        // Default to lockup tier 0 (30 days lockup in Quest) for the MVP
        const txHash = await blockchainService.depositToQuest(
          wallet.derivationIndex,
          amountUSDC_Micro,
          0 
        );

        // Record deposit entry in local Ledger
        await db.ledger.create({
          data: {
            userId: user.id,
            amount: amountUSDC_Micro.toString(),
            type: 'DEPOSIT',
            status: 'COMPLETED',
            txHash
          }
        });

        // Update Webhook log to PROCESSED
        await db.webhookLog.update({
          where: { id: log.id },
          data: { status: 'PROCESSED' }
        });

        return {
          status: 'SUCCESS',
          message: 'Nomba deposit processed and pushed to Quest vault',
          usdDeposited: amountUSD,
          txHash
        };
      }

      else {
        // Assume borrower loan repayment (e.g. loan repayment)
        console.log(`WebhookRoutes: Received repayment of ₦${amount} from borrower business.`);
        
        // Find active loan application for borrower
        const borrower = await db.borrower.findUnique({
          where: { userId: user.id },
          include: { loanApplications: true }
        });

        if (borrower) {
          const activeLoan = borrower.loanApplications.find((loan: any) => loan.status === 'ACTIVE');
          if (activeLoan) {
            const repaymentNGN = Number(amount);
            const currentRepaid = Number(activeLoan.amountRepaid);
            const newRepaid = currentRepaid + repaymentNGN;
            const approvedAmount = Number(activeLoan.amountApproved ?? activeLoan.amountRequested);

            if (newRepaid >= approvedAmount) {
              // Update loan status to REPAID
              await db.loanApplication.update({
                where: { id: activeLoan.id },
                data: {
                  status: 'REPAID',
                  amountRepaid: newRepaid
                }
              });
              console.log(`WebhookRoutes: Loan ${activeLoan.id} fully repaid (₦${newRepaid} / ₦${approvedAmount}). Marking as REPAID.`);

              // Trigger on-chain bond settlement (claims and sells tokens, returning principal to vault)
              const borrowerWallet = user.wallets[0];
              if (borrowerWallet) {
                console.log(`WebhookRoutes: Triggering on-chain bond settlement for borrower wallet: ${borrowerWallet.address}`);
                await blockchainService.settleBond(borrowerWallet.address);
              }
            } else {
              // Record partial repayment
              await db.loanApplication.update({
                where: { id: activeLoan.id },
                data: {
                  amountRepaid: newRepaid
                }
              });
              console.log(`WebhookRoutes: Recorded partial repayment of ₦${repaymentNGN} for loan ${activeLoan.id}. Total repaid: ₦${newRepaid} / ₦${approvedAmount}`);
            }
          }
        }

        await db.webhookLog.update({
          where: { id: log.id },
          data: { status: 'PROCESSED' }
        });

        return { status: 'SUCCESS', message: 'Nomba repayment processed successfully.' };
      }

    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: `Webhook handling failed: ${(error as Error).message}` });
    }
  });
}
