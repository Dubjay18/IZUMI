import { Link } from "react-router-dom";

const NAV_LINKS = ["Dashboard", "Invest", "Credit", "Settings"] as const;

export function DashboardHeader() {
  return (
    <header className="flex justify-between items-center px-10 h-16 w-full fixed top-0 z-50 bg-surface/80 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
          <img
            src="https://lh3.googleusercontent.com/aida/AP1WRLsnnW5QHpNXUie_IG7utyOUeF6-kEGW_OED3NyOFV18kvh3PqIAwmKCg3Ywu9qK_TtlUGQfTjLcobo_pBkXQ_wVpmaQxU-LpzybVcr82RaEcluvTjx8TfnRHxQBD7WS_D5o7MJsE49OXm61IxjiB_8w3us59IEAltIpnAKgfxvc1Nsd-Kc6zNH5u63pg7skERonRnSCXj_2O5VfeBNRy5ena82kmxamqX1xNcHaTU-Pmgl3KFKHu0NdgxM"
            alt="Izumi Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <Link
          to="/"
          className="font-display text-[32px] font-bold text-primary"
        >
          Izumi
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map((link, i) => (
          <button
            key={link}
            className={`text-[12px] font-body font-medium transition-all ${
              i === 0
                ? "text-primary font-bold"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            {link}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-primary">
            notifications
          </span>
        </button>
        <div className="w-10 h-10 rounded-full bg-surface-variant border border-outline-variant overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqjiGiA-PlEaJp5rk5lhlLHZzqfWNGRFsZcaSIFWnN0BzSg2Tue0ajnlXytPPTjn_qbPuyVzUIYdPOCi8B1BANaReD3udTC__cHf_eFnLi7FmH74sw-thiUBS0yxkLA5urrHmwky4lYicHu1hY5pAgu9zckm8NeAvo7ThIeI0K8oQfS0Eckuh_i9ZbQzRw8AEAeA4v0cOb410U81h1MC2NnpOVUfhaZBxqXDjQi7gtdJixSyHYLL7m"
            alt="Profile"
          />
        </div>
      </div>
    </header>
  );
}
