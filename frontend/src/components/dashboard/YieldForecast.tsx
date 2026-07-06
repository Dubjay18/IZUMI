import { useUser } from "@/context/UserContext";
import { usePortfolio } from "@/hooks/usePortfolio";

export function YieldForecast() {
  const { session } = useUser();
  const { yieldForecast, loading } = usePortfolio(session?.userId);

  const forecast = yieldForecast.length > 0
    ? yieldForecast
    : [
        { quarter: "Q1", projectedValue: 0 },
        { quarter: "Q2", projectedValue: 0 },
        { quarter: "Q3", projectedValue: 0 },
        { quarter: "Target", projectedValue: 0 },
      ];

  const target = forecast.find((f) => f.quarter === "Target")?.projectedValue ?? 0;
  const baseline = forecast[0]?.projectedValue ?? 0;
  const estimatedEarnings = target - baseline;

  const formatUSD = (val: number) =>
    "$" + val.toLocaleString("en-US", { maximumFractionDigits: 0 });

  return (
    <div className="glass-panel rounded-2xl p-8 border border-outline-variant/20 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-display text-[24px] font-semibold text-primary">
            Yield Forecast
          </h3>
          <p className="text-[12px] font-body font-medium text-on-surface-variant">
            {loading
              ? "Loading..."
              : `Projected 1-Year Earnings: ${formatUSD(Math.max(0, estimatedEarnings))}`
            }
          </p>
        </div>
        <span className="material-symbols-outlined text-secondary">
          show_chart
        </span>
      </div>

      <div className="h-[160px] w-full relative mt-4">
        <svg
          className="w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 200 80"
        >
          <path
            className="text-secondary"
            d="M0,75 Q50,60 100,40 T200,10"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            d="M0,75 Q50,60 100,40 T200,10 L200,80 L0,80 Z"
            fill="url(#gradient-yield)"
            opacity="0.12"
          />
          <defs>
            <linearGradient id="gradient-yield" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#735c00", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "transparent", stopOpacity: 0 }} />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute top-0 right-0 p-1 bg-secondary-fixed/90 text-[10px] text-on-secondary-fixed font-bold rounded shadow border border-secondary/10 transform -translate-y-4 translate-x-2">
          {formatUSD(target)}
        </div>
        <div className="absolute bottom-6 left-0 text-[9px] text-outline font-bold">
          Start: {formatUSD(baseline)}
        </div>
      </div>

      <div className="flex justify-between mt-6 border-t border-outline-variant/20 pt-4">
        {forecast.map((f) => (
          <div key={f.quarter} className="text-center">
            <p className={`text-[10px] font-body uppercase font-semibold ${f.quarter === "Target" ? "text-secondary" : "text-outline"}`}>
              {f.quarter}
            </p>
            <p className={`text-[12px] font-body font-bold ${f.quarter === "Target" ? "text-secondary" : "text-primary"}`}>
              {formatUSD(f.projectedValue)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
