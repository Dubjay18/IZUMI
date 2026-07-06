import { useNavigate } from "react-router-dom";

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background parabolic shapes */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-primary-container/5 rounded-bl-[400px] transform translate-x-20 -translate-y-20" />
        <div className="absolute bottom-0 left-0 w-1/2 h-2/3 border-t border-r border-secondary-fixed/20 rounded-tr-[500px]" />
      </div>

      <div className="container mx-auto px-10 grid grid-cols-12 gap-6 relative z-10">
        {/* Left content */}
        <div className="col-span-12 lg:col-span-7 flex flex-col justify-center space-y-8">
          <div className="space-y-2">
            <span className="text-[14px] font-body font-semibold text-secondary uppercase tracking-[0.3em]">
              Institutional Grade Philosophy
            </span>
            <h1 className="text-[56px] font-display font-bold text-primary leading-[1.1] tracking-[-0.02em]">
              The Source of <br />
              <span className="italic text-primary-fixed-dim">
                Perpetual Prosperity.
              </span>
            </h1>
          </div>

          <p className="text-[18px] font-body text-on-surface-variant max-w-xl leading-[1.6]">
            Izumi Fountain redefines private wealth management through a curated
            lens of editorial precision and visionary strategy. We steward capital
            with the fluidity of water and the permanence of stone.
          </p>

          {/* Dual-path CTA */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              id="hero-cta-saver"
              onClick={() => navigate("/onboard")}
              className="group relative bg-primary text-secondary-fixed px-10 py-5 rounded-full text-[14px] font-body uppercase tracking-[0.15em] font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-3 overflow-hidden"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary-fixed/70 group-hover:text-secondary-fixed transition-colors">
                savings
              </span>
              Save &amp; Earn
              <span className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              id="hero-cta-borrower"
              onClick={() => navigate("/borrow/onboard")}
              className="group border border-primary text-primary px-10 py-5 rounded-full text-[14px] font-body uppercase tracking-[0.15em] font-semibold hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined text-[18px] transition-colors group-hover:text-white">
                business_center
              </span>
              Apply for Credit
            </button>
          </div>

          {/* Role labels */}
          <div className="flex gap-10 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              <span className="text-[12px] font-body text-on-surface-variant tracking-wide">
                Individual Savers &amp; Investors
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block" />
              <span className="text-[12px] font-body text-on-surface-variant tracking-wide">
                Corporate &amp; Institutional Borrowers
              </span>
            </div>
          </div>
        </div>

        {/* Right image card */}
        <div className="col-span-12 lg:col-span-5 relative">
          <div className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl hover-lift">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHcLlfSiGtsfllA6wxzwaiyt7r2M5kkWE4RYzWnQDL8zzmc1HyUFwSgI_SQAsGxEycbZT1GswKvrBZOIu5-qKDjJA-T5AMJ2xUfkeaDSmJrHlIHb_6r6XJYU59CxV_5Yp_Mp3SUQXAC6F7HzOuQiDCGUC0Uvd27pkfdnRNMtdtiu4xGxfUbpm-weNCBtyUukxv8VScIzSHmutCKEsOc7x4plcjdPTKVPV7TVDwkTJDeRXJHBw6RBm1"
              alt="Modern architectural structure with cascading water features"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 glass-panel p-6 rounded-2xl">
              <p className="text-xs font-body text-secondary-fixed mb-2 tracking-[0.15em] uppercase font-semibold">
                Currently Stewarding
              </p>
              <p className="text-2xl font-display font-semibold text-primary">
                $4.2B in Sustainable Assets
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
