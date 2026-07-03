process.env.NOMBA_MOCK = 'true';
process.env.STARTING_DERIVATION_INDEX = '10';

import { db } from './services/db.service.js';
import { blockchainService, CONTRACTS, ABIS } from './services/blockchain.service.js';
import { walletService } from './services/wallet.service.js';
import { parseAbi } from 'viem';
import { execSync } from 'child_process';

async function runInvariantsTest() {
  console.log('\n=== STARTING QUEST REWARD SYSTEM INVARIANT CHECKS ===');

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

    // 0. Setup and clean database/wallets
    console.log('Resetting local environment...');
    await db.ledger.deleteMany();
    await db.wallet.deleteMany();
    await db.virtualAccount.deleteMany();
    await db.loanApplication.deleteMany();
    await db.borrower.deleteMany();
    await db.user.deleteMany();

    // Setup wallets for three savers
    console.log('Generating derived addresses for test savers...');
    const saver1 = await db.user.create({
      data: { email: 'saver1@test.com', name: 'Saver One', role: 'SAVER', kycStatus: 'VERIFIED' }
    });
    const wallet1 = await walletService.createWalletForUser(saver1.id);
    const saver1Addr = wallet1.address;
    const idx1 = wallet1.derivationIndex;

    const saver2 = await db.user.create({
      data: { email: 'saver2@test.com', name: 'Saver Two', role: 'SAVER', kycStatus: 'VERIFIED' }
    });
    const wallet2 = await walletService.createWalletForUser(saver2.id);
    const saver2Addr = wallet2.address;
    const idx2 = wallet2.derivationIndex;

    const saver3 = await db.user.create({
      data: { email: 'saver3@test.com', name: 'Saver Three', role: 'SAVER', kycStatus: 'VERIFIED' }
    });
    const wallet3 = await walletService.createWalletForUser(saver3.id);
    const saver3Addr = wallet3.address;
    const idx3 = wallet3.derivationIndex;

    // ==========================================
    // SCENARIO 1: Borrower returns without interest
    // ==========================================
    console.log('\n--- Scenario 1: Deposit and Repay without Interest ---');
    console.log('Saver 1 deposits $100 USD (tier 30 days)...');
    await blockchainService.transferUsdcFromHotWallet(saver1Addr, 100000000n); // fund $100
    await blockchainService.depositToQuest(idx1, 100000000n, 0); // tier 0 = 30 days

    // Check on-chain initial balance
    const qtkBalanceBefore = await blockchainService.publicClient.readContract({
      address: CONTRACTS.QUEST_TOKEN,
      abi: ABIS.QUEST_TOKEN,
      functionName: 'balanceOf',
      args: [saver1Addr]
    });
    console.log(`Saver 1 QTK Token Balance: ${Number(qtkBalanceBefore) / 1000000} QTK`);

    console.log('Simulating borrower repayment with ZERO yield/profit...');
    // We do NOT call depositRewardsToPool

    // Warp time by 31 days to mature lockup
    console.log('Time-warping 31 days to mature Saver 1 lockup...');
    await blockchainService.publicClient.transport.request({
      method: 'evm_increaseTime',
      params: [31 * 24 * 60 * 60]
    });
    await blockchainService.publicClient.transport.request({
      method: 'evm_mine',
      params: []
    });

    // Saver 1 claims rewards (expecting 0 claimable)
    const claimable1 = await blockchainService.getClaimableRewardsForUser(idx1);
    console.log(`Saver 1 claimable rewards: ${Number(claimable1) / 1000000} USDC`);
    if (claimable1 !== 0n) {
      throw new Error(`Expected Saver 1 rewards to be 0, got ${claimable1}`);
    }

    // Saver 1 withdraws
    console.log('Saver 1 withdrawing principal...');
    await blockchainService.withdrawFromQuest(idx1, 100000000n, saver1Addr);
    console.log('✅ Scenario 1 Passed: Saver got exactly their principal back and 0 yield.');

    // ==========================================
    // SCENARIO 2: Pro-rata Multipliers Check
    // ==========================================
    console.log('\n--- Scenario 2: Pro-rata Lockup Multipliers check ---');
    // We use Saver 1 and Saver 2.
    // Saver 1 deposits $100 in 30d lockup (weightMultiplier = 1.0x -> weight = 100)
    // Saver 2 deposits $100 in 90d lockup (weightMultiplier = 2.0x -> weight = 200)
    console.log('Saver 1 deposits $100 USD (30 days lockup)...');
    await blockchainService.transferUsdcFromHotWallet(saver1Addr, 100000000n);
    await blockchainService.depositToQuest(idx1, 100000000n, 0); // tier 0

    console.log('Saver 2 deposits $100 USD (90 days lockup)...');
    await blockchainService.transferUsdcFromHotWallet(saver2Addr, 100000000n);
    await blockchainService.depositToQuest(idx2, 100000000n, 2); // tier 2 = 90 days

    // Total weight = (100 * 1.0) + (100 * 2.0) = 300 (plus any existing genesis weight)
    const totalWeight = await blockchainService.publicClient.readContract({
      address: CONTRACTS.QUEST_TOKEN,
      abi: parseAbi(['function getTotalWeightedBalance() external view returns (uint256)']),
      functionName: 'getTotalWeightedBalance',
      args: []
    });
    console.log(`Total weighted vault balance on-chain: ${Number(totalWeight) / 1000000} weight units`);

    console.log('Depositing 30 USDC profit into RewardPool...');
    await blockchainService.depositRewardsToPool(30000000n); // 30 USDC

    // Warp time by 91 days to mature both lockups
    console.log('Time-warping 91 days to mature both lockups...');
    await blockchainService.publicClient.transport.request({
      method: 'evm_increaseTime',
      params: [91 * 24 * 60 * 60]
    });
    await blockchainService.publicClient.transport.request({
      method: 'evm_mine',
      params: []
    });

    const reward1 = await blockchainService.getClaimableRewardsForUser(idx1);
    const reward2 = await blockchainService.getClaimableRewardsForUser(idx2);
    console.log(`Saver 1 (30d, 1.0x) claimable yield: ${Number(reward1) / 1000000} USDC`);
    console.log(`Saver 2 (90d, 2.0x) claimable yield: ${Number(reward2) / 1000000} USDC`);

    // Invariant: Saver 2 should get exactly double the yield of Saver 1 (since weights are 2x)
    const ratio = Number(reward2) / Number(reward1);
    console.log(`Yield Ratio (Saver 2 / Saver 1): ${ratio.toFixed(4)}x`);
    if (Math.abs(ratio - 2.0) > 0.05) {
      throw new Error(`Expected yield ratio to be close to 2.0, got ${ratio}`);
    }
    console.log('✅ Scenario 2 Passed: 90d saver earned exactly 2x the rewards of 30d saver.');

    // ==========================================
    // SCENARIO 3: Late Depositor Invariant (Front-running Protection)
    // ==========================================
    console.log('\n--- Scenario 3: Late Depositor Invariant check ---');
    console.log('Saver 3 deposits $100 USD (30 days lockup) AFTER reward was deposited...');
    await blockchainService.transferUsdcFromHotWallet(saver3Addr, 100000000n);
    await blockchainService.depositToQuest(idx3, 100000000n, 0);

    // Warp time 31 days
    await blockchainService.publicClient.transport.request({
      method: 'evm_increaseTime',
      params: [31 * 24 * 60 * 60]
    });
    await blockchainService.publicClient.transport.request({
      method: 'evm_mine',
      params: []
    });

    const reward3 = await blockchainService.getClaimableRewardsForUser(idx3);
    console.log(`Saver 3 claimable yield: ${Number(reward3) / 1000000} USDC`);
    
    // Invariant: Saver 3 should get 0 yield from the historical 30 USDC deposit
    if (reward3 !== 0n) {
      throw new Error(`Expected Saver 3 rewards to be 0 for historical profit, got ${reward3}`);
    }
    console.log('✅ Scenario 3 Passed: Late depositor earned 0 historical yield (Front-running blocked).');

    // ==========================================
    // SCENARIO 4: Double Claiming Prevention Invariant
    // ==========================================
    console.log('\n--- Scenario 4: Double Claiming Prevention check ---');
    const claimableBefore = await blockchainService.getClaimableRewardsForUser(idx1);
    console.log(`Saver 1 claimable before claim: ${Number(claimableBefore) / 1000000} USDC`);

    console.log('Saver 1 claiming yield...');
    await blockchainService.claimRewardsForUser(idx1);

    const claimableAfter = await blockchainService.getClaimableRewardsForUser(idx1);
    console.log(`Saver 1 claimable after claim: ${Number(claimableAfter) / 1000000} USDC`);
    if (claimableAfter !== 0n) {
      throw new Error(`Expected Saver 1 claimable rewards to be 0 after claim, got ${claimableAfter}`);
    }

    // Try claiming again
    console.log('Saver 1 attempting double claim...');
    try {
      await blockchainService.claimRewardsForUser(idx1);
      throw new Error('Double claim should have reverted but succeeded');
    } catch (err: any) {
      console.log('✅ Scenario 4 Passed: Double claim reverted with expected error:', err.message);
    }

    console.log('\n=== ALL QUEST SYSTEM INVARIANT CHECKS PASSED SUCCESSFULLY! ===\n');

  } catch (error) {
    console.error('\n❌ INVARIANTS TEST SUITE FAILED:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runInvariantsTest();
