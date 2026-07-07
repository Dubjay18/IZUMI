import { Link, useLocation } from "react-router-dom";
import { useUser } from "@/context/UserContext";

const LOGO_SRC = "/screen.png";

const SAVER_LINKS = [
  { label: "Dashboard",  icon: "dashboard",               href: "/dashboard" },
  { label: "Invest",     icon: "account_balance_wallet",  href: "/dashboard/deposit" },
  { label: "Withdraw",   icon: "payments",                href: "/withdrawal" },
  { label: "Portfolio",  icon: "pie_chart",               href: "/dashboard/portfolio" },
  { label: "History",    icon: "receipt_long",            href: "/dashboard/history" },
  { label: "Compliance", icon: "verified_user",           href: "/compliance" },
] as const;

const BORROWER_LINKS = [
  { label: "Dashboard",     icon: "dashboard",        href: "/borrow/dashboard" },
  { label: "Apply for Loan", icon: "request_quote",   href: "/borrow/apply" },
  { label: "Amortization",  icon: "bar_chart",        href: "/dashboard/amortization" },
  { label: "Ingestion",     icon: "sync",             href: "/ingestion" },
  { label: "Ledger",        icon: "receipt_long",     href: "/borrow/ledger" },
  { label: "AI Advisor",    icon: "smart_toy",        href: "/borrow/advisor" },
  { label: "Settings",      icon: "settings",         href: "/borrow/settings" },
] as const;

const ADMIN_LINKS = [
  { label: "Underwriter",   icon: "manage_accounts",  href: "/underwriter/admin" },
  { label: "ZK Compliance", icon: "shield_lock",      href: "/compliance" },
  { label: "Vault Health",  icon: "monitoring",       href: "/admin/vault" },
  { label: "Checklist",     icon: "checklist",        href: "/admin/compliance-checklist" },
  { label: "POS Manager",   icon: "point_of_sale",    href: "/admin/pos-manager" },
] as const;

export function AppSidebar() {
  const location = useLocation();
  const { session, logout } = useUser();
  const NAV_LINKS =
    session?.role === "UNDERWRITER"
      ? ADMIN_LINKS
      : session?.role === "BORROWER"
      ? BORROWER_LINKS
      : SAVER_LINKS;

  const isActive = (href: string) => {
    if (href === "#") return false;
    return location.pathname === href;
  };

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 h-[calc(100vh-64px)] sticky top-16 border-r border-outline-variant/30 bg-surface/60 backdrop-blur-sm px-3 py-6 gap-6">
      {/* Logo mark at top of sidebar */}
      <div className="flex items-center gap-2 px-3 mb-2">
        <div className="w-7 h-7 rounded-full overflow-hidden">
          <img src={LOGO_SRC} alt="Izumi" className="w-full h-full object-contain" />
        </div>
        <span className="text-[11px] font-body font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
          Navigation
        </span>
      </div>

      {/* Primary nav */}
      <nav className="flex flex-col gap-1">
        {NAV_LINKS.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.label}
              to={link.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98] ${
                active
                  ? "bg-secondary-container text-on-secondary-container font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px] transition-all"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {link.icon}
              </span>
              <span className="text-[13px] font-body font-medium">{link.label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="h-px bg-outline-variant/40 mx-1" />

      {/* Concierge card */}
      <div className="mt-auto glass-panel p-5 rounded-xl relative overflow-hidden">
        <div className="absolute -bottom-4 -right-4 opacity-10">
          <span className="material-symbols-outlined text-6xl text-secondary">
            verified_user
          </span>
        </div>
        <h4 className="text-[11px] font-body font-semibold text-secondary uppercase tracking-[0.15em] mb-1">
          {session ? session.name.split(" ")[0] : "Concierge"}
        </h4>
        <p className="text-[13px] font-body text-on-surface mb-4 leading-snug">
          {session ? `${session.role} · ${session.kycStatus}` : "Dedicated advisor online."}
        </p>
        <button className="w-full bg-primary text-secondary-fixed py-2 rounded-lg text-[11px] font-body font-bold hover:shadow-lg transition-all active:scale-95">
          Message Izumi
        </button>
        {session && (
          <button 
            onClick={logout}
            className="w-full mt-2 border border-outline hover:bg-error/10 hover:text-error py-2 rounded-lg text-[11px] font-body font-bold transition-all active:scale-95"
          >
            Logout
          </button>
        )}
      </div>
    </aside>
  );
}
