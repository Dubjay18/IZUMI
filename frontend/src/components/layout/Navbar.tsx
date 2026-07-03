import { useEffect, useState } from "react";

const NAV_LINKS = ["Dashboard", "Invest", "Credit", "Settings"] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 w-full flex justify-between items-center px-10 transition-all duration-300 bg-surface/80 backdrop-blur-md ${
        scrolled ? "h-16 shadow-sm" : "h-20"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-full overflow-hidden">
          <img
            src="https://lh3.googleusercontent.com/aida/AP1WRLsnnW5QHpNXUie_IG7utyOUeF6-kEGW_OED3NyOFV18kvh3PqIAwmKCg3Ywu9qK_TtlUGQfTjLcobo_pBkXQ_wVpmaQxU-LpzybVcr82RaEcluvTjx8TfnRHxQBD7WS_D5o7MJsE49OXm61IxjiB_8w3us59IEAltIpnAKgfxvc1Nsd-Kc6zNH5u63pg7skERonRnSCXj_2O5VfeBNRy5ena82kmxamqX1xNcHaTU-Pmgl3KFKHu0NdgxM"
            alt="Izumi Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <span className="font-display text-[32px] font-bold text-primary tracking-tight">
          Izumi
        </span>
      </div>

      <div className="hidden md:flex items-center gap-10">
        {NAV_LINKS.map((link, i) => (
          <a
            key={link}
            href="#"
            className={`text-[14px] font-body uppercase tracking-[0.15em] font-semibold transition-colors ${
              i === 0
                ? "text-primary hover:text-secondary"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            {link}
          </a>
        ))}
        <button className="bg-primary text-secondary-fixed px-8 py-3 rounded-full text-[14px] font-body uppercase tracking-[0.15em] font-semibold hover:shadow-lg transition-all active:scale-95">
          <img
            src="https://lh3.googleusercontent.com/aida/AP1WRLsnnW5QHpNXUie_IG7utyOUeF6-kEGW_OED3NyOFV18kvh3PqIAwmKCg3Ywu9qK_TtlUGQfTjLcobo_pBkXQ_wVpmaQxU-LpzybVcr82RaEcluvTjx8TfnRHxQBD7WS_D5o7MJsE49OXm61IxjiB_8w3us59IEAltIpnAKgfxvc1Nsd-Kc6zNH5u63pg7skERonRnSCXj_2O5VfeBNRy5ena82kmxamqX1xNcHaTU-Pmgl3KFKHu0NdgxM"
            alt="Izumi Logo"
            className="w-full h-full object-contain"
          />
        </button>
      </div>

      <button className="md:hidden text-primary">
        <span className="material-symbols-outlined">menu</span>
      </button>
    </nav>
  );
}
