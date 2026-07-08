import dotenv from 'dotenv';
dotenv.config();

import { db } from './services/db.service.js';
import { walletService } from './services/wallet.service.js';
import { cryptoService } from './services/crypto.service.js';
import { blockchainService, CONTRACTS } from './services/blockchain.service.js';

async function seed() {
  console.log('=== STARTING TEST ACCOUNT SEEDING ===');

  try {
    const saverEmail = 'jejeniyi7+23@gmail.com';
    const borrowerEmail = 'jejeniyi7+34@gmail.com';

    // 1. Clean existing records for these two accounts to ensure run idempotency
    console.log('Cleaning existing records for seed emails...');
    
    const existingSaver = await db.user.findUnique({ where: { email: saverEmail } });
    if (existingSaver) {
      await db.user.delete({ where: { id: existingSaver.id } });
      console.log(`Deleted existing saver user: ${saverEmail}`);
    }

    const existingBorrower = await db.user.findUnique({ where: { email: borrowerEmail } });
    if (existingBorrower) {
      await db.user.delete({ where: { id: existingBorrower.id } });
      console.log(`Deleted existing borrower user: ${borrowerEmail}`);
    }

    // 2. Seed Saver: Lionel Messi
    console.log('\nCreating Saver (Lionel Messi)...');
    
    const encryptedSaverBvn = cryptoService.encrypt('22222222222');
    const encryptedSaverNin = cryptoService.encrypt('33333333333');

    const saverUser = await db.user.create({
      data: {
        email: saverEmail,
        name: 'Lionel messi',
        role: 'SAVER',
        kycStatus: 'VERIFIED',
        bvn: encryptedSaverBvn,
        nin: encryptedSaverNin,
      }
    });

    console.log(`Created User record for Saver: ${saverUser.id}`);

    // Create wallet for Saver
    const saverWallet = await walletService.createWalletForUser(saverUser.id);
    console.log(`Derived Wallet for Saver: ${saverWallet.address} (Index: ${saverWallet.derivationIndex})`);

    // Create Virtual Account for Saver
    const saverVirtualAccount = await db.virtualAccount.create({
      data: {
        userId: saverUser.id,
        accountNumber: '9011223344',
        bankName: 'Nomba Microfinance Bank',
        accountName: `IZUMI Lionel messi`,
        reference: 'REF-SAVER-MESSY',
        status: 'ACTIVE'
      }
    });
    console.log(`Created Virtual Account for Saver: ${saverVirtualAccount.accountNumber}`);

    // On-Chain Funding for Saver
    // Messi has deposits of $100, $300, $100 ($500 total) and withdrawal of $50.
    // Net is $450 USDC (450,000,000 micro-USDC).
    const saverOnChainAmount = 450000000n; 
    let saverTxHash = '0xmockdeposit3txhashmessy';

    try {
      console.log(`[On-Chain] Funding Saver wallet ${saverWallet.address} with ${Number(saverOnChainAmount) / 1_000_000} USDC...`);
      await blockchainService.transferUsdcFromHotWallet(saverWallet.address, saverOnChainAmount);
      
      console.log(`[On-Chain] Depositing ${Number(saverOnChainAmount) / 1_000_000} USDC to Quest Token Vault for index ${saverWallet.derivationIndex}...`);
      saverTxHash = await blockchainService.depositToQuest(saverWallet.derivationIndex, saverOnChainAmount, 0);
      console.log(`[On-Chain] Saver deposit completed. Tx Hash: ${saverTxHash}`);
    } catch (err: any) {
      console.warn(`[On-Chain] Saver wallet funding/deposit bypassed or failed: ${err.message}`);
    }

    // Create Ledger entries (Deposits, Yields, Withdrawals)
    console.log('Seeding Saver Ledger history...');
    
    // Deposit 1
    await db.ledger.create({
      data: {
        userId: saverUser.id,
        amount: '100000000', // $100 USD (6 decimals)
        type: 'DEPOSIT',
        status: 'COMPLETED',
        txHash: '0xmockdeposit1txhashmessy',
        createdAt: new Date('2026-06-01T10:00:00Z'),
      }
    });

    // Deposit 2
    await db.ledger.create({
      data: {
        userId: saverUser.id,
        amount: '300000000', // $300 USD
        type: 'DEPOSIT',
        status: 'COMPLETED',
        txHash: '0xmockdeposit2txhashmessy',
        createdAt: new Date('2026-06-10T12:00:00Z'),
      }
    });

    // Yield 1
    await db.ledger.create({
      data: {
        userId: saverUser.id,
        amount: '2500000', // $2.50 USD
        type: 'YIELD',
        status: 'COMPLETED',
        txHash: '0xmockyield1txhashmessy',
        createdAt: new Date('2026-06-15T00:00:00Z'),
      }
    });

    // Deposit 3 (Linked to the final on-chain deposit transaction hash if successful)
    await db.ledger.create({
      data: {
        userId: saverUser.id,
        amount: '100000000', // $100 USD
        type: 'DEPOSIT',
        status: 'COMPLETED',
        txHash: saverTxHash,
        createdAt: new Date('2026-06-20T08:00:00Z'),
      }
    });

    // Yield 2
    await db.ledger.create({
      data: {
        userId: saverUser.id,
        amount: '7850000', // $7.85 USD
        type: 'YIELD',
        status: 'COMPLETED',
        txHash: '0xmockyield2txhashmessy',
        createdAt: new Date('2026-06-30T00:00:00Z'),
      }
    });

    // Withdrawal 1
    await db.ledger.create({
      data: {
        userId: saverUser.id,
        amount: '50000000', // $50.00 USD
        type: 'WITHDRAWAL',
        status: 'COMPLETED',
        txHash: '0xmockwithdrawal1txhashmessy',
        createdAt: new Date('2026-07-02T14:30:00Z'),
      }
    });

    // Yield 3
    await db.ledger.create({
      data: {
        userId: saverUser.id,
        amount: '4200000', // $4.20 USD
        type: 'YIELD',
        status: 'COMPLETED',
        txHash: '0xmockyield3txhashmessy',
        createdAt: new Date('2026-07-05T00:00:00Z'),
      }
    });

    console.log('Saver seeding completed successfully.');

    // 3. Seed Borrower: Gojo Satoru
    console.log('\nCreating Borrower (Gojo Satoru)...');
    
    const encryptedBorrowerBvn = cryptoService.encrypt('11111111111');

    const borrowerUser = await db.user.create({
      data: {
        email: borrowerEmail,
        name: 'Gojo satoru',
        role: 'BORROWER',
        kycStatus: 'VERIFIED',
        bvn: encryptedBorrowerBvn,
      }
    });

    console.log(`Created User record for Borrower: ${borrowerUser.id}`);

    // Create wallet for Borrower
    const borrowerWallet = await walletService.createWalletForUser(borrowerUser.id);
    console.log(`Derived Wallet for Borrower: ${borrowerWallet.address} (Index: ${borrowerWallet.derivationIndex})`);

    // Create Borrower Profile
    const borrowerProfile = await db.borrower.create({
      data: {
        userId: borrowerUser.id,
        companyName: 'Gojo Jujutsu Corp',
        cacRcNumber: 'RC-998877',
        businessTin: 'TIN-9988776',
        sector: 'Education',
        kybStatus: 'VERIFIED',
        creditScore: 820,
        creditGrade: 'A',
        approvedLimit: 5000000, // ₦5,000,000 NGN
        splitIntensity: 15, // 15%
        terminals: ['NOMBA-POS-JUJUTSU-1', 'NOMBA-POS-JUJUTSU-2'],
      }
    });
    console.log(`Created Borrower Profile: ${borrowerProfile.id}`);

    // Create Virtual Account for Borrower Repayment
    const borrowerVirtualAccount = await db.virtualAccount.create({
      data: {
        borrowerId: borrowerProfile.id,
        accountNumber: '9022334455',
        bankName: 'Nomba Microfinance Bank',
        accountName: `IZUMI / Repay / Gojo satoru`,
        reference: 'REF-REPAY-GOJO',
        status: 'ACTIVE'
      }
    });
    console.log(`Created Repayment Virtual Account for Borrower: ${borrowerVirtualAccount.accountNumber}`);

    // On-Chain Quest Bond creation for Borrower Gojo Satoru (representing active loan)
    // Gojo active loan is ₦600k NGN. At 1500 NGN/USDC, it is $400 USDC (400,000,000 micro-USDC).
    const activeLoanUSDC_Micro = 400000000n;
    const backingTokenAmount = (activeLoanUSDC_Micro * 130n) / 100n; // 1.3x collateral
    let bondTxHash = '0xmockcontractbondidforactivegojoloan';

    try {
      console.log(`[On-Chain] Setting up borrower Gojo ${borrowerWallet.address} for bond creation...`);
      await blockchainService.setupBorrowerForBond(
        borrowerWallet.derivationIndex,
        CONTRACTS.USDC,
        backingTokenAmount
      );

      console.log(`[On-Chain] Creating Quest Bond for Gojo...`);
      bondTxHash = await blockchainService.createQuestBond(
        borrowerWallet.address,
        activeLoanUSDC_Micro,
        backingTokenAmount,
        0, // Tier 0
        3000, // 30% discount
        30, // 30 vesting days
        CONTRACTS.USDC
      );
      console.log(`[On-Chain] Quest Bond created. Tx Hash: ${bondTxHash}`);
    } catch (err: any) {
      console.warn(`[On-Chain] Gojo Quest Bond creation bypassed or failed: ${err.message}`);
    }

    // Create Loan Applications
    console.log('Seeding Borrower Loan applications...');
    
    // Loan 1: Repaid
    await db.loanApplication.create({
      data: {
        borrowerId: borrowerProfile.id,
        amountRequested: 350000,
        amountApproved: 350000,
        interestRate: 8,
        termDays: 30,
        status: 'REPAID',
        amountRepaid: 350000,
        createdAt: new Date('2026-05-01T10:00:00Z'),
        updatedAt: new Date('2026-05-31T17:00:00Z'),
      }
    });

    // Loan 2: Active (Linked to on-chain bondTxHash)
    const activeLoan = await db.loanApplication.create({
      data: {
        borrowerId: borrowerProfile.id,
        amountRequested: 600000,
        amountApproved: 600000,
        interestRate: 10,
        termDays: 30,
        status: 'ACTIVE',
        amountRepaid: 200000, // Partial repayment
        contractBondId: bondTxHash,
        createdAt: new Date('2026-06-25T11:00:00Z'),
        updatedAt: new Date('2026-07-05T15:00:00Z'),
      }
    });
    console.log(`Created Active Loan: ${activeLoan.id}`);

    // Loan 3: Pending
    await db.loanApplication.create({
      data: {
        borrowerId: borrowerProfile.id,
        amountRequested: 1200000,
        termDays: 60,
        status: 'PENDING',
        createdAt: new Date('2026-07-07T09:30:00Z'),
      }
    });

    // Loan 4: Rejected
    await db.loanApplication.create({
      data: {
        borrowerId: borrowerProfile.id,
        amountRequested: 3000000,
        termDays: 30,
        status: 'REJECTED',
        createdAt: new Date('2026-05-15T14:00:00Z'),
        aiAnalysis: {
          strengths: ['High average ticket size'],
          weaknesses: ['High monthly revenue volatility', 'Exceeds dynamic limit capacity'],
          businessTips: ['Request smaller initial facilities to build credit trust.']
        }
      }
    });

    // Create Webhook Logs representing daily POS card split sweeps
    console.log('Seeding POS sweep WebhookLogs...');
    
    // Sweep 1: ₦50,000 NGN
    await db.webhookLog.create({
      data: {
        provider: 'NOMBA',
        eventType: 'payment_success',
        status: 'PROCESSED',
        createdAt: new Date('2026-06-28T18:00:00Z'),
        payload: {
          event_type: 'payment_success',
          requestId: 'req-gojo-sweep-1',
          data: {
            transaction: {
              transactionId: 'tx-gojo-sweep-1',
              transactionAmount: 50000,
              aliasAccountReference: 'REF-REPAY-GOJO'
            }
          }
        }
      }
    });

    // Sweep 2: ₦75,000 NGN
    await db.webhookLog.create({
      data: {
        provider: 'NOMBA',
        eventType: 'payment_success',
        status: 'PROCESSED',
        createdAt: new Date('2026-07-01T18:30:00Z'),
        payload: {
          event_type: 'payment_success',
          requestId: 'req-gojo-sweep-2',
          data: {
            transaction: {
              transactionId: 'tx-gojo-sweep-2',
              transactionAmount: 75000,
              aliasAccountReference: 'REF-REPAY-GOJO'
            }
          }
        }
      }
    });

    // Sweep 3: ₦75,000 NGN
    await db.webhookLog.create({
      data: {
        provider: 'NOMBA',
        eventType: 'payment_success',
        status: 'PROCESSED',
        createdAt: new Date('2026-07-05T15:00:00Z'),
        payload: {
          event_type: 'payment_success',
          requestId: 'req-gojo-sweep-3',
          data: {
            transaction: {
              transactionId: 'tx-gojo-sweep-3',
              transactionAmount: 75000,
              aliasAccountReference: 'REF-REPAY-GOJO'
            }
          }
        }
      }
    });

    console.log('Borrower seeding completed successfully.');
    console.log('\n=== SEEDING COMPLETED SUCCESSFULLY! ===');

  } catch (error) {
    console.error('❌ SEEDING FAILED:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
    process.exit(0);
  }
}

seed();
