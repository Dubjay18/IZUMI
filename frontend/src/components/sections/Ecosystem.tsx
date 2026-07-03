export function Ecosystem() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[14px] font-body font-semibold text-secondary uppercase tracking-[0.3em]">
            The Izumi Ecosystem
          </span>
          <h2 className="text-[56px] font-display font-bold text-primary mt-4 leading-[1.1] tracking-[-0.02em]">
            Multi-Dimensional Growth
          </h2>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Large feature card */}
          <div className="md:col-span-2 glass-panel p-12 rounded-[2rem] flex flex-col justify-between hover-lift">
            <div>
              <span
                className="material-symbols-outlined text-5xl text-secondary mb-6"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                account_balance
              </span>
              <h3 className="font-display text-[32px] font-semibold mb-4 text-primary">
                Private Sovereign Fund
              </h3>
              <p className="text-[18px] font-body text-on-surface-variant max-w-md leading-[1.6]">
                Access exclusive, closed-loop investment opportunities typically
                reserved for institutional entities and family offices.
              </p>
            </div>
            <div className="mt-12 flex justify-between items-end">
              <button className="flex items-center gap-2 text-[14px] font-body font-semibold text-primary group">
                Explore Alpha
                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">
                  arrow_forward
                </span>
              </button>
              <div className="text-right">
                <p className="text-4xl font-display font-bold text-secondary">
                  24.8%
                </p>
                <p className="text-xs font-body uppercase tracking-[0.15em] text-on-surface-variant font-semibold">
                  Annualized Yield
                </p>
              </div>
            </div>
          </div>

          {/* Legacy Guardian card */}
          <div className="bg-primary text-secondary-fixed p-10 rounded-[2rem] flex flex-col justify-between hover-lift">
            <div>
              <span className="material-symbols-outlined text-4xl mb-6">
                shield_with_heart
              </span>
              <h3 className="font-display text-[32px] font-semibold mb-4">
                Legacy Guardian
              </h3>
              <p className="text-sm font-body opacity-70">
                Sophisticated estate planning integrated with philanthropic impact
                mandates.
              </p>
            </div>
            <div className="mt-8 border-t border-secondary-fixed/20 pt-6">
              <ul className="space-y-3 text-sm font-body">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed" />
                  Trust Structuring
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed" />
                  Tax Optimization
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed" />
                  Generational Transfer
                </li>
              </ul>
            </div>
          </div>

          {/* Small cards */}
          <div className="glass-panel p-8 rounded-[2rem] hover-lift border-b-4 border-secondary">
            <span className="material-symbols-outlined text-3xl text-secondary mb-4">
              trending_up
            </span>
            <h4 className="font-display text-xl font-semibold mb-2 text-primary">
              Dynamic Credit
            </h4>
            <p className="text-sm font-body text-on-surface-variant">
              Liquid lines of credit secured by your portfolio, optimized for
              immediate opportunity.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-[2rem] hover-lift">
            <span className="material-symbols-outlined text-3xl text-secondary mb-4">
              public
            </span>
            <h4 className="font-display text-xl font-semibold mb-2 text-primary">
              Global Access
            </h4>
            <p className="text-sm font-body text-on-surface-variant">
              Multi-currency accounts and offshore structures managed through a
              single portal.
            </p>
          </div>

          <div className="bg-secondary-fixed p-8 rounded-[2rem] hover-lift">
            <span className="material-symbols-outlined text-3xl text-on-secondary-fixed mb-4">
              diamond
            </span>
            <h4 className="font-display text-xl font-semibold mb-2 text-on-secondary-fixed">
              Concierge Desk
            </h4>
            <p className="text-sm font-body text-on-secondary-fixed-variant">
              Personalized advisory for lifestyle acquisitions and private equity
              ventures.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
