import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useLoans } from "@/hooks/useLoans";
import { borrowerApi } from "@/lib/api";

interface SplitIntelligenceProps {
  percent: number;
}

export function SplitIntelligence({ percent }: SplitIntelligenceProps) {
  const { session } = useUser();
  const { activeLoan } = useLoans(session?.borrowerId);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use ₦1,200,000 default if no loan has been scored
  const monthlyRevenue = activeLoan?.amountRequested
    ? Number(activeLoan.amountRequested)
    : 1200000;

  // Calculate daily sweep cap
  const dailySweepCap = Math.round((percent / 100) * (monthlyRevenue / 30));
  
  // Safety margin scales inversely with sweep intensity
  const safetyMargin = Math.max(100 - percent, 10);

  const formatNGN = (val: number) =>
    "₦" + val.toLocaleString("en-NG", { maximumFractionDigits: 0 });

  async function handleCommit() {
    if (!session?.borrowerId) return;
    setLoading(true);
    setError(null);
    try {
      await borrowerApi.updateSplitIntensity(session.borrowerId, percent);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to commit split intensity:", err);
      setError(err.message || "Failed to update sweep configuration.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-panel p-8 rounded-xl bg-surface/60">
      <h3 className="text-[32px] font-display font-semibold text-primary mb-4">
        Split Intelligence
      </h3>
      <p className="text-[14px] font-body text-on-surface-variant mb-6 leading-relaxed">
        Adjust the sweep dial to calibrate how much of your daily incoming cash flow
        is automatically diverted toward principal repayment.
      </p>

      <div className="space-y-4">
        <div className="flex justify-between items-center p-4 rounded-lg bg-surface-container-low border border-outline-variant/20">
          <div>
            <p className="text-[12px] font-body font-bold text-secondary uppercase tracking-wider">
              Daily Sweep Cap
            </p>
            <p className="text-[32px] font-display font-bold text-primary mt-1">
              {formatNGN(dailySweepCap)}
            </p>
          </div>
          <span className="material-symbols-outlined text-primary text-[28px]">
            payments
          </span>
        </div>

        <div className="flex justify-between items-center p-4 rounded-lg bg-surface-container-low border border-outline-variant/20">
          <div>
            <p className="text-[12px] font-body font-bold text-secondary uppercase tracking-wider">
              Liquid Safety Margin
            </p>
            <p className="text-[32px] font-display font-bold text-primary mt-1">
              {safetyMargin}%
            </p>
          </div>
          <span className="material-symbols-outlined text-primary text-[28px]">
            lock_open
          </span>
        </div>
      </div>

      {success && (
        <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-body rounded-lg text-center font-semibold">
          Sweep configuration updated successfully.
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-error/10 border border-error/30 text-error text-xs font-body rounded-lg text-center font-semibold">
          {error}
        </div>
      )}

      <button
        onClick={handleCommit}
        disabled={loading}
        className="w-full mt-6 py-4 bg-primary text-secondary-fixed font-bold text-[13px] uppercase tracking-[0.15em] rounded-full hover:scale-[1.01] active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
            Updating Sweeps...
          </>
        ) : "Commit Adjustment"}
      </button>
    </div>
  );
}
