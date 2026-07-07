import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// ─── Structured logging helper (GAP 16) ─────────────────────────────────────

interface NombaLogEntry {
  service: 'NombaService';
  operation: string;
  merchantTxRef?: string;
  status: 'START' | 'SUCCESS' | 'FAIL' | 'MOCK';
  detail?: string;
  timestamp: string;
}

function nombaLog(entry: Omit<NombaLogEntry, 'service' | 'timestamp'>) {
  const log: NombaLogEntry = {
    service: 'NombaService',
    timestamp: new Date().toISOString(),
    ...entry,
  };
  console.log(`[Nomba] ${log.status} ${log.operation}${log.merchantTxRef ? ` ref=${log.merchantTxRef}` : ''}${log.detail ? ` — ${log.detail}` : ''}`);
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class NombaService {
  private apiKey: string;
  private clientId: string;
  private clientSecret: string;
  private accountId: string;
  private subAccountId: string;
  private baseUrl: string;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.apiKey = process.env.NOMBA_API_KEY || '';
    this.clientId = process.env.NOMBA_CLIENT_ID || '';
    this.clientSecret = process.env.NOMBA_CLIENT_SECRET || '';
    this.accountId = process.env.NOMBA_ACCOUNT_ID || '';
    this.subAccountId = process.env.NOMBA_SUB_ACCOUNT_ID || '';
    // GAP 3: Training says sandbox.api.nomba.com, API docs say sandbox.nomba.com
    // Support both via env override, default to the training's URL
    this.baseUrl = process.env.NOMBA_BASE_URL || 'https://sandbox.nomba.com/v1';
  }

  private isMockMode(): boolean {
    return (
      !this.clientId ||
      !this.clientSecret ||
      this.clientId === 'your-nomba-client-id' ||
      this.clientSecret === 'your-nomba-client-secret' ||
      process.env.NOMBA_MOCK === 'true'
    );
  }

  /**
   * Generate a unique merchantTxRef for idempotent outbound writes.
   */
  generateMerchantTxRef(prefix: string): string {
    return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Retrieves or refreshes the OAuth2 access token from Nomba's auth portal.
   * GAP 8: Now supports refresh_token flow.
   */
  async getAccessToken(): Promise<string> {
    if (this.isMockMode()) {
      return 'mock-nomba-access-token';
    }

    // Return cached token if still valid (using a 5-minute buffer)
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry - 300000) {
      return this.token;
    }

    // Try refresh_token first if we have one
    if (this.refreshToken && this.token) {
      try {
        nombaLog({ operation: 'auth/token/refresh', status: 'START' });
        const url = `${this.baseUrl}/auth/token/refresh`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            'accountId': this.accountId,
          },
          body: JSON.stringify({
            grant_type: 'refresh_token',
            refresh_token: this.refreshToken,
          }),
        });

        if (response.ok) {
          const data = await response.json() as any;
          const authData = data.data || {};
          this.token = authData.access_token;
          this.refreshToken = authData.refresh_token || this.refreshToken;
          const expiresIn = Number(authData.expires_in || 3600);
          this.tokenExpiry = Date.now() + expiresIn * 1000;
          nombaLog({ operation: 'auth/token/refresh', status: 'SUCCESS' });
          return this.token!;
        }
        // Refresh failed, fall through to re-issue
        nombaLog({ operation: 'auth/token/refresh', status: 'FAIL', detail: 'Falling back to re-issue' });
      } catch {
        nombaLog({ operation: 'auth/token/refresh', status: 'FAIL', detail: 'Falling back to re-issue' });
      }
    }

    // Issue a fresh token
    nombaLog({ operation: 'auth/token/issue', status: 'START' });
    const url = `${this.baseUrl}/auth/token/issue`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accountId': this.accountId,
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      nombaLog({ operation: 'auth/token/issue', status: 'FAIL', detail: `${response.status} - ${errorText}` });
      throw new Error(`Nomba Authentication failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as any;
    const authData = data.data || {};
    this.token = authData.access_token;
    this.refreshToken = authData.refresh_token || null;
    // Cache token expiration (expires_in is in seconds, convert to absolute ms)
    const expiresIn = Number(authData.expires_in || 3600);
    this.tokenExpiry = Date.now() + expiresIn * 1000;

    nombaLog({ operation: 'auth/token/issue', status: 'SUCCESS', detail: `Expires in ${expiresIn}s` });
    return this.token!;
  }

  /**
   * Creates a Dedicated Virtual Account (DVA) for collection.
   * GAP 14: Now supports optional expectedAmount for over/under-payment detection.
   */
  async createVirtualAccount(accountRef: string, accountName: string, bvn?: string, expectedAmount?: number) {
    const merchantTxRef = this.generateMerchantTxRef('dva');

    if (this.isMockMode()) {
      nombaLog({ operation: 'createVirtualAccount', merchantTxRef, status: 'MOCK' });
      return {
        accountNumber: `90${Math.floor(10000000 + Math.random() * 90000000)}`,
        bankName: 'Nomba Microfinance Bank',
        accountName: `IZUMI / ${accountName}`,
        reference: accountRef,
        merchantTxRef,
        expectedAmount: expectedAmount || null,
      };
    }

    const token = await this.getAccessToken();
    const url = this.subAccountId
      ? `${this.baseUrl}/accounts/virtual/${this.subAccountId}`
      : `${this.baseUrl}/accounts/virtual`;

    nombaLog({ operation: 'createVirtualAccount', merchantTxRef, status: 'START', detail: `Name: ${accountName}` });

    const bodyPayload: any = {
      accountRef,
      accountName: `IZUMI / ${accountName}`,
      currency: 'NGN',
      bvn,
    };
    // Lock expected amount if provided (for over/under-payment handling)
    if (expectedAmount) {
      bodyPayload.amount = expectedAmount;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accountId': this.accountId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      nombaLog({ operation: 'createVirtualAccount', merchantTxRef, status: 'FAIL', detail: errorText });
      throw new Error(`Nomba DVA creation failed: ${response.status} - ${errorText}`);
    }

    const payload = await response.json() as any;
    if (payload.code !== '00' && payload.code !== 'success') {
      nombaLog({ operation: 'createVirtualAccount', merchantTxRef, status: 'FAIL', detail: JSON.stringify(payload) });
      throw new Error(`Nomba DVA creation returned failure code: ${JSON.stringify(payload)}`);
    }

    const result = {
      accountNumber: payload.data.accountNumber,
      bankName: payload.data.bankName || 'Nomba Microfinance Bank',
      accountName: payload.data.accountName,
      reference: accountRef,
      merchantTxRef,
      expectedAmount: expectedAmount || null,
    };

    nombaLog({ operation: 'createVirtualAccount', merchantTxRef, status: 'SUCCESS', detail: `Account: ${result.accountNumber}` });
    return result;
  }

  /**
   * GAP 13: Resolve an account number to a verified name before sending a transfer.
   * Training checklist: "Recipient name verified via /transfers/bank/lookup before transfers"
   */
  async lookupBankAccount(bankCode: string, accountNumber: string): Promise<{ accountName: string; bankCode: string; accountNumber: string }> {
    const merchantTxRef = this.generateMerchantTxRef('lookup');

    if (this.isMockMode()) {
      nombaLog({ operation: 'lookupBankAccount', merchantTxRef, status: 'MOCK' });
      return {
        accountName: 'Mock Account Holder',
        bankCode,
        accountNumber,
      };
    }

    const token = await this.getAccessToken();
    const baseV2Url = this.baseUrl.replace('/v1', '/v2');
    const url = `${baseV2Url}/transfers/bank/lookup`;

    nombaLog({ operation: 'lookupBankAccount', merchantTxRef, status: 'START', detail: `Bank: ${bankCode}, Acct: ${accountNumber}` });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accountId': this.accountId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bankCode, accountNumber }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      nombaLog({ operation: 'lookupBankAccount', merchantTxRef, status: 'FAIL', detail: errorText });
      throw new Error(`Nomba bank lookup failed: ${response.status} - ${errorText}`);
    }

    const payload = await response.json() as any;
    const result = {
      accountName: payload.data?.accountName || 'Unknown',
      bankCode,
      accountNumber,
    };

    nombaLog({ operation: 'lookupBankAccount', merchantTxRef, status: 'SUCCESS', detail: `Name: ${result.accountName}` });
    return result;
  }

  /**
   * Performs a payout/transfer of Naira from merchant balance to a target bank account.
   * GAP 12: Converts Naira amounts to kobo internally.
   * GAP 13: Calls lookupBankAccount first to verify recipient name.
   */
  async disbursePayout(amountNGN: number, accountNumber: string, bankCode: string, accountName: string, txRef: string) {
    const merchantTxRef = txRef || this.generateMerchantTxRef('payout');

    if (this.isMockMode()) {
      nombaLog({ operation: 'disbursePayout', merchantTxRef, status: 'MOCK', detail: `₦${amountNGN} to ${accountName}` });
      return {
        status: 'SUCCESS',
        transactionId: `TX-NOMBA-${Math.floor(100000 + Math.random() * 900000)}`,
        amount: amountNGN,
        amountKobo: amountNGN * 100,
        recipient: accountName,
        reference: merchantTxRef,
      };
    }

    // GAP 13: Verify recipient name before transferring
    nombaLog({ operation: 'disbursePayout:lookup', merchantTxRef, status: 'START', detail: `Verifying ${accountNumber} at bank ${bankCode}` });
    let verifiedName = accountName;
    try {
      const lookup = await this.lookupBankAccount(bankCode, accountNumber);
      verifiedName = lookup.accountName;
      nombaLog({ operation: 'disbursePayout:lookup', merchantTxRef, status: 'SUCCESS', detail: `Verified: ${verifiedName}` });
    } catch (lookupErr) {
      nombaLog({ operation: 'disbursePayout:lookup', merchantTxRef, status: 'FAIL', detail: `Lookup failed, proceeding with provided name: ${accountName}` });
    }

    const token = await this.getAccessToken();
    // Bank transfers are under v2 API layout
    const baseV2Url = this.baseUrl.replace('/v1', '/v2');
    const url = this.subAccountId
      ? `${baseV2Url}/transfers/bank/${this.subAccountId}`
      : `${baseV2Url}/transfers/bank`;

    // GAP 12: Convert Naira to kobo (₦1 = 100 kobo)
    const amountKobo = Math.round(amountNGN * 100);

    nombaLog({ operation: 'disbursePayout', merchantTxRef, status: 'START', detail: `₦${amountNGN} (${amountKobo} kobo) to ${verifiedName} (${accountNumber})` });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accountId': this.accountId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountKobo,
        accountNumber,
        accountName: verifiedName,
        bankCode,
        merchantTxRef,
        senderName: 'IZUMI Savings Club',
        narration: 'Izumi disbursement',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      nombaLog({ operation: 'disbursePayout', merchantTxRef, status: 'FAIL', detail: errorText });
      throw new Error(`Nomba transfer disbursement failed: ${response.status} - ${errorText}`);
    }

    const payload = await response.json() as any;
    nombaLog({ operation: 'disbursePayout', merchantTxRef, status: 'SUCCESS', detail: `TxID: ${payload.data?.transactionId || merchantTxRef}` });

    return {
      status: 'SUCCESS',
      transactionId: payload.data?.transactionId || merchantTxRef,
      amount: amountNGN,
      amountKobo,
      recipient: verifiedName,
      reference: merchantTxRef,
    };
  }

  /**
   * GAP 6: Verify a transaction by reference after receiving a webhook.
   * Training: "Always verify transactions before providing goods or services — even if you received a webhook."
   */
  async verifyTransaction(transactionRef: string): Promise<{ verified: boolean; status: string; amount: number }> {
    if (this.isMockMode()) {
      nombaLog({ operation: 'verifyTransaction', status: 'MOCK', detail: `Ref: ${transactionRef}` });
      return { verified: true, status: 'SUCCESS', amount: 0 };
    }

    const token = await this.getAccessToken();
    const url = `${this.baseUrl}/transactions/accounts/single?transactionRef=${encodeURIComponent(transactionRef)}`;

    nombaLog({ operation: 'verifyTransaction', status: 'START', detail: `Ref: ${transactionRef}` });

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accountId': this.accountId,
        },
      });

      if (!response.ok) {
        nombaLog({ operation: 'verifyTransaction', status: 'FAIL', detail: `HTTP ${response.status}` });
        return { verified: false, status: 'HTTP_ERROR', amount: 0 };
      }

      const payload = await response.json() as any;
      const txStatus = payload.data?.status || 'UNKNOWN';
      const txAmount = Number(payload.data?.amount || 0);

      const verified = txStatus === 'SUCCESS' || txStatus === 'PAYMENT_SUCCESSFUL';
      nombaLog({ operation: 'verifyTransaction', status: verified ? 'SUCCESS' : 'FAIL', detail: `Status: ${txStatus}, Amount: ${txAmount}` });

      return { verified, status: txStatus, amount: txAmount };
    } catch (err) {
      nombaLog({ operation: 'verifyTransaction', status: 'FAIL', detail: (err as Error).message });
      return { verified: false, status: 'ERROR', amount: 0 };
    }
  }

  /**
   * GAP 15: Reconciliation helper — fetch transactions from Nomba for a date range.
   * Training: "Pull the transactions endpoint nightly, diff against your local ledger."
   */
  async fetchTransactions(dateFrom: string, dateTo: string): Promise<any[]> {
    if (this.isMockMode()) {
      nombaLog({ operation: 'fetchTransactions', status: 'MOCK', detail: `${dateFrom} → ${dateTo}` });
      return [];
    }

    const token = await this.getAccessToken();
    const url = `${this.baseUrl}/transactions?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}&status=success`;

    nombaLog({ operation: 'fetchTransactions', status: 'START', detail: `${dateFrom} → ${dateTo}` });

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accountId': this.accountId,
        },
      });

      if (!response.ok) {
        nombaLog({ operation: 'fetchTransactions', status: 'FAIL', detail: `HTTP ${response.status}` });
        return [];
      }

      const payload = await response.json() as any;
      const transactions = payload.data?.transactions || payload.data?.results || [];

      nombaLog({ operation: 'fetchTransactions', status: 'SUCCESS', detail: `Found ${transactions.length} transactions` });
      return transactions;
    } catch (err) {
      nombaLog({ operation: 'fetchTransactions', status: 'FAIL', detail: (err as Error).message });
      return [];
    }
  }
}

export const nombaService = new NombaService();
