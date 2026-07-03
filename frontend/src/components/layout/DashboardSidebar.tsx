const SIDEBAR_LINKS = [
  { label: "Dashboard", icon: "dashboard", active: true },
  { label: "Portfolio", icon: "account_balance_wallet", active: false },
  { label: "Insights", icon: "analytics", active: false },
  { label: "Impact", icon: "diversity_3", active: false },
] as const;

export function DashboardSidebar() {
  return (
    <aside className="hidden lg:flex flex-col col-span-2 gap-8 h-[calc(100vh-120px)] sticky top-24">
      <nav className="flex flex-col gap-2">
        {SIDEBAR_LINKS.map((link) => (
          <a
            key={link.label}
            href="#"
            className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all active:scale-95 ${
              link.active
                ? "bg-secondary-container text-on-secondary-container font-bold"
                : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={
                link.active
                  ? { fontVariationSettings: "'FILL' 1" }
                  : undefined
              }
            >
              {link.icon}
            </span>
            <span className="text-[12px] font-body font-medium">
              {link.label}
            </span>
          </a>
        ))}
      </nav>

      <div className="mt-auto glass-panel p-6 rounded-xl relative overflow-hidden">
        <div className="absolute -bottom-4 -right-4 opacity-10">
          <span className="material-symbols-outlined text-6xl text-secondary">
            verified_user
          </span>
        </div>
        <h4 className="text-[14px] font-body font-semibold text-secondary uppercase tracking-[0.15em] mb-2">
          Concierge
        </h4>
        <p className="text-[16px] font-body text-on-surface mb-4">
          Dedicated advisor online.
        </p>
        <button className="w-full bg-primary text-secondary-fixed py-2 rounded-lg text-[12px] font-body font-bold hover:shadow-lg transition-all active:scale-95">
          Message Izumi
        </button>
      </div>
    </aside>
  );
}
