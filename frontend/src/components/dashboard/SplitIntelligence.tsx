const SETTINGS = [
  {
    label: "Daily Sweep Cap",
    value: "₦250,000",
    icon: "edit",
  },
  {
    label: "Safety Margin",
    value: "15%",
    icon: "lock",
  },
] as const;

export function SplitIntelligence() {
  return (
    <div className="glass-panel p-8 rounded-xl bg-surface/60">
      <h3 className="text-[32px] font-display font-semibold text-primary mb-4">
        Split Intelligence
      </h3>
      <p className="text-[16px] font-body text-on-surface-variant mb-6">
        Adjust the dial to calibrate how much of your daily incoming cash flow
        is diverted toward principal repayment versus operational liquidity.
      </p>

      <div className="space-y-4">
        {SETTINGS.map((setting) => (
          <div
            key={setting.label}
            className="flex justify-between items-center p-4 rounded-lg bg-surface-container-low border border-outline-variant/20"
          >
            <div>
              <p className="text-[12px] font-body font-bold text-secondary">
                {setting.label}
              </p>
              <p className="text-[32px] font-display font-semibold text-primary mt-1">
                {setting.value}
              </p>
            </div>
            <span className="material-symbols-outlined text-primary">
              {setting.icon}
            </span>
          </div>
        ))}
      </div>

      <button className="w-full mt-8 py-4 bg-primary text-secondary-fixed font-semibold text-[14px] uppercase tracking-[0.15em] rounded-full hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
        Commit Adjustment
      </button>
    </div>
  );
}
