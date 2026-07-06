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

  getTransactions: (userId: string, { page, limit, type }: { page?: number; limit?: number; type?: string } = {}) => {
    const params = new URLSearchParams();
    if (page) params.set('page', String(page));
    if (limit) params.set('limit', String(limit));
    if (type) params.set('type', type);
    const qs = params.toString();
    return request<import("./types").TransactionResponse>(`/savers/${userId}/transactions${qs ? `?${qs}` : ''}`);
  },

  getPositions: (userId: string) =>
    request<import("./types").PositionsResponse>(`/savers/${userId}/positions`),

  getPortfolio: (userId: string) =>
    request<import("./types").PortfolioResponse>(`/savers/${userId}/portfolio`),
};

export const vaultApi = {
  getStats: () =>
    request<import("./types").VaultStatsResponse>("/vault/stats"),
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

  getProfile: (id: string) =>
    request<import("./types").BorrowerProfile>(`/borrowers/${id}`),

  updateProfile: (id: string, body: { name?: string; phoneNumber?: string; companyName?: string; sector?: string }) =>
    request<import("./types").BorrowerProfile>(`/borrowers/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  getLedger: (id: string, { page, limit, type, search }: { page?: number; limit?: number; type?: string; search?: string } = {}) => {
    const params = new URLSearchParams();
    if (page) params.set("page", String(page));
    if (limit) params.set("limit", String(limit));
    if (type) params.set("type", type);
    if (search) params.set("search", search);
    const qs = params.toString();
    return request<import("./types").BorrowerLedgerResponse>(`/borrowers/${id}/ledger${qs ? `?${qs}` : ""}`);
  },

  getDashboard: (id: string) =>
    request<import("./types").BorrowerDashboard>(`/borrowers/${id}/dashboard`),
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
