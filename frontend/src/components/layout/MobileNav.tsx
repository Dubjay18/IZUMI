const MOBILE_TABS = [
  { label: "Dashboard", icon: "dashboard", active: true },
  { label: "Invest", icon: "account_balance_wallet", active: false },
  { label: "Credit", icon: "payments", active: false },
  { label: "Settings", icon: "settings", active: false },
] as const;

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center px-2 py-2 h-20 bg-surface/90 backdrop-blur-lg shadow-[0px_-4px_20px_rgba(0,0,0,0.04)] rounded-t-xl">
      {MOBILE_TABS.map((tab) => (
        <button
          key={tab.label}
          className={`flex flex-col items-center justify-center px-4 py-1 ${
            tab.active
              ? "bg-secondary-container text-on-secondary-container rounded-full"
              : "text-on-surface-variant"
          }`}
        >
          <span
            className="material-symbols-outlined"
            style={
              tab.active
                ? { fontVariationSettings: "'FILL' 1" }
                : undefined
            }
          >
            {tab.icon}
          </span>
          <span className="text-[12px] font-body font-medium">
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
