// ─── Typed API client — all backend calls go through here ────────────────────

const BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, data?.error ?? `Request failed: ${res.status}`);
  }

  return data as T;
}

// ─── Saver endpoints ──────────────────────────────────────────────────────────

import type {
  SaverOnboardResponse,
  BalanceResponse,
  LedgerEntry,
  WithdrawResponse,
} from "./types";

export const saverApi = {
  onboard: (body: {
    name: string;
    email: string;
    bvn?: string;
    nin?: string;
    zkProof?: object;
  }) =>
    request<SaverOnboardResponse>("/savers/onboard", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getBalance: (userId: string) =>
    request<BalanceResponse>(`/savers/${userId}/balance`),

  getLedger: (userId: string) =>
    request<LedgerEntry[]>(`/savers/${userId}/ledger`),

  withdraw: (body: { userId: string; amountUSD: number }) =>
    request<WithdrawResponse>("/savers/withdraw", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getNextAddress: () =>
    request<{ address: string }>("/savers/next-address"),

  triggerMockDepositWebhook: (accountNumber: string, amountNGN: number, reference: string) =>
    request<{ message: string; txHash: string }>("/webhooks/nomba", {
      method: "POST",
      body: JSON.stringify({
        event_type: "payment_success",
        requestId: `req-sim-${Date.now()}`,
        data: {
          merchant: { walletId: "test-wallet", userId: "test-user" },
          transaction: {
            transactionId: `tx-sim-${Date.now()}`,
            type: "vact_transfer",
            transactionAmount: amountNGN,
            time: new Date().toISOString(),
            aliasAccountReference: reference,
            aliasAccountNumber: accountNumber,
            aliasAccountName: "Simulated Webhook",
            responseCode: ""
          }
        }
      }),
    }),
};

// ─── Borrower endpoints ───────────────────────────────────────────────────────

import type { BorrowerOnboardResponse } from "./types";

export const borrowerApi = {
  onboard: (body: {
    name: string;
    email: string;
    directorBvn?: string;
    companyName: string;
    cacRcNumber: string;
    businessTin: string;
    sector: string;
    zkProof?: object;
  }) =>
    request<BorrowerOnboardResponse>("/borrowers/onboard", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ─── Loan endpoints ───────────────────────────────────────────────────────────

import type {
  LoanApplyResponse,
  LoanAcceptResponse,
  LoanApplication,
} from "./types";

export const loanApi = {
  apply: (body: {
    borrowerId: string;
    amountRequested: number;
    termDays: number;
    salesLogs?: object;
    zkProof?: object;
  }) =>
    request<LoanApplyResponse>("/loans/apply", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  get: (id: string) => request<LoanApplication>(`/loans/${id}`),

  getByBorrower: (borrowerId: string) =>
    request<LoanApplication[]>(`/borrowers/${borrowerId}/loans`),

  accept: (id: string, body?: { splitIntensity?: number }) =>
    request<LoanAcceptResponse>(`/loans/${id}/accept`, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
};

export { ApiError };
