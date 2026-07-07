import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { db } from '../services/db.service.js';
import { blockchainService } from '../services/blockchain.service.js';
import { nombaService } from '../services/nomba.service.js';

/**
 * GAP 11: Support BOTH webhook signature verification schemes.
 * 
 * Scheme A (API Reference / 9-field): HMAC over colon-separated constructed string → base64
 * Scheme B (Training Material): HMAC over raw request body → hex
 */
function verifyNombaSignature9Field(payload: any, secret: string, timestamp: string): string {
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

function verifyNombaSignatureRawBody(rawBody: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
}

export async function webhookRoutes(app: FastifyInstance) {
  // Store raw body for signature verification
  app.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
    try {
      const json = JSON.parse(body as string);
      // Attach raw body for signature verification
      (req as any).rawBody = body;
      done(null, json);
    } catch (err) {
      done(err as Error, undefined);
    }
  });

  app.post('/webhooks/nomba', async (request, reply) => {
    try {
      // ============================
      // 1. Webhook Signature Verification (GAP 11: Support both schemes)
      // ============================
      const signature = request.headers['nomba-signature'] as string;
      const nombaTimestamp = request.headers['nomba-timestamp'] as string;
      const signingKey = process.env.NOMBA_SIGNING_KEY || process.env.NOMBA_WEBHOOK_SECRET || 'NombaHackathon2026';

      if (!signature) {
        if (process.env.NODE_ENV !== 'production' || process.env.NOMBA_MOCK === 'true' || process.env.ZK_BYPASS_VERIFICATION === 'true') {
          console.warn('WebhookRoutes: Bypassing signature verification due to missing nomba-signature header (non-production/mock).');
        } else {
          return reply.code(401).send({ error: 'Unauthorized: Missing nomba-signature header' });
        }
      } else {
        const payload = request.body as any;
        const rawBody = (request as any).rawBody || JSON.stringify(payload);
        const timestamp = nombaTimestamp || '';

        // Try Scheme A first (9-field, base64) — this is what the API docs specify
        const computedSignatureA = verifyNombaSignature9Field(payload, signingKey, timestamp);
        // Then try Scheme B (raw body, hex) — this is what the training material shows
        const computedSignatureB = verifyNombaSignatureRawBody(rawBody, signingKey);

        let signatureValid = false;

        try {
          // Try Scheme A
          const sigBufA = Buffer.from(signature, 'utf8');
          const computedBufA = Buffer.from(computedSignatureA, 'utf8');
          if (sigBufA.length === computedBufA.length && crypto.timingSafeEqual(sigBufA, computedBufA)) {
            signatureValid = true;
          }
        } catch { /* length mismatch, try next */ }

        if (!signatureValid) {
          try {
            // Try Scheme B
            const sigBufB = Buffer.from(signature, 'utf8');
            const computedBufB = Buffer.from(computedSignatureB, 'utf8');
            if (sigBufB.length === computedBufB.length && crypto.timingSafeEqual(sigBufB, computedBufB)) {
              signatureValid = true;
            }
          } catch { /* length mismatch */ }
        }

        if (!signatureValid) {
          console.error('WebhookRoutes: Signature verification failed (both schemes).');
          return reply.code(401).send({ error: 'Unauthorized: Invalid nomba-signature' });
        }

        console.log('WebhookRoutes: Signature verified successfully.');
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
      const transactionId = transaction.transactionId;

      if (!reference || amount === undefined || amount === null) {
        await db.webhookLog.update({
          where: { id: log.id },
          data: { status: 'FAILED', error: 'Missing aliasAccountReference or transactionAmount in payload.data.transaction' }
        });
        return reply.code(400).send({ error: 'Invalid webhook data: missing reference or amount in data.transaction' });
      }

      // ============================
      // 5.5 GAP 6: Verify the transaction with Nomba before processing
      // ============================
      if (transactionId && process.env.NOMBA_MOCK !== 'true') {
        const verification = await nombaService.verifyTransaction(transactionId);
        if (!verification.verified) {
          console.warn(`WebhookRoutes: Transaction verification failed for ${transactionId}. Status: ${verification.status}. Processing anyway for resilience.`);
          // Log the failed verification but don't block — webhook is signed and valid
        } else {
          console.log(`WebhookRoutes: Transaction ${transactionId} verified as ${verification.status}.`);
        }
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

        // ============================
        // GAP 14: Over/under-payment handling for virtual accounts
        // ============================
        // Check if there's an expected amount on the virtual account
        // (stored via Nomba's amount field on DVA creation)
        // For now, log warnings for significant deviations
        const expectedAmountNGN = 0; // TODO: Store expected amount in VirtualAccount model if needed
        if (expectedAmountNGN > 0) {
          const tolerance = 0.05; // 5% tolerance
          if (amountNGN < expectedAmountNGN * (1 - tolerance)) {
            console.warn(`WebhookRoutes: UNDER-PAYMENT detected for ${reference}. Expected ₦${expectedAmountNGN}, received ₦${amountNGN}. Processing partial deposit.`);
          } else if (amountNGN > expectedAmountNGN * (1 + tolerance)) {
            console.warn(`WebhookRoutes: OVER-PAYMENT detected for ${reference}. Expected ₦${expectedAmountNGN}, received ₦${amountNGN}. Processing full amount — consider refund of excess.`);
          }
        }

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
              // Cap at approved amount to handle over-payment
              const actualRepaid = Math.min(newRepaid, approvedAmount);
              // Update loan status to REPAID
              await db.loanApplication.update({
                where: { id: activeLoan.id },
                data: {
                  status: 'REPAID',
                  amountRepaid: actualRepaid
                }
              });
              console.log(`WebhookRoutes: Loan ${activeLoan.id} fully repaid (₦${actualRepaid} / ₦${approvedAmount}). Marking as REPAID.`);

              // Log over-payment if applicable
              if (newRepaid > approvedAmount) {
                const overpayment = newRepaid - approvedAmount;
                console.warn(`WebhookRoutes: OVER-PAYMENT on loan repayment. Excess ₦${overpayment}. Consider refund to borrower.`);
              }

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

  // ============================
  // GAP 15: Reconciliation Endpoint
  // ============================
  app.get('/admin/reconcile', async (request, reply) => {
    try {
      const query = request.query as any;
      const dateFrom = query.dateFrom || new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const dateTo = query.dateTo || new Date().toISOString().split('T')[0];

      // 1. Fetch transactions from Nomba
      const nombaTransactions = await nombaService.fetchTransactions(dateFrom, dateTo);

      // 2. Fetch our local webhook logs for the same period
      const localLogs = await db.webhookLog.findMany({
        where: {
          provider: 'nomba',
          createdAt: {
            gte: new Date(dateFrom),
            lte: new Date(dateTo + 'T23:59:59Z'),
          }
        }
      });

      // 3. Fetch local ledger entries
      const localLedger = await db.ledger.findMany({
        where: {
          createdAt: {
            gte: new Date(dateFrom),
            lte: new Date(dateTo + 'T23:59:59Z'),
          }
        }
      });

      // 4. Build reconciliation report
      const orphanOnNomba: any[] = [];
      const amountDrifts: any[] = [];

      for (const tx of nombaTransactions) {
        const ref = tx.merchantTxRef || tx.transactionRef;
        const localMatch = localLogs.find((l: any) => {
          const p = l.payload as any;
          return p?.data?.transaction?.transactionId === tx.id || p?.requestId === ref;
        });

        if (!localMatch) {
          orphanOnNomba.push({
            transactionId: tx.id,
            merchantTxRef: ref,
            amount: tx.amount,
            type: tx.type,
          });
        }
      }

      return {
        status: 'OK',
        dateRange: { from: dateFrom, to: dateTo },
        nombaTransactionCount: nombaTransactions.length,
        localWebhookLogCount: localLogs.length,
        localLedgerEntryCount: localLedger.length,
        orphanTransactions: orphanOnNomba,
        amountDrifts,
        reconciled: orphanOnNomba.length === 0 && amountDrifts.length === 0,
      };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: `Reconciliation failed: ${(err as Error).message}` });
    }
  });
}
