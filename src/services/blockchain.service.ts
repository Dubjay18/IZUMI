import { createPublicClient, createWalletClient, http, parseAbi } from 'viem';
import { foundry, baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { walletService } from './wallet.service.js';

// In-memory mutex to handle nonce queueing
export class Mutex {
  private mutex = Promise.resolve();

  lock(): Promise<() => void> {
    let begin: (unlock: () => void) => void = () => {};
    this.mutex = this.mutex.then(() => new Promise(begin));
    return new Promise(res => {
      begin = res;
    });
  }
}

export class KeyedMutex {
  private locks = new Map<string, Promise<void>>();

  async lock(key: string): Promise<() => void> {
    let resolveLock: () => void = () => {};
    const newLock = new Promise<void>((resolve) => {
      resolveLock = resolve;
    });

    const currentLock = this.locks.get(key) || Promise.resolve();
    this.locks.set(key, currentLock.then(() => newLock));

    await currentLock;

    return () => {
      resolveLock();
      if (this.locks.get(key) === newLock) {
        this.locks.delete(key);
      }
    };
  }
}

// Contract Addresses (Anvil defaults from quest/README.md)
export const CONTRACTS = {
  USDC: (process.env.USDC_ADDRESS || '0x5fbdb2315678afecb367f032d93f642f64180aa3') as `0x${string}`,
  QUEST_TOKEN: (process.env.QUEST_TOKEN_ADDRESS || '0x5fc8d32690cc91d4c39d9d3abcbd16989f875707') as `0x${string}`,
  BOND_MANAGER: (process.env.BOND_MANAGER_ADDRESS || '0x2279b7a0a67db372996a5fab50d91eaa73d2ebe6') as `0x${string}`,
  REWARD_POOL: (process.env.REWARD_POOL_ADDRESS || '0xa513e6e4b8f2a923d98304ec87f64353c4d5c853') as `0x${string}`,
  DEX_ROUTER: (process.env.DEX_ROUTER_ADDRESS || '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512') as `0x${string}`,
};

// ABIs
export const ABIS = {
  ERC20: parseAbi([
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function balanceOf(address account) external view returns (uint256)',
    'function transfer(address recipient, uint256 amount) external returns (bool)'
  ]),
  QUEST_TOKEN: parseAbi([
    'function deposit(uint256 amount, uint8 tier) external returns (uint256)',
    'function withdraw(uint256 amount, address recipient) external returns (uint256)',
    'function balanceOf(address account) external view returns (uint256)'
  ]),
  BOND_MANAGER: parseAbi([
    'function createBond(address protocol, address protocolToken, uint256 usdcAmount, uint256 tokenAmount, uint8 tier, uint64 discount, uint256 vestingDays, uint8 protocolType) external',
    'function claimBond(uint256 bondId, uint256 amount) external returns (uint256)',
    'function sellBondTokens(uint256 bondId, uint256 amount, uint256 minUsdcOut, address rewardPool) external returns (uint256, uint256)',
    'function getBondStatus(uint256 bondId) external view returns (uint256, uint256, uint256, uint256)'
  ])
};

export class BlockchainService {
  public publicClient: any;
  public txMutex: Mutex;
  public userTxMutex: KeyedMutex;
  private chain: any;
  private rpcUrl: string;

  constructor() {
    this.rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
    this.chain = process.env.NODE_ENV === 'production' ? baseSepolia : foundry;
    this.txMutex = new Mutex();
    this.userTxMutex = new KeyedMutex();

    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(this.rpcUrl)
    });
  }

  /**
   * Helper to write a transaction on behalf of a user using their derivation index.
   */
  async executeUserTx(derivationIndex: number, contractAddress: `0x${string}`, abi: any, functionName: string, args: any[]) {
    const unlock = await this.userTxMutex.lock(derivationIndex.toString());
    try {
      const signer = walletService.getSignerForWallet(derivationIndex);
      
      // Auto-fund derived wallet with gas if needed
      const balance = await this.publicClient.getBalance({ address: signer.address });
      if (balance < 50000000000000000n) { // less than 0.05 ETH
        console.log(`BlockchainService: Funding address ${signer.address} with gas from hot wallet`);
        const pk = process.env.HOT_WALLET_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
        const hotAccount = privateKeyToAccount(pk as `0x${string}`);
        const hotWalletClient = createWalletClient({
          account: hotAccount,
          chain: this.chain,
          transport: http(this.rpcUrl)
        });
        const ethHash = await hotWalletClient.sendTransaction({
          to: signer.address,
          value: 200000000000000000n, // 0.2 ETH
          chain: this.chain
        });
        await this.publicClient.waitForTransactionReceipt({ hash: ethHash });
      }

      const walletClient = createWalletClient({
        account: signer,
        chain: this.chain,
        transport: http(this.rpcUrl)
      });

      const { request } = await this.publicClient.simulateContract({
        account: signer,
        address: contractAddress,
        abi,
        functionName,
        args
      });

      const hash = await walletClient.writeContract(request);
      
      // Wait for the transaction to be mined
      await this.publicClient.waitForTransactionReceipt({ hash });
      return hash;
    } finally {
      unlock();
    }
  }

  /**
   * Helper to write a transaction on behalf of the central Hot Wallet.
   * Utilizes a mutex to serialize transactions and avoid nonce collisions.
   */
  async executeHotWalletTx(contractAddress: `0x${string}`, abi: any, functionName: string, args: any[]) {
    const unlock = await this.txMutex.lock();
    try {
      // Standard local Anvil address 0 private key for testing if not set
      const pk = process.env.HOT_WALLET_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
      const hotAccount = privateKeyToAccount(pk as `0x${string}`);
      
      const walletClient = createWalletClient({
        account: hotAccount,
        chain: this.chain,
        transport: http(this.rpcUrl)
      });

      const { request } = await this.publicClient.simulateContract({
        account: hotAccount,
        address: contractAddress,
        abi,
        functionName,
        args
      });

      const hash = await walletClient.writeContract(request);
      
      // Wait for the transaction to be mined
      await this.publicClient.waitForTransactionReceipt({ hash });
      return hash;
    } finally {
      unlock();
    }
  }

  /**
   * Deposit NGN (converted to USDC) into the Quest Token Vault.
   * Steps:
   * 1. Approve QuestToken contract to spend USDC.
   * 2. Call deposit(amount, tier) on QuestToken contract.
   */
  async depositToQuest(derivationIndex: number, amountUSDC: bigint, tier: number) {
    console.log(`BlockchainService: Depositing ${Number(amountUSDC) / 1_000_000} USDC (Tier: ${tier}) to Quest for index ${derivationIndex}`);
    
    // 1. Approve USDC transfer
    await this.executeUserTx(derivationIndex, CONTRACTS.USDC, ABIS.ERC20, 'approve', [CONTRACTS.QUEST_TOKEN, amountUSDC]);
    
    // 2. Deposit to QuestToken
    const hash = await this.executeUserTx(derivationIndex, CONTRACTS.QUEST_TOKEN, ABIS.QUEST_TOKEN, 'deposit', [amountUSDC, tier]);
    return hash;
  }

  /**
   * Withdraw USDC from Quest Token Vault back to user's wallet.
   */
  async withdrawFromQuest(derivationIndex: number, amountQTK: bigint, recipientAddress: string) {
    console.log(`BlockchainService: Withdrawing ${Number(amountQTK) / 1_000_000} QTK to ${recipientAddress} for index ${derivationIndex}`);
    const hash = await this.executeUserTx(derivationIndex, CONTRACTS.QUEST_TOKEN, ABIS.QUEST_TOKEN, 'withdraw', [amountQTK, recipientAddress]);
    return hash;
  }

  /**
   * Create a Bond in Quest for a Borrower (lends USDC from Quest Vault to Borrower).
   */
  async createQuestBond(borrowerAddress: string, usdcProvided: bigint, tokenAmount: bigint, tier: number, discount: number, vestingDays: number, protocolTokenAddress: string) {
    console.log(`BlockchainService: Creating Quest Bond for borrower ${borrowerAddress}, size: ${Number(usdcProvided) / 1_000_000} USDC`);
    
    const hash = await this.executeHotWalletTx(
      CONTRACTS.BOND_MANAGER,
      ABIS.BOND_MANAGER,
      'createBond',
      [
        borrowerAddress as `0x${string}`,
        protocolTokenAddress as `0x${string}`,
        usdcProvided,
        tokenAmount,
        tier,
        BigInt(discount),
        BigInt(vestingDays),
        0 // ProtocolType.LENDING
      ]
    );

    return hash;
  }

  /**
   * Helper to transfer USDC from the central Hot Wallet to a saver/recipient.
   */
  async transferUsdcFromHotWallet(to: string, amount: bigint) {
    console.log(`BlockchainService: Transferring ${Number(amount) / 1_000_000} USDC from Hot Wallet to ${to}`);
    const hash = await this.executeHotWalletTx(
      CONTRACTS.USDC,
      ABIS.ERC20,
      'transfer',
      [to as `0x${string}`, amount]
    );
    return hash;
  }

  /**
   * Helper to fund a borrower's derived wallet with gas (ETH) and protocol tokens (Mock USDC),
   * and execute the ERC20 approve transaction from their derived wallet allowing BondManager to pull protocol tokens.
   */
  async setupBorrowerForBond(derivationIndex: number, protocolTokenAddress: `0x${string}`, tokenAmount: bigint) {
    const signer = walletService.getSignerForWallet(derivationIndex);
    const borrowerAddress = signer.address;

    // 1. Send ETH from hot wallet for gas
    const pk = process.env.HOT_WALLET_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const hotAccount = privateKeyToAccount(pk as `0x${string}`);
    const walletClient = createWalletClient({
      account: hotAccount,
      chain: this.chain,
      transport: http(this.rpcUrl)
    });

    console.log(`BlockchainService: Sending 0.2 ETH to borrower ${borrowerAddress} for gas`);
    const ethHash = await walletClient.sendTransaction({
      to: borrowerAddress,
      value: 200000000000000000n, // 0.2 ETH
      chain: this.chain
    });
    await this.publicClient.waitForTransactionReceipt({ hash: ethHash });

    // 2. Fund borrower with the protocol tokens they need to deposit/pledge for the bond
    console.log(`BlockchainService: Funding borrower ${borrowerAddress} with ${Number(tokenAmount) / 1_000_000} protocol tokens`);
    const tokenHash = await this.executeHotWalletTx(
      protocolTokenAddress,
      ABIS.ERC20,
      'transfer',
      [borrowerAddress, tokenAmount]
    );

    // 3. Approve BondManager to spend the protocol tokens from borrower account
    console.log(`BlockchainService: Approving BondManager to spend ${Number(tokenAmount) / 1_000_000} protocol tokens from borrower`);
    const approveHash = await this.executeUserTx(
      derivationIndex,
      protocolTokenAddress,
      ABIS.ERC20,
      'approve',
      [CONTRACTS.BOND_MANAGER, tokenAmount]
    );

    return { ethHash, tokenHash, approveHash };
  }

  /**
   * Deposit profit USDC into the RewardPool contract and update rewardIndex.
   */
  async depositRewardsToPool(amountUSDC: bigint) {
    console.log(`BlockchainService: Depositing ${Number(amountUSDC) / 1_000_000} USDC rewards to RewardPool`);
    // 1. Transfer USDC from hot wallet to RewardPool contract
    await this.transferUsdcFromHotWallet(CONTRACTS.REWARD_POOL, amountUSDC);
    // 2. Call depositRewards(amount) on RewardPool contract from hot wallet
    const hash = await this.executeHotWalletTx(
      CONTRACTS.REWARD_POOL,
      parseAbi(['function depositRewards(uint256 amount) external returns (uint256)']),
      'depositRewards',
      [amountUSDC]
    );
    return hash;
  }

  /**
   * Query claimable rewards from RewardPool for a user.
   */
  async getClaimableRewardsForUser(derivationIndex: number): Promise<bigint> {
    const signer = walletService.getSignerForWallet(derivationIndex);
    const data = await this.publicClient.readContract({
      address: CONTRACTS.REWARD_POOL,
      abi: parseAbi(['function getClaimableRewards(address user) external view returns (uint256)']),
      functionName: 'getClaimableRewards',
      args: [signer.address]
    });
    return BigInt(data);
  }

  /**
   * Claim rewards from RewardPool for a saver.
   */
  async claimRewardsForUser(derivationIndex: number) {
    const signer = walletService.getSignerForWallet(derivationIndex);
    console.log(`BlockchainService: Claiming rewards for user ${signer.address}`);
    const hash = await this.executeUserTx(
      derivationIndex,
      CONTRACTS.REWARD_POOL,
      parseAbi(['function claimRewards(address user) external returns (uint256)']),
      'claimRewards',
      [signer.address]
    );
    return hash;
  }

  /**
   * Settle a borrower's bond on-chain by claiming vested tokens and selling them.
   */
  async settleBond(borrowerAddress: string) {
    const bondId = await this.getLatestBondIdForBorrower(borrowerAddress);
    if (bondId === 0n) {
      console.log(`BlockchainService: No active bond found for borrower ${borrowerAddress} to settle`);
      return;
    }

    console.log(`BlockchainService: Settle bond: Found bond ID ${bondId.toString()} for borrower ${borrowerAddress}`);

    // Query flat bond details using public bonds mapping getter (prevents ABI tuple parsing issues)
    const bondData = await this.publicClient.readContract({
      address: CONTRACTS.BOND_MANAGER,
      abi: parseAbi([
        'function bonds(uint256 bondId) external view returns (uint256, address, uint256, uint8, address, uint256, uint64, uint256, uint256, uint256, uint8, uint256, uint256, uint256, bool)'
      ]),
      functionName: 'bonds',
      args: [bondId]
    });

    const usdcProvided = BigInt(bondData[5]);
    const tokenAmount = BigInt(bondData[7]);
    const tokensClaimed = BigInt(bondData[8]);
    const toClaim = tokenAmount - tokensClaimed;

    if (toClaim > 0n) {
      console.log(`BlockchainService: Claiming ${Number(toClaim) / 1_000_000} tokens for bond ${bondId}`);
      await this.executeHotWalletTx(
        CONTRACTS.BOND_MANAGER,
        ABIS.BOND_MANAGER,
        'claimBond',
        [bondId, toClaim]
      );
    }

    const tokensProcessed = BigInt(bondData[9]);
    const toProcess = tokenAmount - tokensProcessed;

    if (toProcess > 0n) {
      console.log(`BlockchainService: Processing (selling) ${Number(toProcess) / 1_000_000} tokens for bond ${bondId}`);
      // Using toProcess as minUsdcOut so the mock DEX router returns the full USDC amount
      await this.executeHotWalletTx(
        CONTRACTS.BOND_MANAGER,
        ABIS.BOND_MANAGER,
        'sellBondTokens',
        [bondId, toProcess, toProcess, CONTRACTS.REWARD_POOL]
      );
      console.log(`BlockchainService: Bond ${bondId} fully settled and principal returned to vault.`);

      // Update reward index in RewardPool on-chain with the generated discount profit
      const profit = tokenAmount - usdcProvided;
      if (profit > 0n) {
        console.log(`BlockchainService: Depositing ${Number(profit) / 1_000_000} USDC profit to RewardPool index`);
        await this.executeHotWalletTx(
          CONTRACTS.REWARD_POOL,
          parseAbi(['function depositRewards(uint256 amount) external returns (uint256)']),
          'depositRewards',
          [profit]
        );
      }
    }
  }

  /**
   * Query the latest bond ID associated with a borrower's wallet address.
   */
  async getLatestBondIdForBorrower(borrowerAddress: string): Promise<bigint> {
    const data = await this.publicClient.readContract({
      address: CONTRACTS.BOND_MANAGER,
      abi: parseAbi(['function getProtocolActiveBonds(address protocol) external view returns (uint256[] memory)']),
      functionName: 'getProtocolActiveBonds',
      args: [borrowerAddress]
    });
    if (!data || data.length === 0) return 0n;
    return BigInt(data[data.length - 1]);
  }
}

export const blockchainService = new BlockchainService();
