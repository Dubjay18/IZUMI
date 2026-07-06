import { useUser } from "@/context/UserContext";
import { useLoans } from "@/hooks/useLoans";

interface AmortizationForecastProps {
  percent: number;
}

export function AmortizationForecast({ percent }: AmortizationForecastProps) {
  const { session } = useUser();
  const { activeLoan } = useLoans(session?.borrowerId);

  const approved = activeLoan?.amountApproved ? Number(activeLoan.amountApproved) : 1000000;
  const repaid = activeLoan?.amountRepaid ? Number(activeLoan.amountRepaid) : 0;
  const balance = Math.max(approved - repaid, 0);

  // Calculate dynamic remaining days: higher percent = faster sweep = fewer days
  const baseTermDays = activeLoan?.termDays ?? 90;
  // Scale remaining days based on intensity percentage (baseline is 50% intensity)
  const speedRatio = 50 / Math.max(percent, 10);
  const projectedRemainingDays = Math.round(baseTermDays * speedRatio * (balance / Math.max(approved, 1)));

  // Calculate target maturity date
  const maturityDate = new Date();
  maturityDate.setDate(maturityDate.getDate() + projectedRemainingDays);

  const formattedMaturity = maturityDate.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Calculate dynamic bar heights: decay rate is proportional to intensity
  const totalBars = 10;
  const decayFactor = percent / 100;
  const bars = Array.from({ length: totalBars }).map((_, i) => {
    // Decay curve: start high, step down based on decayFactor
    const baseHeight = 90 - (i * i * 0.85 * (decayFactor + 0.5));
    const finalHeight = Math.max(baseHeight, 6);
    
    // Highlights transition color from old state (gray) to active sweeps (primary/secondary)
    let color = "bg-outline-variant";
    let opacity = "opacity-40";
    let glow = false;

    if (i >= 4 && i < 7) {
      color = "bg-primary";
      opacity = "opacity-80";
    } else if (i >= 7) {
      color = "bg-secondary";
      opacity = "opacity-100";
      glow = i === 8;
    }

    return { height: `${finalHeight}%`, color, opacity, glow };
  });

  const formatNGN = (val: number) =>
    "₦" + val.toLocaleString("en-NG", { maximumFractionDigits: 0 });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-[32px] font-display font-semibold text-primary">
            Maturity Timeline
          </h3>
          <p className="text-[12px] font-body font-semibold text-on-surface-variant">
            Outstanding Balance: <span className="text-secondary font-bold">{formatNGN(balance)}</span>
          </p>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">
          file_download
        </span>
      </div>

      <div className="w-full h-64 glass-panel rounded-xl flex items-end justify-between px-8 py-4 overflow-hidden relative">
        {bars.map((bar, i) => (
          <div
            key={i}
            className={`w-8 ${bar.color} ${bar.opacity} rounded-t-sm transition-all duration-500 ${
              bar.glow ? "shadow-[0_-4px_10px_rgba(115,92,0,0.3)]" : ""
            }`}
            style={{ height: bar.height }}
          />
        ))}

        {/* Floating maturity tooltip */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="bg-surface/95 px-4 py-2 rounded-lg border border-secondary shadow-md transform -translate-y-6">
            <p className="text-[10px] font-body font-bold text-secondary uppercase tracking-wider text-center">
              Projected Maturity
            </p>
            <p className="text-[16px] font-body text-primary font-bold text-center mt-0.5">
              {formattedMaturity}
            </p>
            <p className="text-[9px] font-body text-outline text-center">
              ({projectedRemainingDays} days remaining)
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-between text-[11px] font-body font-semibold uppercase tracking-wider text-outline">
        <span>Current Status</span>
        <span>Maturity Window</span>
      </div>
    </div>
  );
}
