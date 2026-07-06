import { useUser } from "@/context/UserContext";
import { useBalance } from "@/hooks/useBalance";

export function AssetFlow() {
  const { session } = useUser();
  const { balanceUSD } = useBalance(session?.userId);

  const totalPoolVal = balanceUSD > 0 ? balanceUSD : 142850; // Use active balance or global pool default

  const ASSET_DATA = [
    { label: "Nomba Cash Pool (Liquid)", percentage: 15, color: "bg-outline-variant", desc: "Short term liquidity" },
    { label: "SME Credit Bonds", percentage: 50, color: "bg-primary", desc: "Secured business lending" },
    { label: "Sustainable Agricultural Yields", percentage: 35, color: "bg-secondary", desc: "Direct agro project loans" },
  ] as const;

  const formatUSD = (val: number) =>
    "$" + val.toLocaleString("en-US", { maximumFractionDigits: 0 });

  return (
    <div className="glass-panel rounded-2xl p-8 border border-outline-variant/20 flex flex-col justify-between h-full">
      <div>
        <h3 className="font-display text-[24px] font-semibold text-primary mb-2">
          Asset Flow
        </h3>
        <p className="text-[12px] font-body text-on-surface-variant mb-6">
          Allocation details for your active portfolio of <span className="font-bold text-primary">{formatUSD(totalPoolVal)}</span>
        </p>
      </div>

      <div className="space-y-6">
        {ASSET_DATA.map((asset) => {
          const allocationValue = totalPoolVal * (asset.percentage / 100);
          return (
            <div key={asset.label} className="flex flex-col gap-2">
              <div className="flex justify-between text-[12px] font-body">
                <div>
                  <span className="font-bold text-primary uppercase block tracking-wide">{asset.label}</span>
                  <span className="text-[10px] text-outline font-medium">{asset.desc}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-secondary">{asset.percentage}%</span>
                  <span className="text-[10px] text-outline block font-mono">{formatUSD(allocationValue)}</span>
                </div>
              </div>
              <div className="h-2.5 w-full bg-surface-container rounded-full overflow-hidden border border-outline-variant/10">
                <div
                  className={`h-full ${asset.color} rounded-full transition-all duration-1000`}
                  style={{ width: `${asset.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
