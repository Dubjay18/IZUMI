// ─── Shared TypeScript types mirroring backend response shapes ───────────────

export interface VirtualAccount {
  accountNumber: string;
  bankName: string;
  accountName: string;
  reference: string;
}

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  role: "SAVER" | "BORROWER" | "UNDERWRITER";
  kycStatus: string;
  walletAddress: string;
  virtualAccount: VirtualAccount | null;
  borrowerId: string | null;
}

export interface BalanceResponse {
  userId: string;
  balanceRaw: string;
  balanceUSD: number;
}

export interface LedgerEntry {
  id: string;
  userId: string;
  amount: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "YIELD";
  status: "PENDING" | "COMPLETED" | "FAILED";
  txHash: string | null;
  createdAt: string;
}

export interface CreditAnalysis {
  score: number | null;
  grade: string | null;
  maxLimit: number;
  monthlyRepayment: number;
  aiStrengths: string[];
  aiWeaknesses: string[];
  aiTips: string[];
}

export interface LoanApplication {
  id: string;
  borrowerId: string;
  amountRequested: string;
  amountApproved: string | null;
  interestRate: string | null;
  termDays: number;
  status:
    | "PENDING"
    | "AI_ASSESSED"
    | "APPROVED"
    | "DISBURSED"
    | "ACTIVE"
    | "REPAID"
    | "DEFAULTED"
    | "REJECTED";
  creditScore: number | null;
  creditGrade: string | null;
  aiAnalysis: {
    strengths: string[];
    weaknesses: string[];
    businessTips: string[];
  } | null;
  contractBondId: string | null;
  amountRepaid: string;
  createdAt: string;
  updatedAt: string;
}

export interface ZkProof {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  publicSignals: string[];
}

// ─── API error shape ─────────────────────────────────────────────────────────
export interface ApiError {
  error: string;
}

// ─── Onboarding responses ────────────────────────────────────────────────────
export interface SaverOnboardResponse {
  message: string;
  userId: string;
  walletAddress: string;
  virtualAccount: VirtualAccount;
}

export interface BorrowerOnboardResponse {
  message: string;
  kybStatus: string;
  borrowerId: string;
  user: {
    id: string;
    name: string;
    email: string;
    kycStatus: string;
  };
}

export interface LoanApplyResponse {
  message: string;
  applicationId: string;
  status: string;
  creditAnalysis: CreditAnalysis;
}

export interface LoanAcceptResponse {
  message: string;
  loanId: string;
  status: string;
  disbursedNGN: number;
  disbursedUSDC: number;
  txHash: string;
}

export interface WithdrawResponse {
  message: string;
  amountUSD: number;
  txHash: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TransactionResponse {
  entries: LedgerEntry[];
  pagination: PaginationInfo;
}

export interface DepositPosition {
  id: string;
  txHash: string | null;
  type: string;
  name: string;
  status: 'Locked' | 'Matured';
  principalUSD: number;
  apy: string;
  createdAt: string;
  maturityDate: string;
  progress: number;
}

export interface PositionsResponse {
  positions: DepositPosition[];
  matured: DepositPosition[];
  vaultBalanceRaw: string;
  vaultBalanceUSD: number;
  totalPositions: number;
}

export interface PortfolioMetric {
  label: string;
  value: string;
  icon: string;
  change: string;
  positive: boolean;
}

export interface PortfolioAllocation {
  label: string;
  pct: number;
  color: string;
}

export interface PortfolioPerformance {
  month: string;
  yield: number;
  principal: number;
}

export interface PortfolioDistribution {
  period: string;
  principal: number;
  yield: number;
}

export interface StrategyMixItem {
  label: string;
  pct: number;
  desc: string;
}

export interface NextYieldEvent {
  date: string;
  estimatedPayoutUSD: number;
}

export interface PortfolioResponse {
  metrics: PortfolioMetric[];
  allocation: PortfolioAllocation[];
  performance: PortfolioPerformance[];
  distribution: PortfolioDistribution[];
  strategyMix: StrategyMixItem[];
  nextYieldEvent: NextYieldEvent;
  yieldForecast: YieldForecastQuarter[];
  assetFlow: AssetFlowItem[];
}

export interface YieldForecastQuarter {
  quarter: string;
  projectedValue: number;
}

export interface AssetFlowItem {
  label: string;
  percentage: number;
  color: string;
  desc: string;
}

export interface VaultStatsResponse {
  totalSavers: number;
  totalValueLockedUSD: number;
  totalYieldDistributedUSD: number;
  totalDepositedUSD: number;
  totalWithdrawnUSD: number;
  activePositions: number;
}
