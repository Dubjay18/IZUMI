const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface ZKProof {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  publicSignals: string[];
}

export interface OnboardSaverResponse {
  message: string;
  userId: string;
  walletAddress: string;
  virtualAccount: {
    accountNumber: string;
    bankName: string;
    accountName: string;
    reference: string;
  };
}

export interface OnboardBorrowerResponse {
  message: string;
  borrowerId: string;
  walletAddress: string;
}

export interface SaverBalanceResponse {
  userId: string;
  balanceRaw: string;
  balanceUSD: number;
}

export interface WithdrawalResponse {
  message: string;
  amountUSD: number;
  txHash: string;
}

export interface LoanApplicationRequest {
  borrowerId: string;
  amountRequested: number;
  termDays: number;
  salesLogs: { volume: number; txCount: number }[];
}

export interface LoanApplicationResponse {
  message: string;
  applicationId: string;
  status: string;
  creditAnalysis: {
    score: number;
    grade: string;
    maxLimit: number;
    monthlyRepayment: number;
    aiStrengths: string[];
    aiWeaknesses: string[];
    aiTips: string[];
  };
}

export interface LoanDetailsResponse {
  id: string;
  borrowerId: string;
  amountRequested: number;
  amountApproved: number;
  amountRepaid: number;
  termDays: number;
  status: string;
  contractBondId: string | null;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Saver Services
  onboardSaver: (name: string, email: string, zkProof: ZKProof) =>
    request<OnboardSaverResponse>("/savers/onboard", {
      method: "POST",
      body: JSON.stringify({ name, email, zkProof }),
    }),

  getSaverBalance: (userId: string) =>
    request<SaverBalanceResponse>(`/savers/${userId}/balance`),

  withdrawSaver: (userId: string, amountUSD: number) =>
    request<WithdrawalResponse>("/savers/withdraw", {
      method: "POST",
      body: JSON.stringify({ userId, amountUSD }),
    }),

  // Borrower Services
  onboardBorrower: (businessName: string, email: string, zkProof: ZKProof) =>
    request<OnboardBorrowerResponse>("/borrowers/onboard", {
      method: "POST",
      body: JSON.stringify({ businessName, email, zkProof }),
    }),

  // Loan Services
  applyForLoan: (data: LoanApplicationRequest) =>
    request<LoanApplicationResponse>("/loans/apply", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  acceptLoan: (loanId: string) =>
    request<{ message: string; loanId: string; status: string; txHash: string }>(
      `/loans/${loanId}/accept`,
      { method: "POST" }
    ),

  getLoanDetails: (loanId: string) =>
    request<LoanDetailsResponse>(`/loans/${loanId}`),

  // Webhook Simulator (for test utility in dashboard)
  triggerMockDepositWebhook: (accountNumber: string, amountNGN: number) =>
    request<{ message: string }>("/webhooks/nomba", {
      method: "POST",
      body: JSON.stringify({
        event: "deposit.success",
        data: {
          accountNumber,
          amount: amountNGN,
          reference: `MOCK-TX-${Date.now()}`,
          paymentDate: new Date().toISOString(),
        },
      }),
    }),

  triggerMockRepaymentWebhook: (accountNumber: string, amountNGN: number) =>
    request<{ message: string }>("/webhooks/nomba", {
      method: "POST",
      body: JSON.stringify({
        event: "split.settlement",
        data: {
          accountNumber,
          amount: amountNGN,
          reference: `MOCK-SWEEP-${Date.now()}`,
          paymentDate: new Date().toISOString(),
        },
      }),
    }),
};
