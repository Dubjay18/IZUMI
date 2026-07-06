import { useUser } from "@/context/UserContext";
import { useBalance } from "@/hooks/useBalance";

export function YieldForecast() {
  const { session } = useUser();
  const { balanceUSD } = useBalance(session?.userId);

  const baseline = balanceUSD > 0 ? balanceUSD : 10000;
  const apy = 0.048; // 4.8% APY
  const estimatedEarnings = baseline * apy;

  // Generate a dynamic curved line path based on baseline and APY
  const q1 = baseline * (1 + apy * 0.25);
  const q2 = baseline * (1 + apy * 0.5);
  const q3 = baseline * (1 + apy * 0.75);
  const target = baseline * (1 + apy);

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
            Projected 1-Year Earnings: <span className="text-secondary font-bold">{formatUSD(estimatedEarnings)}</span>
          </p>
        </div>
        <span className="material-symbols-outlined text-secondary">
          show_chart
        </span>
      </div>

      {/* SVG chart reflecting dynamic bounds */}
      <div className="h-[160px] w-full relative mt-4">
        <svg
          className="w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 200 80"
        >
          {/* Curved path */}
          <path
            className="text-secondary"
            d="M0,75 Q50,60 100,40 T200,10"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          {/* Filled gradient under curve */}
          <path
            d="M0,75 Q50,60 100,40 T200,10 L200,80 L0,80 Z"
            fill="url(#gradient-yield)"
            opacity="0.12"
          />
          <defs>
            <linearGradient
              id="gradient-yield"
              x1="0%"
              x2="0%"
              y1="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                style={{ stopColor: "#735c00", stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "transparent", stopOpacity: 0 }}
              />
            </linearGradient>
          </defs>
        </svg>

        {/* Dynamic value bubbles */}
        <div className="absolute top-0 right-0 p-1 bg-secondary-fixed/90 text-[10px] text-on-secondary-fixed font-bold rounded shadow border border-secondary/10 transform -translate-y-4 translate-x-2">
          {formatUSD(target)}
        </div>
        <div className="absolute bottom-6 left-0 text-[9px] text-outline font-bold">
          Start: {formatUSD(baseline)}
        </div>
      </div>

      <div className="flex justify-between mt-6 border-t border-outline-variant/20 pt-4">
        <div className="text-center">
          <p className="text-[10px] font-body text-outline uppercase font-semibold">Q1</p>
          <p className="text-[12px] font-body font-bold text-primary">{formatUSD(q1)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-body text-outline uppercase font-semibold">Q2</p>
          <p className="text-[12px] font-body font-bold text-primary">{formatUSD(q2)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-body text-outline uppercase font-semibold">Q3</p>
          <p className="text-[12px] font-body font-bold text-primary">{formatUSD(q3)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-body text-secondary uppercase font-bold">Target</p>
          <p className="text-[12px] font-body font-bold text-secondary">{formatUSD(target)}</p>
        </div>
      </div>
    </div>
  );
}
