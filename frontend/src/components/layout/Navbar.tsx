import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "@/context/UserContext";

const LOGO_SRC = "/screen.png";

const LANDING_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Invest", href: "/dashboard/deposit" },
  { label: "Credit", href: "#" },
  { label: "Settings", href: "#" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const { session } = useUser();
  const shortWallet = session?.walletAddress
    ? `${session.walletAddress.slice(0, 6)}…${session.walletAddress.slice(-4)}`
    : "0x88…f241";

  useEffect(() => {
    if (!isLanding) return;
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLanding]);

  if (isLanding) {
    return (
      <nav
        className={`fixed top-0 z-50 w-full flex justify-between items-center px-10 transition-all duration-300 bg-surface/80 backdrop-blur-md ${
          scrolled ? "h-16 shadow-sm" : "h-20"
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-full overflow-hidden">
            <img src={LOGO_SRC} alt="Izumi Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-display text-[32px] font-bold text-primary tracking-tight">
            Izumi
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-10">
          {LANDING_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-[14px] font-body uppercase tracking-[0.15em] font-semibold transition-colors text-on-surface-variant hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          {session ? (
            <Link
              to="/dashboard"
              className="bg-primary text-secondary-fixed px-8 py-3 rounded-full text-[14px] font-body uppercase tracking-[0.15em] font-semibold hover:shadow-lg transition-all active:scale-95"
            >
              Open Dashboard
            </Link>
          ) : (
            <Link
              to="/onboard"
              className="bg-primary text-secondary-fixed px-8 py-3 rounded-full text-[14px] font-body uppercase tracking-[0.15em] font-semibold hover:shadow-lg transition-all active:scale-95"
            >
              Get Started
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-primary">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </nav>
    );
  }

  // ── App mode: logo + global controls only (sidebar owns primary nav) ───────
  return (
    <header className="flex justify-between items-center px-6 h-16 w-full fixed top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
          <img src={LOGO_SRC} alt="Izumi Logo" className="w-full h-full object-contain" />
        </div>
        <span className="font-display text-[28px] font-bold text-primary tracking-tight">
          Izumi
        </span>
      </Link>

      {/* Right: notifications + wallet */}
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-[20px] text-primary">notifications</span>
        </button>
        <div className="h-6 w-px bg-outline-variant/60" />
        <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant/20 cursor-pointer hover:border-outline-variant/50 transition-colors">
          <div className="w-2 h-2 rounded-full bg-surface-tint" />
          <span className="text-[12px] font-body font-medium">{shortWallet}</span>
        </div>
      </div>
    </header>
  );
}
