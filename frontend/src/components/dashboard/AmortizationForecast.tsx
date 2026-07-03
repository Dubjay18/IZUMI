const BARS: { height: string; color: string; opacity: string; glow?: boolean }[] = [
  { height: "90%", color: "bg-outline-variant", opacity: "opacity-50" },
  { height: "82%", color: "bg-outline-variant", opacity: "opacity-50" },
  { height: "75%", color: "bg-outline-variant", opacity: "opacity-50" },
  { height: "65%", color: "bg-outline-variant", opacity: "opacity-50" },
  { height: "50%", color: "bg-primary", opacity: "" },
  { height: "42%", color: "bg-primary", opacity: "" },
  { height: "35%", color: "bg-primary", opacity: "" },
  { height: "25%", color: "bg-secondary", opacity: "", glow: true },
  { height: "15%", color: "bg-secondary-fixed-dim", opacity: "" },
  { height: "8%", color: "bg-secondary-fixed-dim", opacity: "" },
];

const TIMELINE = ["Current Q3", "Q4 2024", "2025", "Projected End"] as const;

export function AmortizationForecast() {
  return (
    <div>
      <div className="flex justify-between items-center mb-[8px]">
        <h3 className="text-[32px] font-display font-semibold text-primary">
          Amortization Forecast
        </h3>
        <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">
          file_download
        </span>
      </div>

      <div className="w-full h-64 glass-panel rounded-xl flex items-end justify-between px-8 py-4 overflow-hidden relative">
        {BARS.map((bar, i) => (
          <div
            key={i}
            className={`w-8 ${bar.color} ${bar.opacity} rounded-t-sm ${
              bar.glow
                ? "shadow-[0_-4px_10px_rgba(115,92,0,0.3)]"
                : ""
            }`}
            style={{ height: bar.height }}
          />
        ))}

        {/* Floating maturity tooltip */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="bg-surface/90 px-4 py-2 rounded-lg border border-secondary shadow-md transform -translate-y-12">
            <p className="text-[12px] font-body font-bold text-secondary">
              Estimated Maturity
            </p>
            <p className="text-[16px] font-body text-primary font-bold">
              Sept 14, 2026
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-between text-[12px] font-body text-on-surface-variant">
        {TIMELINE.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}
