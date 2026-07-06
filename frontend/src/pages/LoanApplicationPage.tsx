import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loanApi, ApiError } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { AppLayout } from "@/components/layout/AppLayout";
import type { CreditAnalysis } from "@/lib/types";

const TERM_OPTIONS = [
  { days: 30, label: "30 Days", tag: "Short Term", color: "bg-secondary-fixed/20 text-on-secondary-fixed" },
  { days: 60, label: "60 Days", tag: "Balanced", color: "bg-primary/10 text-primary" },
  { days: 90, label: "90 Days", tag: "Extended", color: "bg-surface-tint/20 text-surface-tint" },
];

export function LoanApplicationPage() {
  const navigate = useNavigate();
  const { session } = useUser();

  // Loan parameters
  const [amountNGN, setAmountNGN] = useState("");
  const [termDays, setTermDays] = useState(30);

  // Sales log fields
  const [monthlyRevenue, setMonthlyRevenue] = useState("");
  const [operatingCosts, setOperatingCosts] = useState("");
  const [transactionCount, setTransactionCount] = useState("");
  const [averageTicketSize, setAverageTicketSize] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.borrowerId) {
      setError("No borrower profile found. Please complete onboarding first.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const salesLogs = {
        monthlyRevenue: Number(monthlyRevenue),
        operatingCosts: Number(operatingCosts) || Number(monthlyRevenue) * 0.45,
        transactionCount: Number(transactionCount) || 100,
        averageTicketSize: Number(averageTicketSize) || Number(monthlyRevenue) / 100,
        revenueVolatility: 0.15,
      };

      const res = await loanApi.apply({
        borrowerId: session.borrowerId,
        amountRequested: Number(amountNGN),
        termDays,
        salesLogs,
      });

      // Navigate to result page with state
      navigate(`/borrow/loan/${res.applicationId}`, {
        state: { applicationId: res.applicationId, creditAnalysis: res.creditAnalysis, amountNGN, termDays },
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (!session?.borrowerId) {
    return (
      <AppLayout>
        <main className="py-16 px-8 max-w-xl mx-auto text-center">
          <span className="material-symbols-outlined text-[64px] text-outline mb-4 block">business_center</span>
          <h2 className="font-display text-[28px] font-bold text-on-surface mb-3">Business Profile Required</h2>
          <p className="text-on-surface-variant font-body mb-8">Register your business before applying for credit.</p>
          <button
            onClick={() => navigate("/borrow/onboard")}
            className="px-10 py-3.5 bg-primary text-secondary-fixed rounded-xl font-body font-bold hover:shadow-xl active:scale-[0.98] transition-all"
          >
            Start Business Registration
          </button>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="py-8 px-8 max-w-[900px] mx-auto">
        {/* Hero */}
        <section className="mb-12">
          <p className="text-[14px] font-body font-semibold tracking-[0.15em] text-secondary mb-3 uppercase">AI-Powered Credit</p>
          <h1 className="text-[48px] font-display font-bold text-primary leading-[1.1] tracking-[-0.02em]">Apply for Credit</h1>
          <p className="text-[18px] font-body text-on-surface-variant mt-4 max-w-lg leading-[1.6]">
            Share your business metrics. Our Gemini AI engine will assess your creditworthiness in seconds.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Loan parameters */}
          <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-8">
            <h3 className="font-display text-[20px] font-semibold text-on-surface mb-6">Loan Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[12px] font-body font-semibold uppercase tracking-[0.15em] text-on-surface-variant block mb-2">
                  Amount Requested (₦)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">₦</span>
                  <input
                    id="loan-amount"
                    type="number"
                    required
                    value={amountNGN}
                    onChange={e => setAmountNGN(e.target.value)}
                    placeholder="500,000"
                    min="10000"
                    className="w-full pl-8 pr-4 py-3 bg-surface border border-outline-variant rounded-xl text-on-surface placeholder:text-outline focus:border-primary focus:outline-none transition-colors font-body"
                  />
                </div>
              </div>
              <div>
                <label className="text-[12px] font-body font-semibold uppercase tracking-[0.15em] text-on-surface-variant block mb-2">
                  Repayment Term
                </label>
                <div className="flex gap-2">
                  {TERM_OPTIONS.map(opt => (
                    <button
                      key={opt.days}
                      type="button"
                      onClick={() => setTermDays(opt.days)}
                      className={`flex-1 py-3 rounded-xl border-2 text-center transition-all ${
                        termDays === opt.days
                          ? "border-primary bg-primary/5"
                          : "border-outline-variant hover:border-outline"
                      }`}
                    >
                      <p className="font-body font-bold text-[13px] text-on-surface">{opt.label}</p>
                      <p className={`text-[10px] font-body mt-0.5 font-semibold px-2 py-0.5 rounded-full inline-block ${opt.color}`}>{opt.tag}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sales metrics */}
          <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-8">
            <h3 className="font-display text-[20px] font-semibold text-on-surface mb-2">Business Metrics</h3>
            <p className="text-sm text-on-surface-variant font-body mb-6">
              These numbers are used by our AI to calculate your credit score. They are kept private.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: "loan-revenue", label: "Monthly Revenue (₦)", value: monthlyRevenue, onChange: setMonthlyRevenue, placeholder: "1,200,000" },
                { id: "loan-costs", label: "Monthly Operating Costs (₦)", value: operatingCosts, onChange: setOperatingCosts, placeholder: "540,000" },
                { id: "loan-txcount", label: "Monthly Transaction Count", value: transactionCount, onChange: setTransactionCount, placeholder: "250" },
                { id: "loan-ticket", label: "Average Ticket Size (₦)", value: averageTicketSize, onChange: setAverageTicketSize, placeholder: "4,800" },
              ].map(f => (
                <div key={f.id}>
                  <label className="text-[12px] font-body font-semibold uppercase tracking-[0.15em] text-on-surface-variant block mb-2">{f.label}</label>
                  <input
                    id={f.id}
                    type="number"
                    required
                    value={f.value}
                    onChange={e => f.onChange(e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-on-surface placeholder:text-outline focus:border-primary focus:outline-none transition-colors font-body"
                  />
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-error/10 border border-error/30 rounded-xl text-error font-body">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-secondary-fixed rounded-xl font-body font-bold text-[16px] hover:shadow-2xl active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <><span className="material-symbols-outlined animate-spin">progress_activity</span>Scoring with AI…</>
            ) : (
              <><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>Assess My Creditworthiness</>
            )}
          </button>
        </form>
      </main>
    </AppLayout>
  );
}
