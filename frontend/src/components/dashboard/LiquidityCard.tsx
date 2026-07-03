export function LiquidityCard() {
  return (
    <div className="relative bg-primary rounded-2xl p-10 overflow-hidden text-secondary-fixed min-h-[320px] flex flex-col justify-between">
      <div className="relative z-10">
        <p className="text-[14px] font-body font-semibold uppercase tracking-[0.15em] text-primary-fixed-dim opacity-80">
          Global Liquidity Pool
        </p>
        <h2 className="text-[56px] font-display font-bold text-secondary-fixed mt-4 leading-[1.1] tracking-[-0.02em]">
          $4,892,150.00
        </h2>
        <div className="flex items-center gap-2 mt-2 text-secondary-fixed-dim">
          <span className="material-symbols-outlined text-sm">
            trending_up
          </span>
          <span className="text-[12px] font-body font-medium">
            + 12.4% vs last quarter
          </span>
        </div>
      </div>

      <div className="relative z-10 flex gap-4 mt-8">
        <button className="px-8 py-3 bg-secondary-container text-on-secondary-container rounded-full font-bold text-[12px] font-body flex items-center gap-2 active:scale-95 transition-transform">
          <span className="material-symbols-outlined">add</span>
          Allocate Capital
        </button>
        <button className="px-8 py-3 border border-primary-fixed-dim text-primary-fixed-dim rounded-full font-bold text-[12px] font-body active:scale-95 transition-transform">
          Detailed Statement
        </button>
      </div>
    </div>
  );
}
