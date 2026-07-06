import { useUser } from "@/context/UserContext";
import { usePositions } from "@/hooks/usePositions";
import type { DepositPosition } from "@/lib/types";

function PositionCard({
  position,
  dark,
}: {
  position: DepositPosition;
  dark?: boolean;
}) {
  const formattedPrincipal = position.principalUSD.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  const maturityDate = new Date(position.maturityDate);
  const formattedMaturity = maturityDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const isActive = position.status === "Locked";
  const statusStyle = isActive
    ? "bg-secondary-container text-on-secondary-container"
    : "bg-tertiary-container text-tertiary-fixed";

  if (dark) {
    return (
      <div className="bg-tertiary text-on-tertiary p-8 rounded-xl border border-tertiary-container shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <span className="text-[14px] font-body font-semibold uppercase tracking-[0.15em] text-secondary-fixed block mb-1">
                {position.type}
              </span>
              <h4 className="text-[24px] font-display font-bold text-surface-container-lowest">
                {position.name}
              </h4>
            </div>
            <div className={`${statusStyle} px-3 py-1 rounded-full text-xs font-bold`}>
              {isActive ? "Active" : "Matured"}
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between">
              <span className="text-on-tertiary-container text-[12px] font-body font-medium">
                Principal
              </span>
              <span className="font-bold text-white">{formattedPrincipal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-tertiary-container text-[12px] font-body font-medium">
                Maturity Date
              </span>
              <span className="font-bold text-white">{formattedMaturity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-tertiary-container text-[12px] font-body font-medium">
                APY
              </span>
              <span className="font-bold text-secondary-container">{position.apy}</span>
            </div>
            <div className="w-full bg-tertiary-container h-1 rounded-full overflow-hidden">
              <div
                className="bg-secondary-fixed h-full"
                style={{ width: `${position.progress}%` }}
              />
            </div>
          </div>

          <button className="w-full py-3 bg-secondary text-white text-[12px] font-body font-medium rounded-lg hover:shadow-[0_0_15px_rgba(254,214,91,0.3)] transition-all flex items-center justify-center gap-2 active:scale-95">
            {isActive ? "Liquidate" : "Re-deposit"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-8 rounded-xl border border-outline-variant hover:border-secondary transition-all group">
      <div className="flex justify-between items-start mb-8">
        <div>
          <span className="text-[14px] font-body font-semibold uppercase tracking-[0.15em] text-secondary block mb-1">
            {position.type}
          </span>
          <h4 className="text-[24px] font-display font-bold">{position.name}</h4>
        </div>
        <div className={`${statusStyle} px-3 py-1 rounded-full text-xs font-bold`}>
          {isActive ? "Active" : "Matured"}
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between">
          <span className="text-on-surface-variant text-[12px] font-body font-medium">
            Principal
          </span>
          <span className="font-bold">{formattedPrincipal}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-variant text-[12px] font-body font-medium">
            Maturity Date
          </span>
          <span className="font-bold">{formattedMaturity}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-variant text-[12px] font-body font-medium">
            APY
          </span>
          <span className="font-bold text-secondary">{position.apy}</span>
        </div>
        <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
          <div
            className="bg-secondary h-full"
            style={{ width: `${position.progress}%` }}
          />
        </div>
      </div>

      <button className="w-full py-3 bg-primary text-on-primary text-[12px] font-body font-medium rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-95">
        {isActive ? (
          <>
            Liquidate
            <span className="material-symbols-outlined text-sm">bolt</span>
          </>
        ) : (
          "Re-deposit"
        )}
      </button>
    </div>
  );
}

export function LockedPositions() {
  const { session } = useUser();
  const { positions, matured, loading } = usePositions(session?.userId);

  const allPositions = [...positions, ...matured];

  return (
    <section className="mb-[80px]">
      <div className="flex items-center justify-between mb-[24px]">
        <h3 className="text-[32px] font-display font-semibold text-primary">
          Locked Positions
        </h3>
        <button className="flex items-center gap-2 text-secondary text-[12px] font-body font-medium hover:underline">
          View Maturity Schedule
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel p-8 rounded-xl min-h-[280px] animate-pulse">
              <div className="h-4 w-24 bg-surface-container-high rounded mb-6" />
              <div className="h-6 w-36 bg-surface-container-high rounded mb-8" />
              <div className="space-y-4">
                <div className="h-4 w-full bg-surface-container-high rounded" />
                <div className="h-4 w-3/4 bg-surface-container-high rounded" />
                <div className="h-4 w-1/2 bg-surface-container-high rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : allPositions.length === 0 ? (
        <div className="glass-panel p-12 rounded-xl text-center">
          <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4 block">
            account_balance
          </span>
          <h4 className="text-[20px] font-display font-semibold text-primary mb-2">
            No Deposit Positions
          </h4>
          <p className="text-on-surface-variant font-body-md text-sm max-w-md mx-auto">
            Make your first deposit to start earning yield. Your locked positions will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
          {allPositions.map((position, i) => (
            <PositionCard
              key={position.id}
              position={position}
              dark={i % 3 === 1}
            />
          ))}
        </div>
      )}
    </section>
  );
}
