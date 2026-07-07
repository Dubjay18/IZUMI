import { createPublicClient, http, parseAbi } from 'viem';
import { sepolia } from 'viem/chains';

const PORTAL = '0x16Fc5058F25648194471939df75CF27A2fdC48BC';
const BRIDGE = '0xFBb0621E0B23b5478B630BD55a5f21f67730B0F1';

const client = createPublicClient({ chain: sepolia, transport: http('https://ethereum-sepolia.publicnode.com') });

async function main() {
  // Check portal bytecode
  const portalCode = await client.getCode({ address: PORTAL });
  console.log('Portal bytecode length:', portalCode?.length ?? 0);

  // Check if portal is paused
  try {
    const paused = await client.readContract({
      address: PORTAL,
      abi: parseAbi(['function paused() view returns (bool)']),
      functionName: 'paused',
    });
    console.log('Portal paused:', paused);
  } catch (e: any) { console.log('Portal paused() error:', e.shortMessage || e.message); }

  // Check bridge's messenger address
  try {
    const messenger = await client.readContract({
      address: BRIDGE,
      abi: parseAbi(['function messenger() view returns (address)']),
      functionName: 'messenger',
    });
    console.log('Bridge messenger:', messenger);
  } catch (e: any) { console.log('Bridge messenger() error:', e.shortMessage || e.message); }

  // Check the portal's guardian
  try {
    const guardian = await client.readContract({
      address: PORTAL,
      abi: parseAbi(['function guardian() view returns (address)']),
      functionName: 'guardian',
    });
    console.log('Portal guardian:', guardian);
  } catch (e: any) { console.log('Portal guardian() error:', e.shortMessage || e.message); }
}

main();
