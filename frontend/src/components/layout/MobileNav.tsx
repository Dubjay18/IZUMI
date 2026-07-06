import { Link, useLocation } from "react-router-dom";
import { useUser } from "@/context/UserContext";

const SAVER_TABS = [
  { label: "Dashboard", icon: "dashboard",               href: "/dashboard" },
  { label: "Invest",    icon: "account_balance_wallet",  href: "/dashboard/deposit" },
  { label: "Withdraw",  icon: "payments",                href: "/withdrawal" },
  { label: "History",   icon: "receipt_long",            href: "/dashboard/history" },
] as const;

const BORROWER_TABS = [
  { label: "Dashboard", icon: "dashboard",      href: "/borrow/dashboard" },
  { label: "Apply",     icon: "request_quote",  href: "/borrow/apply" },
  { label: "Ledger",    icon: "receipt_long",   href: "/borrow/ledger" },
  { label: "Advisor",   icon: "smart_toy",      href: "/borrow/advisor" },
  { label: "Settings",  icon: "settings",       href: "/borrow/settings" },
] as const;

const ADMIN_TABS = [
  { label: "Underwriter", icon: "manage_accounts", href: "/underwriter/admin" },
  { label: "Compliance",  icon: "shield_lock",     href: "/compliance" },
  { label: "Vault",       icon: "monitoring",      href: "/admin/vault" },
  { label: "Checklist",   icon: "checklist",       href: "/admin/compliance-checklist" },
] as const;

export function MobileNav() {
  const location = useLocation();
  const { session } = useUser();
  const MOBILE_TABS =
    session?.role === "UNDERWRITER"
      ? ADMIN_TABS
      : session?.role === "BORROWER"
      ? BORROWER_TABS
      : SAVER_TABS;

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center px-2 py-2 h-20 bg-surface/90 backdrop-blur-lg shadow-[0px_-4px_20px_rgba(0,0,0,0.04)] rounded-t-xl">
      {MOBILE_TABS.map((tab) => {
        const active = isActive(tab.href);
        return (
          <Link
            key={tab.label}
            to={tab.href}
            className={`flex flex-col items-center justify-center px-3 py-1 transition-colors ${
              active
                ? "bg-secondary-container text-on-secondary-container rounded-full"
                : "text-on-surface-variant"
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {tab.icon}
            </span>
            <span className="text-[11px] font-body font-medium mt-0.5">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
