import { mnemonicToAccount } from 'viem/accounts';
import { db as globalDb } from './db.service.js';

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

export class WalletService {
  private masterMnemonic: string;
  public registrationMutex: Mutex;

  constructor() {
    this.registrationMutex = new Mutex();
    this.masterMnemonic = process.env.MASTER_MNEMONIC || '';

    if (!this.masterMnemonic) {
      console.warn('WalletService: MASTER_MNEMONIC is not set in environment variables. Wallet operations will fail.');
      return;
    }

    const wordCount = this.masterMnemonic.split(' ').length;
    if (wordCount < 12) {
      throw new Error(`Invalid MASTER_MNEMONIC: expected at least 12 words, got ${wordCount}.`);
    }
  }

  /**
   * Generates a new deposit address and records it in the database.
   * Supports an optional transaction client to make user registration atomic.
   */
  async createWalletForUser(userId: string, tx?: any) {
    if (!this.masterMnemonic) {
      throw new Error('WalletService: MASTER_MNEMONIC is not configured.');
    }

    const prisma = tx || globalDb;

    // Find the next derivation index
    const lastWallet = await prisma.wallet.findFirst({
      orderBy: { derivationIndex: 'desc' },
    });

    const startIdx = process.env.STARTING_DERIVATION_INDEX ? parseInt(process.env.STARTING_DERIVATION_INDEX) : 10;
    const nextIndex = lastWallet ? lastWallet.derivationIndex + 1 : startIdx;

    // Standard derivation path: m/44'/60'/0'/0/{index}
    const account = mnemonicToAccount(this.masterMnemonic, {
      addressIndex: nextIndex,
    });

    // Save and return wallet details
    const wallet = await prisma.wallet.create({
      data: {
        userId,
        address: account.address.toLowerCase(),
        derivationIndex: nextIndex,
      },
    });

    console.log(`WalletService: Wallet created for user: ${userId}, address: ${wallet.address}, index: ${nextIndex}`);

    return {
      id: wallet.id,
      address: wallet.address,
      derivationIndex: wallet.derivationIndex,
    };
  }

  /**
   * Helper to retrieve the signer object for a wallet by derivation index.
   * Keeps the private key in memory temporarily.
   */
  getSignerForWallet(derivationIndex: number) {
    if (!this.masterMnemonic) {
      throw new Error('WalletService: MASTER_MNEMONIC is not configured.');
    }
    return mnemonicToAccount(this.masterMnemonic, {
      addressIndex: derivationIndex,
    });
  }

  /**
   * Predicts the next derivation index and address.
   */
  async getNextDerivationAddress() {
    if (!this.masterMnemonic) {
      throw new Error('WalletService: MASTER_MNEMONIC is not configured.');
    }
    const lastWallet = await globalDb.wallet.findFirst({
      orderBy: { derivationIndex: 'desc' },
    });
    const startIdx = process.env.STARTING_DERIVATION_INDEX ? parseInt(process.env.STARTING_DERIVATION_INDEX) : 10;
    const nextIndex = lastWallet ? lastWallet.derivationIndex + 1 : startIdx;
    const account = mnemonicToAccount(this.masterMnemonic, {
      addressIndex: nextIndex,
    });
    return account.address.toLowerCase();
  }
}

export const walletService = new WalletService();
