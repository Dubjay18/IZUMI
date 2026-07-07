const BASE_URL = 
  (import.meta.env.VITE_API_URL as string) || 
  (import.meta.env.VITE_API_BASE_URL as string) || 
  "http://localhost:5000";

class ApiError extends Error {
  public status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
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

  createKycSession: () =>
    request<{ token: string }>("/savers/sessions/handshake", {
      method: "POST"
    }),

  pollKycSession: (token: string) =>
    request<{ status: 'PENDING' | 'VERIFIED' | 'FAILED', userId: string | null }>(`/savers/sessions/${token}`),

  verifyKycSession: (token: string, userId: string) =>
    request<{ success: boolean; message: string }>(`/savers/sessions/${token}/verify`, {
      method: "POST",
      body: JSON.stringify({ userId })
    }),

  syncDeposits: (userId: string) =>
    request<{ success: boolean; message: string; usdSynced: number }>(`/savers/${userId}/sync`, {
      method: "POST"
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

  uploadDocument: (borrowerId: string, body: { type: string, fileName: string, fileSize: number, base64Data: string }) =>
    request<{ message: string; documentId: string }>(`/borrowers/${borrowerId}/documents`, {
      method: "POST",
      body: JSON.stringify(body)
    }),

  getDocuments: (borrowerId: string) =>
    request<{ id: string; type: string; fileName: string; fileSize: number; uploadedAt: string }[]>(`/borrowers/${borrowerId}/documents`),

  getDocumentDetails: (docId: string) =>
    request<{ id: string; type: string; fileName: string; fileSize: number; base64Data: string; uploadedAt: string }>(`/borrowers/documents/${docId}`),
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
