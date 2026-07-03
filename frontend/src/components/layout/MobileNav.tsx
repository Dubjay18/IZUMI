import { Link, useLocation } from "react-router-dom";

const MOBILE_TABS = [
  { label: "Dashboard", icon: "dashboard", href: "/dashboard" },
  { label: "Invest", icon: "account_balance_wallet", href: "/dashboard/deposit" },
  { label: "Withdraw", icon: "payments", href: "/withdrawal" },
  { label: "Compliance", icon: "verified_user", href: "/compliance" },
] as const;

export function MobileNav() {
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center px-2 py-2 h-20 bg-surface/90 backdrop-blur-lg shadow-[0px_-4px_20px_rgba(0,0,0,0.04)] rounded-t-xl">
      {MOBILE_TABS.map((tab) => {
        const active = isActive(tab.href);
        return (
          <Link
            key={tab.label}
            to={tab.href}
            className={`flex flex-col items-center justify-center px-4 py-1 transition-colors ${
              active
                ? "bg-secondary-container text-on-secondary-container rounded-full"
                : "text-on-surface-variant"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {tab.icon}
            </span>
            <span className="text-[12px] font-body font-medium">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
