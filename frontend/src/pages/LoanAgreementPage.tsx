import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { loanApi, ApiError } from "@/lib/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { SignaturePad, type SignaturePadHandle } from "@/components/borrower/SignaturePad";
import { SplitIntensitySlider } from "@/components/borrower/SplitIntensitySlider";
import type { CreditAnalysis } from "@/lib/types";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase();
}

export function LoanAgreementPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as {
    creditAnalysis: CreditAnalysis;
    amountNGN: string;
    termDays: number;
  } | null;

  const sigRef = useRef<SignaturePadHandle>(null);
  const [splitIntensity, setSplitIntensity] = useState(15);
  const [termsConfirmed, setTermsConfirmed] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executed, setExecuted] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch full loan details for interest rate, approved amount, etc.
  const [interestRate, setInterestRate] = useState<number | null>(null);
  const [loanStatus, setLoanStatus] = useState<string | null>(null);
  const [loadingLoan, setLoadingLoan] = useState(true);

  useEffect(() => {
    if (!id) return;
    loanApi
      .get(id)
      .then((loan) => {
        setInterestRate(Number(loan.interestRate));
        setLoanStatus(loan.status);
      })
      .catch(() => {})
      .finally(() => setLoadingLoan(false));
  }, [id]);

  const canExecute =
    !executing &&
    !executed &&
    sigRef.current?.signed &&
    termsConfirmed &&
    loanStatus === "AI_ASSESSED";

  const maturityDate = new Date();
  maturityDate.setDate(maturityDate.getDate() + (state?.termDays ?? 30));

  async function handleExecute() {
    if (!id) return;
    setExecuting(true);
    setError(null);
    try {
      const res = await loanApi.accept(id, { splitIntensity });
      setTxHash(res.txHash);
      setExecuted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (err as Error).message);
    } finally {
      setExecuting(false);
    }
  }

  return (
    <AppLayout>
      <main className="pt-24 pb-section-gap px-container-padding max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="mb-gutter">
          <span className="font-subhead-caps text-subhead-caps text-primary/60 block mb-2">
            PRIVATE WEALTH EXECUTION
          </span>
          <h1 className="font-display-lg text-display-lg text-primary tracking-tight">
            Loan Agreement &amp; Execution
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Left: Agreement Content */}
          <div className="lg:col-span-8 space-y-gutter">
            {/* Terms Summary Card */}
            <section className="glass-panel rounded-xl p-8 shadow-sm">
              <h2 className="font-headline-md text-headline-md text-primary mb-6">Summary of Terms</h2>
              {loadingLoan ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border-l-2 border-secondary-fixed pl-6 animate-pulse">
                      <div className="h-3 w-20 bg-surface-container-highest rounded mb-3" />
                      <div className="h-10 w-24 bg-surface-container-highest rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="border-l-2 border-secondary-fixed pl-6">
                    <span className="font-subhead-caps text-subhead-caps text-outline block mb-1">INTEREST RATE</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display-lg text-[40px] text-primary">{interestRate ?? "—"}</span>
                      <span className="font-headline-md text-on-surface-variant">% p.a.</span>
                    </div>
                  </div>
                  <div className="border-l-2 border-secondary-fixed pl-6">
                    <span className="font-subhead-caps text-subhead-caps text-outline block mb-1">REPAYMENT SPLIT</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display-lg text-[40px] text-primary" id="split-display">
                        {splitIntensity.toFixed(1)}
                      </span>
                      <span className="font-headline-md text-on-surface-variant">%</span>
                    </div>
                  </div>
                  <div className="border-l-2 border-secondary-fixed pl-6">
                    <span className="font-subhead-caps text-subhead-caps text-outline block mb-1">MATURITY DATE</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display-lg text-[32px] text-primary">{formatDate(maturityDate)}</span>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Full Text Scroll */}
            <section className="bg-surface rounded-xl p-10 border border-outline-variant/30 max-h-[500px] overflow-y-auto custom-scrollbar relative">
              <div className="prose prose-sm max-w-none text-on-surface-variant font-body-md leading-relaxed">
                <h3 className="text-primary font-headline-md mb-4">Master Loan Agreement #IF-{state?.creditAnalysis.grade ?? "—"}-{id?.slice(0, 4).toUpperCase()}</h3>
                <p className="mb-4">
                  This Loan Agreement (the "Agreement") is entered into as of {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}, by and between the Borrower (as identified in the signature section) and Izumi Fountain Wealth Management (the "Lender").
                </p>
                <h4 className="text-primary font-semibold mt-6 mb-2">1. Principal Amount and Interest</h4>
                <p className="mb-4">
                  The Lender agrees to provide a revolving credit facility secured by high-liquidity assets. Interest shall accrue daily on the outstanding principal at the Agreed Rate specified in the summary. Calculations are based on a 365-day year.
                </p>
                <h4 className="text-primary font-semibold mt-6 mb-2">2. Repayment Split Intensity</h4>
                <p className="mb-4">
                  The Merchant/Borrower agrees to a "Split Repayment" mechanism where a fixed percentage of daily revenue is automatically routed to the Lender via the Smart Contract Bond. The Borrower may adjust this intensity within the predefined range of 5% to 30%, subject to periodic review by the Lender's risk algorithms.
                </p>
                <h4 className="text-primary font-semibold mt-6 mb-2">3. Smart Contract Execution</h4>
                <p className="mb-4">
                  Execution of this digital agreement triggers the deployment of an ERC-721 based Smart Bond on the Izumi Private Ledger. This bond automates the split, records historical payments, and manages the maturity waterfall.
                </p>
                <div className="p-4 bg-surface-container-low border-l-4 border-primary mt-8 italic">
                  By proceeding with the digital signature, you acknowledge that you have read, understood, and agreed to be bound by all terms, including the automated recovery protocols defined in Section 8.4.
                </div>
              </div>
            </section>
          </div>

          {/* Right: Interactive Panel */}
          <aside className="lg:col-span-4 space-y-gutter sticky top-24">
            {/* Split Intensity Slider */}
            <SplitIntensitySlider value={splitIntensity} onChange={setSplitIntensity} />

            {/* Signature Area */}
            <div className="glass-panel rounded-xl p-8 shadow-sm border-2 border-secondary-fixed">
              <h3 className="font-subhead-caps text-subhead-caps text-primary mb-6">DIGITAL EXECUTION</h3>
              <div className="space-y-6">
                <SignaturePad ref={sigRef} />

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms-confirm"
                    checked={termsConfirmed}
                    onChange={(e) => setTermsConfirmed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-outline-variant text-primary focus:ring-secondary-fixed"
                  />
                  <label htmlFor="terms-confirm" className="text-label-sm text-on-surface-variant">
                    I certify that I am authorized to execute this smart contract bond on behalf of the borrowing entity.
                  </label>
                </div>

                {error && (
                  <div className="p-3 bg-error/10 border border-error/30 rounded-xl text-error text-label-sm font-body">{error}</div>
                )}

                {executed ? (
                  <div className="w-full py-4 bg-green-800 text-primary-fixed font-subhead-caps text-subhead-caps rounded-lg flex items-center justify-center gap-2">
                    CONTRACT EXECUTED
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                ) : (
                  <button
                    onClick={handleExecute}
                    disabled={!canExecute}
                    className="w-full py-4 bg-primary text-primary-fixed font-subhead-caps text-subhead-caps rounded-lg flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:shadow-lg active:scale-[0.98]"
                  >
                    {executing ? (
                      <>
                        DEPLOYING BOND...
                        <span className="material-symbols-outlined animate-spin">sync</span>
                      </>
                    ) : (
                      <>
                        EXECUTE SMART CONTRACT
                        <span className="material-symbols-outlined">lock_open</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* Success Modal */}
        {executed && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-primary/20 backdrop-blur-md transition-opacity duration-500">
            <div className="glass-panel p-12 rounded-2xl text-center shadow-2xl max-w-md scale-100 opacity-100 transition-all duration-500">
              <span className="material-symbols-outlined text-[64px] text-secondary-fixed mb-6" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified_user
              </span>
              <h2 className="font-display-lg text-headline-md text-primary mb-4">Agreement Secured</h2>
              <p className="font-body-md text-on-surface-variant mb-8">
                The Smart Contract Bond has been deployed to the Izumi Private Ledger. Your funds will be disbursed within 24 hours.
              </p>
              {txHash && (
                <div className="p-4 bg-surface-container-highest rounded-xl border border-outline-variant/40 mb-8 text-left">
                  <p className="text-[11px] font-body font-semibold uppercase tracking-[0.15em] text-on-surface-variant mb-1">Transaction Hash</p>
                  <p className="font-mono text-[12px] text-surface-tint break-all">{txHash}</p>
                </div>
              )}
              <button
                onClick={() => navigate("/borrow/dashboard")}
                className="w-full py-4 bg-primary text-primary-fixed font-subhead-caps rounded-lg"
              >
                RETURN TO DASHBOARD
              </button>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c8c5; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #717976; }
      `}</style>
    </AppLayout>
  );
}
