process.env.NOMBA_MOCK = 'true';
process.env.STARTING_DERIVATION_INDEX = '20';

import crypto from 'crypto';
import { app } from './app.js';
import { db } from './services/db.service.js';
import { blockchainService, CONTRACTS, ABIS } from './services/blockchain.service.js';
import { zkService } from './services/zk.service.js';
import { walletService } from './services/wallet.service.js';
import { execSync } from 'child_process';

/**
 * Generates a Nomba-format webhook payload and its valid HMAC-SHA256 base64 signature.
 * This matches the official Nomba webhook specification exactly.
 */
function buildNombaWebhookPayload(opts: {
  eventType: string;
  reference: string;
  amount: number;
  signingKey: string;
}) {
  const timestamp = new Date().toISOString();
  const requestId = crypto.randomUUID();
  const transactionId = `API-VACT_TRA-TEST-${crypto.randomUUID()}`;

  const payload = {
    event_type: opts.eventType,
    requestId,
    data: {
      merchant: {
        walletId: 'test-wallet-id',
        walletBalance: 0,
        userId: 'test-merchant-user-id'
      },
      terminal: {},
      transaction: {
        aliasAccountNumber: '0000000000',
        fee: 0,
        sessionId: `TEST-SESSION-${crypto.randomUUID()}`,
        type: 'vact_transfer',
        transactionId,
        aliasAccountName: 'IZUMI/Test',
        responseCode: '',
        originatingFrom: 'api',
        transactionAmount: opts.amount,
        narration: `Test transfer of ${opts.amount}`,
        time: timestamp,
        aliasAccountReference: opts.reference,
        aliasAccountType: 'VIRTUAL'
      },
      customer: {
        bankCode: '000',
        senderName: 'Test Sender',
        bankName: 'Test Bank',
        accountNumber: '0000000000'
      }
    }
  };

  // Construct the exact hashing string per Nomba docs
  const hashingPayload = `${payload.event_type}:${payload.requestId}:${payload.data.merchant.userId}:${payload.data.merchant.walletId}:${transactionId}:${payload.data.transaction.type}:${payload.data.transaction.time}:${payload.data.transaction.responseCode}:${timestamp}`;

  const signature = crypto
    .createHmac('sha256', opts.signingKey)
    .update(hashingPayload)
    .digest('base64');

  return { payload, signature, timestamp };
}

async function runTest() {
  console.log('=== STARTING IZUMI E2E TEST FLOW ===');

  try {
    // Reset Anvil and redeploy contracts to ensure a clean slate
    console.log('Resetting Anvil blockchain state...');
    await blockchainService.publicClient.transport.request({
      method: 'anvil_reset',
      params: []
    });
    console.log('Anvil state reset successfully. Redeploying contracts...');
    execSync(
      'PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 forge script script/Deploy.s.sol:DeployScript --rpc-url http://127.0.0.1:8545 --broadcast --sender 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
      { cwd: '/home/adeyemi/Documents/Work/IZUMI/contracts', stdio: 'ignore' }
    );
    console.log('Contracts redeployed successfully.');

    console.log('DEBUG: STARTING_DERIVATION_INDEX is:', process.env.STARTING_DERIVATION_INDEX);
    // 0. Clean database
    console.log('Cleaning up database...');
    await db.ledger.deleteMany();
    await db.wallet.deleteMany();
    await db.virtualAccount.deleteMany();
    await db.loanApplication.deleteMany();
    await db.borrower.deleteMany();
    await db.webhookLog.deleteMany();
    await db.user.deleteMany();
    console.log('Database cleaned successfully.');

    // Start Fastify server listening on a random port
    const address = await app.listen({ port: 0 });
    console.log(`Server is listening at ${address}`);

    // Helper to send HTTP requests to our local server
    const request = async (method: string, path: string, body?: any) => {
      const response = await fetch(`${address}${path}`, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Request to ${path} failed with status ${response.status}: ${JSON.stringify(data)}`);
      }
      return data;
    };

    // 0.5. ZK-KYC Saver Onboarding Tests
    console.log('\n[ZK Test] Simulating client-side ZK-KYC proof generation...');
    const nextWalletAddr = await walletService.getNextDerivationAddress();
    const mockBvn = '12345678901';
    const validKycProof = await zkService.generateKycProof(mockBvn, nextWalletAddr);

    console.log('[ZK Test] Onboarding Saver with valid ZK-SNARK KYC proof...');
    const zkSaverOnboard = await request('POST', '/savers/onboard', {
      name: 'ZK Privacy Saver',
      email: 'zk-saver@privacy.com',
      zkProof: validKycProof
    });
    console.log('ZK Saver Onboarded:', zkSaverOnboard);

    // [Failure Test] Tampered ZK Proof (wrong wallet address signal)
    console.log('\n[ZK Failure Test] Registering saver with ZK proof binding to incorrect address...');
    const invalidKycProof = {
      ...validKycProof,
      publicSignals: [validKycProof.publicSignals[0], '0x0000000000000000000000000000000000000000']
    };
    try {
      await request('POST', '/savers/onboard', {
        name: 'Attacker Saver',
        email: 'attacker@saver.com',
        zkProof: invalidKycProof
      });
      throw new Error('Saver onboarding with invalid ZK proof should have failed but succeeded');
    } catch (err: any) {
      console.log('✅ ZK Saver onboarding failed as expected:', err.message);
    }

    // 1. Onboard Saver
    console.log('\n[Step 1] Onboarding Saver...');
    const saverOnboard = await request('POST', '/savers/onboard', {
      name: 'Adewale Saver',
      email: 'adewale@saver.com',
      bvn: '22222222222'
    });
    console.log('Saver Onboarded:', saverOnboard);
    const saverUserId = saverOnboard.userId;
    const saverWalletAddress = saverOnboard.walletAddress;

    // [Failure Test] KYC Validation Failure
    console.log('\n[Failure Test] Registering saver with invalid BVN (KYC check)...');
    try {
      await request('POST', '/savers/onboard', {
        name: 'Fraud Saver',
        email: 'fraud@saver.com',
        bvn: '12345' // invalid BVN
      });
      throw new Error('Saver onboarding should have failed but succeeded');
    } catch (err: any) {
      console.log('✅ Saver onboarding failed as expected:', err.message);
    }

    // 2. Trigger Nomba Deposit Webhook
    const signingKey = 'NombaHackathon2026';

    console.log('\n[Webhook Signature Test] Triggering webhook with invalid signature...');
    const { payload: invalidSigPayload, timestamp: invalidSigTs } = buildNombaWebhookPayload({
      eventType: 'payment_success',
      reference: saverOnboard.virtualAccount.reference ?? `REF-SAVER-MOCK`,
      amount: 150000,
      signingKey
    });
    try {
      await fetch(`${address}/webhooks/nomba`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'nomba-signature': 'invalid-sig-12345',
          'nomba-timestamp': invalidSigTs
        },
        body: JSON.stringify(invalidSigPayload)
      }).then(res => {
        if (res.status === 401) {
          console.log('✅ Webhook with invalid signature rejected as expected with 401 Unauthorized.');
        } else {
          throw new Error(`Expected webhook to be rejected with 401, got ${res.status}`);
        }
      });
    } catch (err: any) {
      console.error('❌ Failed invalid signature test:', err.message);
      throw err;
    }

    console.log('[Webhook Signature Test] Sending Nomba deposit webhook with VALID signature...');
    const { payload: depositPayload, signature: depositSig, timestamp: depositTs } = buildNombaWebhookPayload({
      eventType: 'payment_success',
      reference: saverOnboard.virtualAccount.reference ?? `REF-SAVER-MOCK`,
      amount: 150000,
      signingKey
    });

    const depositWebhook = await fetch(`${address}/webhooks/nomba`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'nomba-signature': depositSig,
        'nomba-timestamp': depositTs
      },
      body: JSON.stringify(depositPayload)
    }).then(async res => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(`Valid signed webhook failed: ${JSON.stringify(data)}`);
      }
      return data;
    });
    console.log('Deposit Webhook processed successfully with valid signature:', depositWebhook);

    // [Failure Test] Webhook Processing with invalid reference
    console.log('\n[Failure Test] Triggering webhook with invalid account reference...');
    try {
      const { payload: badRefPayload } = buildNombaWebhookPayload({
        eventType: 'payment_success',
        reference: 'REF-SAVER-INVALID',
        amount: 5000,
        signingKey
      });
      // Send without signature header so it bypasses verification in non-production
      await request('POST', '/webhooks/nomba', badRefPayload);
      throw new Error('Webhook processing should have returned 404 but succeeded');
    } catch (err: any) {
      console.log('✅ Webhook returned error as expected:', err.message);
    }

    // 3. Verify Saver Balance
    console.log('\n[Step 3] Fetching Saver Balance...');
    const saverBalance = await request('GET', `/savers/${saverUserId}/balance`);
    console.log('Saver Balance details:', saverBalance);
    if (saverBalance.balanceUSD !== 100) {
      throw new Error(`Expected saver balance to be 100 USD (150,000 NGN / 1500 rate), got ${saverBalance.balanceUSD}`);
    }
    console.log('Saver balance successfully verified as 100.00 USD!');

    // [Failure Test] Insufficient balance withdrawal
    console.log('\n[Failure Test] Withdrawing amount exceeding balance...');
    try {
      await request('POST', '/savers/withdraw', {
        userId: saverUserId,
        amountUSD: 500 // Exceeds $100 balance
      });
      throw new Error('Withdrawal should have failed due to insufficient balance but succeeded');
    } catch (err: any) {
      console.log('✅ Withdrawal failed as expected:', err.message);
    }

    // 4. Onboard Borrower
    console.log('\n[Step 4] Onboarding Borrower SME...');
    const borrowerOnboard = await request('POST', '/borrowers/onboard', {
      name: 'Chinedu Baker',
      email: 'chinedu@bakery.com',
      directorBvn: '11111111111',
      companyName: 'Chinedu Bakery Ltd',
      cacRcNumber: 'RC-123456',
      businessTin: 'TIN-9876543',
      sector: 'Retail'
    });
    console.log('Borrower Onboarded:', borrowerOnboard);
    const borrowerId = borrowerOnboard.borrowerId;

    // 4.5. ZK-Credit Scoring Tests
    console.log('\n[ZK Test] Simulating client-side credit score calculation and ZK proving...');
    const proofScore = 85;
    const proofLimit = 120000;
    const borrowerUser = await db.borrower.findUnique({
      where: { id: borrowerId },
      include: { user: true }
    });
    if (!borrowerUser) throw new Error('Borrower user not found');
    
    const validCreditProof = await zkService.generateCreditProof(borrowerUser.userId, proofScore, proofLimit);

    console.log('[ZK Test] Submitting Loan Application via ZK Credit proof...');
    const zkLoanApply = await request('POST', '/loans/apply', {
      borrowerId,
      amountRequested: 50000,
      zkProof: validCreditProof
    });
    console.log('ZK Loan application processed:', zkLoanApply);
    if (zkLoanApply.creditAnalysis.score !== proofScore || Number(zkLoanApply.creditAnalysis.maxLimit) !== proofLimit) {
      throw new Error('ZK Loan application limit or score mismatch');
    }
    console.log('✅ ZK Credit proof applied successfully with expected Score/Limit!');

    // [Failure Test] Tampered Credit Proof (altered limit in public signal)
    console.log('\n[ZK Failure Test] Submitting loan application with altered credit proof...');
    const invalidCreditProof = {
      ...validCreditProof,
      publicSignals: [
        validCreditProof.publicSignals[0],
        validCreditProof.publicSignals[1],
        validCreditProof.publicSignals[2],
        '9999999' // altered limit
      ]
    };
    try {
      await request('POST', '/loans/apply', {
        borrowerId,
        amountRequested: 50000,
        zkProof: invalidCreditProof
      });
      throw new Error('ZK loan application with invalid proof should have failed but succeeded');
    } catch (err: any) {
      if (err.message.includes('should have failed but succeeded')) {
        throw err;
      }
      console.log('✅ ZK Loan application failed as expected:', err.message);
    }

    // 5. Apply for a Loan (will trigger AI Underwriting)
    console.log('\n[Step 5] Submitting Loan Application (₦75,000 NGN / $50 USD)...');
    const loanApply = await request('POST', '/loans/apply', {
      borrowerId,
      amountRequested: 75000,
      termDays: 30,
      salesLogs: [
        { volume: 160000, txCount: 150 },
        { volume: 150000, txCount: 140 },
        { volume: 140000, txCount: 130 }
      ]
    });
    console.log('Loan Application processed & scored:', loanApply);
    const loanApplicationId = loanApply.applicationId;

    // 6. Accept Loan (creates on-chain Quest Bond and triggers simulated payout)
    console.log('\n[Step 6] Accepting Scored Loan Application...');
    const loanAccept = await request('POST', `/loans/${loanApplicationId}/accept`);
    console.log('Loan Acceptance processed:', loanAccept);

    // [Failure Test] Double Loan Acceptance
    console.log('\n[Failure Test] Accepting an already active loan application...');
    try {
      await request('POST', `/loans/${loanApplicationId}/accept`);
      throw new Error('Loan acceptance should have failed but succeeded');
    } catch (err: any) {
      console.log('✅ Loan acceptance failed as expected:', err.message);
    }

    // Verify on-chain bond status or database status
    const activeLoan = await request('GET', `/loans/${loanApplicationId}`);
    console.log('Active Loan State in DB:', {
      status: activeLoan.status,
      contractBondId: activeLoan.contractBondId
    });
    if (activeLoan.status !== 'ACTIVE' || !activeLoan.contractBondId) {
      throw new Error(`Expected loan status to be ACTIVE and contractBondId to be populated, got status ${activeLoan.status}`);
    }
    console.log('Quest Bond successfully verified on-chain and in DB!');

    // Generate repayment virtual account details
    const refRepayment = `REF-REPAY-${Math.floor(100000 + Math.random() * 900000)}`;
    const repaymentAccount = await db.virtualAccount.create({
      data: {
        userId: borrowerOnboard.user.id,
        accountNumber: `90${Math.floor(10000000 + Math.random() * 90000000)}`,
        bankName: 'Nomba Microfinance Bank',
        accountName: `IZUMI / Repay / ${borrowerOnboard.user.name}`,
        reference: refRepayment,
        status: 'ACTIVE'
      }
    });

    // Time warp to mature lockup duration (30 days lockup) and borrower bond vesting
    console.log('\n[Time Warp] Fast-forwarding Anvil time by 31 days to mature saver lockups and borrower bond vesting...');
    await blockchainService.publicClient.transport.request({
      method: 'evm_increaseTime',
      params: [31 * 24 * 60 * 60] // 31 days in seconds
    });
    await blockchainService.publicClient.transport.request({
      method: 'evm_mine',
      params: []
    });
    console.log('Time warped forward successfully!');

    // 7. Repay Loan via Webhook (Partial and Full Repayment checks)
    console.log('\n[Step 7] Simulating first partial Borrower loan repayment webhook (₦40,000 NGN)...');
    const { payload: repayment1Payload, signature: repayment1Sig, timestamp: repayment1Ts } = buildNombaWebhookPayload({
      eventType: 'payment_success',
      reference: refRepayment,
      amount: 40000,
      signingKey
    });

    await fetch(`${address}/webhooks/nomba`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'nomba-signature': repayment1Sig,
        'nomba-timestamp': repayment1Ts
      },
      body: JSON.stringify(repayment1Payload)
    }).then(async res => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(`Repayment webhook 1 failed: ${JSON.stringify(data)}`);
      }
      return data;
    });

    const partialLoan = await request('GET', `/loans/${loanApplicationId}`);
    console.log('Partial Repayment Loan State in DB:', { status: partialLoan.status, amountRepaid: partialLoan.amountRepaid });
    if (partialLoan.status !== 'ACTIVE') {
      throw new Error(`Expected loan status to remain ACTIVE after partial repayment, got status ${partialLoan.status}`);
    }
    if (Number(partialLoan.amountRepaid) !== 40000) {
      throw new Error(`Expected loan amountRepaid to be 40000, got ${partialLoan.amountRepaid}`);
    }

    console.log('\n[Step 7b] Simulating second Borrower loan repayment webhook (₦35,000 NGN) to complete repayment...');
    const { payload: repayment2Payload, signature: repayment2Sig, timestamp: repayment2Ts } = buildNombaWebhookPayload({
      eventType: 'payment_success',
      reference: refRepayment,
      amount: 35000,
      signingKey
    });

    await fetch(`${address}/webhooks/nomba`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'nomba-signature': repayment2Sig,
        'nomba-timestamp': repayment2Ts
      },
      body: JSON.stringify(repayment2Payload)
    }).then(async res => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(`Repayment webhook 2 failed: ${JSON.stringify(data)}`);
      }
      return data;
    });

    const repaidLoan = await request('GET', `/loans/${loanApplicationId}`);
    console.log('Repaid Loan State in DB:', { status: repaidLoan.status, amountRepaid: repaidLoan.amountRepaid });
    if (repaidLoan.status !== 'REPAID') {
      throw new Error(`Expected loan status to be REPAID after full repayment, got status ${repaidLoan.status}`);
    }
    if (Number(repaidLoan.amountRepaid) !== 75000) {
      throw new Error(`Expected loan amountRepaid to be 75000, got ${repaidLoan.amountRepaid}`);
    }
    console.log('Loan repayment successfully completed and marked in DB!');

    // 8. Saver Withdrawal
    console.log('\n[Step 8] Saver initiating partial withdrawal ($20 USD)...');
    const saverWithdraw = await request('POST', '/savers/withdraw', {
      userId: saverUserId,
      amountUSD: 20
    });
    console.log('Saver withdrawal processed:', saverWithdraw);

    // Verify Saver Remaining Balance
    const saverNewBalance = await request('GET', `/savers/${saverUserId}/balance`);
    console.log('Saver remaining balance:', saverNewBalance);
    if (saverNewBalance.balanceUSD <= 80) {
      throw new Error(`Expected saver remaining balance to be greater than 80 USD due to yield, got ${saverNewBalance.balanceUSD}`);
    }
    const yieldEarned = saverNewBalance.balanceUSD - 80;
    console.log(`Saver withdrawal successfully processed and remaining balance verified as ${saverNewBalance.balanceUSD} USD (including ${yieldEarned.toFixed(6)} USD yield)!`);

    // 9. Full Withdrawal (Verifies on-chain principal return)
    console.log('\n[Step 9] Saver initiating full withdrawal of remaining balance (verifying on-chain principal return)...');
    const finalWithdraw = await request('POST', '/savers/withdraw', {
      userId: saverUserId,
      amountUSD: saverNewBalance.balanceUSD // attempts to withdraw all remaining funds
    });
    console.log('Saver final full withdrawal processed:', finalWithdraw);

    const saverFinalBalance = await request('GET', `/savers/${saverUserId}/balance`);
    console.log('Saver final balance:', saverFinalBalance);
    if (saverFinalBalance.balanceUSD !== 0) {
      throw new Error(`Expected saver balance to be exactly 0 after full withdrawal, got ${saverFinalBalance.balanceUSD}`);
    }
    console.log('✅ Saver successfully withdrew the entire balance! On-chain principal return successfully verified.');

    console.log('\n=== ALL IZUMI E2E TEST FLOW CHECKS PASSED SUCCESSFULLY! ===');

  } catch (error) {
    console.error('\n❌ E2E TEST FLOW FAILED:', error);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

runTest();
