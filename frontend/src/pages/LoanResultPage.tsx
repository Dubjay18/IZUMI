import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { loanApi } from "@/lib/api";
import type { CreditAnalysis } from "@/lib/types";

const GRADE_CONFIG = {
  A: { color: "text-green-600", bg: "bg-green-50 border-green-200", label: "Low Risk", emoji: "🟢" },
  B: { color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", label: "Moderate Risk", emoji: "🟡" },
  C: { color: "text-red-500", bg: "bg-red-50 border-red-200", label: "High Risk", emoji: "🔴" },
} as const;

function ScoreGauge({ score }: { score: number }) {
  const pct = Math.min(Math.max(score, 0), 100);
  const radius = 80;
  const circumference = Math.PI * radius; // half-circle
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="110" viewBox="0 0 200 110">
        {/* Track */}
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="18"
          className="text-outline-variant/30"
          strokeLinecap="round"
        />
        {/* Progress */}
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={`${offset + circumference * 0.5 - circumference * (pct / 100) * 0.5}`}
          className={pct >= 80 ? "text-green-500" : pct >= 60 ? "text-yellow-500" : "text-red-500"}
          style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
        />
        <text x="100" y="88" textAnchor="middle" className="font-display font-bold" fontSize="36" fill="currentColor">
          {score}
        </text>
        <text x="100" y="108" textAnchor="middle" fontSize="11" fill="gray">out of 100</text>
      </svg>
    </div>
  );
}

export function LoanResultPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation() as { state: {
    applicationId: string;
    creditAnalysis: CreditAnalysis;
    amountNGN: string;
    termDays: number;
  } | null };

  const [accepted, setAccepted] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    loanApi
      .get(id)
      .then((loan) => {
        if (loan.status === "ACTIVE" || loan.status === "REPAID") {
          setAccepted(true);
          setTxHash(loan.contractBondId);
        }
      })
      .catch(() => {});
  }, [id]);

  if (!state) {
    return (
      <AppLayout>
        <main className="py-16 px-8 text-center">
          <p className="text-on-surface-variant font-body">No loan result found. <button className="text-primary underline" onClick={() => navigate("/borrow/apply")}>Apply for credit</button>.</p>
        </main>
      </AppLayout>
    );
  }

  const { creditAnalysis, amountNGN, termDays } = state;
  const appId = id ?? state.applicationId;
  const grade = (creditAnalysis.grade ?? "C") as "A" | "B" | "C";
  const cfg = GRADE_CONFIG[grade] ?? GRADE_CONFIG.C;

  const formatNGN = (n: number) =>
    "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function handleReviewAgreement() {
    navigate(`/borrow/loan/${appId}/execute`, {
      state: { creditAnalysis, amountNGN, termDays },
    });
  }

  return (
    <AppLayout>
      <main className="py-8 px-8 max-w-[900px] mx-auto">
        <section className="mb-10">
          <p className="text-[14px] font-body font-semibold tracking-[0.15em] text-secondary mb-3 uppercase">Credit Assessment</p>
          <h1 className="text-[48px] font-display font-bold text-primary leading-[1.1] tracking-[-0.02em]">Your Result</h1>
        </section>

        {accepted ? (
          <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-12 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary">
              <span className="material-symbols-outlined text-[40px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
            </div>
            <div>
              <h2 className="font-display text-[32px] font-bold text-on-surface">Funds Disbursed!</h2>
              <p className="text-on-surface-variant font-body mt-2 max-w-md mx-auto leading-relaxed">
                {formatNGN(Number(amountNGN))} is on its way to your registered bank account. A Quest Bond has been created on-chain as collateral.
              </p>
            </div>
            {txHash && (
              <div className="p-4 bg-surface-container-highest rounded-xl border border-outline-variant/40">
                <p className="text-[11px] font-body font-semibold uppercase tracking-[0.15em] text-on-surface-variant mb-1">On-Chain Transaction</p>
                <p className="font-mono text-[12px] text-surface-tint break-all">{txHash}</p>
              </div>
            )}
            <button onClick={() => navigate("/dashboard/amortization")} className="px-10 py-3.5 bg-primary text-secondary-fixed rounded-xl font-body font-bold hover:shadow-xl active:scale-[0.98] transition-all">
              View Repayment Schedule
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Score card */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-8 text-center">
                <ScoreGauge score={creditAnalysis.score ?? 0} />
                <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-body font-bold ${cfg.bg} ${cfg.color}`}>
                  <span>{cfg.emoji}</span>
                  Grade {grade} — {cfg.label}
                </div>
                <div className="mt-6 space-y-3 text-left">
                  {[
                    { label: "Approved Limit", value: formatNGN(creditAnalysis.maxLimit) },
                    { label: "Monthly Repayment", value: formatNGN(creditAnalysis.monthlyRepayment) },
                    { label: "Term", value: `${termDays} days` },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-outline-variant/40 last:border-0">
                      <span className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-on-surface-variant">{item.label}</span>
                      <span className="font-body font-bold text-on-surface">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Analysis */}
            <div className="lg:col-span-3 space-y-6">
              {/* Strengths */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                <h3 className="font-body font-bold text-green-700 uppercase tracking-[0.1em] text-[12px] mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">thumb_up</span> Strengths
                </h3>
                <ul className="space-y-2">
                  {creditAnalysis.aiStrengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-[14px] font-body text-green-800">
                      <span className="mt-1 text-green-500">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <h3 className="font-body font-bold text-red-600 uppercase tracking-[0.1em] text-[12px] mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">warning</span> Areas of Risk
                </h3>
                <ul className="space-y-2">
                  {creditAnalysis.aiWeaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-[14px] font-body text-red-800">
                      <span className="mt-1 text-red-400">•</span> {w}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tips */}
              {creditAnalysis.aiTips.length > 0 && (
                <div className="bg-secondary-fixed/10 border border-secondary/20 rounded-2xl p-6">
                  <h3 className="font-body font-bold text-secondary uppercase tracking-[0.1em] text-[12px] mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">lightbulb</span> Business Tips
                  </h3>
                  <ul className="space-y-2">
                    {creditAnalysis.aiTips.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-[14px] font-body text-on-surface">
                        <span className="mt-1 text-secondary">•</span> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {error && (
                <div className="p-4 bg-error/10 border border-error/30 rounded-xl text-error font-body">{error}</div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => navigate("/borrow/apply")}
                  className="flex-1 py-3.5 border border-outline-variant text-on-surface-variant rounded-xl font-body font-semibold hover:bg-surface-container transition-all"
                >
                  Decline
                </button>
                <button
                  onClick={handleReviewAgreement}
                  className="flex-1 py-3.5 bg-primary text-secondary-fixed rounded-xl font-body font-bold hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Review & Sign Agreement <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </AppLayout>
  );
}
