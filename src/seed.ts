import { db } from './services/db.service.js';
import { cryptoService } from './services/crypto.service.js';
import { walletService } from './services/wallet.service.js';

export async function seedDatabase() {
  const email = 'demo@izumi.finance';
  console.log(`Starting DB Seed for master demo account: ${email}...`);

  // 1. Clean up existing demo user to allow rerun
  const existingUser = await db.user.findUnique({
    where: { email },
    include: { borrowerProfile: true }
  });

  if (existingUser) {
    console.log('Cleaning up existing demo user data...');
    await db.user.delete({ where: { id: existingUser.id } });
  }

  // 2. Create Master User (SAVER + BORROWER attributes)
  const bvnRaw = '22233344455';
  const encryptedBvn = cryptoService.encrypt(bvnRaw);
  
  const user = await db.user.create({
    data: {
      email,
      name: 'Oreoluwa Osibajo',
      phoneNumber: '+2348012345678',
      role: 'SAVER',
      kycStatus: 'VERIFIED',
      bvn: encryptedBvn,
    }
  });

  console.log(`Created user record with ID: ${user.id}`);

  // 3. Derive Wallet for User
  await walletService.createWalletForUser(user.id, db);
  const wallet = await db.wallet.findFirst({
    where: { userId: user.id }
  });
  console.log(`Derived wallet address: ${wallet?.address} (index: ${wallet?.derivationIndex})`);

  // 4. Create Virtual Account for Saver Collection Ingress
  const saverVirtualRef = `REF-DEMO-SAVER-${Math.floor(100000 + Math.random() * 900000)}`;
  const saverVirtualAcc = await db.virtualAccount.create({
    data: {
      userId: user.id,
      accountNumber: '9034567891',
      bankName: 'Nomba Microfinance Bank',
      accountName: 'IZUMI Oreoluwa Osibajo',
      reference: saverVirtualRef,
      status: 'ACTIVE'
    }
  });
  console.log(`Created Saver virtual account: ${saverVirtualAcc.accountNumber}`);

  // 5. Seed Saver Ledger History & Yield Lockups
  console.log('Seeding Saver deposits, withdrawals, and locked positions...');
  
  // Deposit 1: Matured Position (₦150,000 locked 35 days ago)
  const deposit1Time = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000);
  await db.ledger.create({
    data: {
      userId: user.id,
      amount: '150000000', // 150.00 USDC in micros
      type: 'DEPOSIT',
      status: 'COMPLETED',
      txHash: '0x32a0dfd894b429e98b531aac7868368000000001',
      createdAt: deposit1Time
    }
  });

  // Deposit 2: Mid-way Matured Position (₦100,000 locked 15 days ago, 50% progress)
  const deposit2Time = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
  await db.ledger.create({
    data: {
      userId: user.id,
      amount: '100000000', // 100.00 USDC in micros
      type: 'DEPOSIT',
      status: 'COMPLETED',
      txHash: '0x32a0dfd894b429e98b531aac7868368000000002',
      createdAt: deposit2Time
    }
  });

  // Deposit 3: Recently Locked Position (₦50,000 locked 2 days ago, ~6% progress)
  const deposit3Time = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  await db.ledger.create({
    data: {
      userId: user.id,
      amount: '50000000', // 50.00 USDC in micros
      type: 'DEPOSIT',
      status: 'COMPLETED',
      txHash: '0x32a0dfd894b429e98b531aac7868368000000003',
      createdAt: deposit3Time
    }
  });

  // Seed historic Yield payouts in Ledger
  await db.ledger.create({
    data: {
      userId: user.id,
      amount: '18500000', // 18.50 USDC accrued yield
      type: 'YIELD',
      status: 'COMPLETED',
      txHash: '0x32a0dfd894b429e98b531aac7868368000000004',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  });

  // 6. Create Borrower Profile for "Izumi Bakery"
  console.log('Seeding Borrower profile...');
  const borrower = await db.borrower.create({
    data: {
      userId: user.id,
      companyName: 'Izumi Bakery',
      cacRcNumber: 'RCCJND35',
      businessTin: '238U28U035',
      sector: 'Food & Beverage',
      kybStatus: 'VERIFIED',
      creditScore: 780,
      creditGrade: 'B',
      approvedLimit: '2500000', // ₦2.5 Million approved limit
      splitIntensity: 15,
      terminals: ['TERM-NOMBA-9923', 'TERM-NOMBA-9924']
    }
  });

  // Create Borrower Virtual Account (for repayments)
  const borrowerVirtualRef = `REF-DEMO-BORROWER-${Math.floor(100000 + Math.random() * 900000)}`;
  const borrowerVirtualAcc = await db.virtualAccount.create({
    data: {
      borrowerId: borrower.id,
      accountNumber: '9034567892',
      bankName: 'Nomba Microfinance Bank',
      accountName: 'IZUMI Bakery Repayments',
      reference: borrowerVirtualRef,
      status: 'ACTIVE'
    }
  });
  console.log(`Created Borrower virtual account: ${borrowerVirtualAcc.accountNumber}`);

  // 7. Seed Active Borrower Loan Application & Repayments
  console.log('Seeding Active Loan and POS repayment sweeps...');
  const loanCreatedAt = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  const loan = await db.loanApplication.create({
    data: {
      borrowerId: borrower.id,
      amountRequested: '1000000', // ₦1 Million
      amountApproved: '1000000',
      interestRate: '10.5',
      termDays: 30,
      status: 'ACTIVE',
      creditScore: 780,
      creditGrade: 'B',
      contractBondId: '0x032a0dfd894b429e98b531aac7868368',
      amountRepaid: '160000', // ₦160,000 repaid total
      aiAnalysis: {
        strengths: [
          'High retail inventory turnover rate in Food & Beverage sector.',
          'Consistently healthy cashflows over 90 days POS ledger tracking.'
        ],
        weaknesses: [
          'Small concentration of capital in daily morning peak times.',
          'Operating margins hover close to the industry average.'
        ],
        businessTips: [
          'Maintain a stable operating reserve during mid-week slumps.',
          'Increase card sweeps margin to speed up maturity and lower premium rates.'
        ]
      } as any,
      createdAt: loanCreatedAt,
      updatedAt: new Date()
    }
  });

  // Seed daily processed WebhookLogs for repayments sweeps
  const sweepAmounts = [60000, 45000, 30000, 25000]; // sum = ₦160,000
  for (let i = 0; i < sweepAmounts.length; i++) {
    const sweepTime = new Date(loanCreatedAt.getTime() + (i + 1) * 2 * 24 * 60 * 60 * 1000);
    const txId = `TXN-SWEEP-${Math.floor(100000 + Math.random() * 900000)}`;
    
    await db.webhookLog.create({
      data: {
        provider: 'NOMBA',
        eventType: 'collection.payment',
        status: 'PROCESSED',
        payload: {
          data: {
            transaction: {
              transactionId: txId,
              transactionAmount: sweepAmounts[i],
              aliasAccountReference: borrowerVirtualRef
            }
          }
        } as any,
        createdAt: sweepTime
      }
    });
  }

  console.log('✅ DB Seeding completed successfully!');
}
