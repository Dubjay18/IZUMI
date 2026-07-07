/**
 * Bridge ETH to Optimism Sepolia via plain ETH transfer to the OptimismPortal.
 * 
 * The OptimismPortal's receive() function automatically creates a deposit 
 * transaction that credits the sender's address on L2.
 * 
 * Portal address: 0x16Fc5058F25648194471939df75CF27A2fdC48BC
 * Source: viem/chains → optimismSepolia.contracts.portal['11155111']
 * Verified: 4112 chars bytecode, paused=false
 */
import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import dotenv from 'dotenv';

dotenv.config();

const OP_SEPOLIA_PORTAL = '0x16Fc5058F25648194471939df75CF27A2fdC48BC' as const;

async function main() {
  const pk = process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) { console.error('DEPLOYER_PRIVATE_KEY not set'); process.exit(1); }

  const account = privateKeyToAccount(pk as `0x${string}`);
  console.log(`Deployer: ${account.address}`);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http('https://ethereum-sepolia.publicnode.com')
  });

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http('https://ethereum-sepolia.publicnode.com')
  });

  const balance = await publicClient.getBalance({ address: account.address });
  const balEth = Number(balance) / 1e18;
  console.log(`L1 balance: ${balEth.toFixed(6)} ETH`);

  // Bridge 0.005 ETH, keep rest for gas
  const depositAmount = parseEther('0.005');
  if (balance < depositAmount + parseEther('0.001')) {
    console.error('Insufficient balance');
    process.exit(1);
  }

  console.log(`Sending 0.005 ETH to OptimismPortal at ${OP_SEPOLIA_PORTAL}...`);

  try {
    const hash = await walletClient.sendTransaction({
      to: OP_SEPOLIA_PORTAL,
      value: depositAmount,
    });
    console.log(`Tx: ${hash}`);
    console.log('Waiting for L1 confirmation...');

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`\n--- Receipt ---`);
    console.log(`Status: ${receipt.status}`);
    console.log(`Gas used: ${receipt.gasUsed}`);
    console.log(`Logs: ${receipt.logs.length}`);

    if (receipt.status !== 'success') {
      console.error('FAILED: Transaction reverted');
      process.exit(1);
    }

    console.log(`\nSUCCESS! 0.005 ETH sent to OP Sepolia portal.`);
    console.log(`Funds should arrive on L2 in 1-20 minutes.`);
    console.log(`Monitor: https://sepolia-optimism.etherscan.io/address/${account.address}`);
  } catch (err: any) {
    console.error('Error:', err.shortMessage || err.message);
    process.exit(1);
  }
}

main();
