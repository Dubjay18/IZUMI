const ASSET_DATA = [
  { label: "Equity Partners", percentage: 65, color: "bg-primary" },
  { label: "Impact Bonds", percentage: 25, color: "bg-secondary" },
  { label: "Liquid Assets", percentage: 10, color: "bg-outline-variant" },
] as const;

export function AssetFlow() {
  return (
    <div className="glass-panel rounded-2xl p-8 border border-outline-variant/20">
      <h3 className="font-display text-[24px] font-semibold text-primary mb-6">
        Asset Flow
      </h3>
      <div className="space-y-4">
        {ASSET_DATA.map((asset) => (
          <div key={asset.label} className="flex flex-col gap-2">
            <div className="flex justify-between text-[12px] font-body font-medium uppercase opacity-60">
              <span>{asset.label}</span>
              <span>{asset.percentage}%</span>
            </div>
            <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
              <div
                className={`h-full ${asset.color} rounded-full`}
                style={{ width: `${asset.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
