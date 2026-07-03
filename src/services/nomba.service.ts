import dotenv from 'dotenv';

dotenv.config();

export class NombaService {
  private apiKey: string;
  private clientId: string;
  private clientSecret: string;
  private accountId: string;
  private subAccountId: string;
  private baseUrl: string;
  private token: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.apiKey = process.env.NOMBA_API_KEY || '';
    this.clientId = process.env.NOMBA_CLIENT_ID || '';
    this.clientSecret = process.env.NOMBA_CLIENT_SECRET || '';
    this.accountId = process.env.NOMBA_ACCOUNT_ID || '';
    this.subAccountId = process.env.NOMBA_SUB_ACCOUNT_ID || '';
    // Default to sandbox URL if not provided in environment
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
   * Retrieves or refreshes the OAuth2 access token from Nomba's auth portal.
   */
  async getAccessToken(): Promise<string> {
    if (this.isMockMode()) {
      return 'mock-nomba-access-token';
    }

    // Return cached token if still valid (using a 5-minute buffer)
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry - 300000) {
      return this.token;
    }

    console.log('NombaService: Fetching new OAuth2 access token...');
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
      throw new Error(`Nomba Authentication failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as any;
    this.token = data.access_token;
    // Cache token expiration (expires_in is in seconds, convert to absolute ms)
    const expiresIn = Number(data.expires_in || 3600);
    this.tokenExpiry = Date.now() + expiresIn * 1000;

    return this.token!;
  }

  /**
   * Creates a Dedicated Virtual Account (DVA) for collection.
   */
  async createVirtualAccount(accountRef: string, accountName: string, bvn?: string) {
    if (this.isMockMode()) {
      console.warn('NombaService: Running in MOCK mode. Returning simulated Virtual Account.');
      return {
        accountNumber: `90${Math.floor(10000000 + Math.random() * 90000000)}`,
        bankName: 'Nomba Microfinance Bank',
        accountName: `IZUMI / ${accountName}`,
        reference: accountRef,
      };
    }

    const token = await this.getAccessToken();
    const url = this.subAccountId
      ? `${this.baseUrl}/accounts/virtual/${this.subAccountId}`
      : `${this.baseUrl}/accounts/virtual`;

    console.log(`NombaService: Creating Virtual Account for ${accountName} (Ref: ${accountRef})...`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accountId': this.accountId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountRef,
        accountName: `IZUMI / ${accountName}`,
        currency: 'NGN',
        bvn,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Nomba DVA creation failed: ${response.status} - ${errorText}`);
    }

    const payload = await response.json() as any;
    if (payload.code !== 'success' || !payload.data) {
      throw new Error(`Nomba DVA creation returned failure code: ${JSON.stringify(payload)}`);
    }

    return {
      accountNumber: payload.data.accountNumber,
      bankName: payload.data.bankName || 'Nomba Microfinance Bank',
      accountName: payload.data.accountName,
      reference: accountRef,
    };
  }

  /**
   * Performs a payout/transfer of Naira from merchant balance to a target bank account.
   */
  async disbursePayout(amountNGN: number, accountNumber: string, bankCode: string, accountName: string, txRef: string) {
    if (this.isMockMode()) {
      console.warn('NombaService: Running in MOCK mode. Simulating bank transfer payout.');
      return {
        status: 'SUCCESS',
        transactionId: `TX-NOMBA-${Math.floor(100000 + Math.random() * 900000)}`,
        amount: amountNGN,
        recipient: accountName,
        reference: txRef,
      };
    }

    const token = await this.getAccessToken();
    // Bank transfers are under v2 API layout
    const baseV2Url = this.baseUrl.replace('/v1', '/v2');
    const url = this.subAccountId
      ? `${baseV2Url}/transfers/bank/${this.subAccountId}`
      : `${baseV2Url}/transfers/bank`;

    console.log(`NombaService: Dispatching payout of ₦${amountNGN} to ${accountName} (${accountNumber})...`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accountId': this.accountId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountNGN,
        accountNumber,
        accountName,
        bankCode,
        merchantTxRef: txRef,
        senderName: 'IZUMI Savings Club',
        narration: 'Izumi disbursement',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Nomba transfer disbursement failed: ${response.status} - ${errorText}`);
    }

    const payload = await response.json() as any;
    return {
      status: 'SUCCESS',
      transactionId: payload.data?.transactionId || txRef,
      amount: amountNGN,
      recipient: accountName,
      reference: txRef,
    };
  }
}

export const nombaService = new NombaService();
