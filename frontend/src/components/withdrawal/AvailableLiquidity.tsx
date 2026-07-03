export function AvailableLiquidity() {
  return (
    <section className="mb-[80px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[14px] font-body font-semibold uppercase tracking-[0.15em] text-secondary mb-2 block">
            Executive Overview
          </span>
          <h2 className="text-[56px] font-display font-bold text-primary leading-[1.1] tracking-[-0.02em] mb-2">
            Available Liquidity
          </h2>
          <p className="text-on-surface-variant text-[18px] font-body max-w-xl leading-[1.6]">
            Assets immediately ready for transfer to your linked accounts. Capital
            growth is calculated in real-time.
          </p>
        </div>

        <div className="bg-primary text-on-primary p-8 rounded-xl shadow-xl flex flex-col min-w-[320px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl">
              account_balance_wallet
            </span>
          </div>
          <span className="text-[12px] font-body font-semibold text-primary-fixed-dim uppercase tracking-[0.15em] mb-4">
            Current USD Balance
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[40px] font-display font-bold">$142,850</span>
            <span className="text-xl text-primary-fixed-dim">.64</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-primary-fixed">
            <span className="material-symbols-outlined text-sm">
              trending_up
            </span>
            <span className="text-[12px] font-body font-medium">
              +2.4% from last session
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
