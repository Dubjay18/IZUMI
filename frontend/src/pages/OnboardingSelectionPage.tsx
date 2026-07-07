import { useNavigate } from "react-router-dom";
import { GrainOverlay } from "@/components/ui/GrainOverlay";

export function OnboardingSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col justify-between">
      <GrainOverlay />
      
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-30%] left-[-20%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[800px] h-[800px] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="w-full py-8 px-10 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-full overflow-hidden">
            <img src="/screen.png" alt="Izumi Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-display text-[28px] font-bold text-primary tracking-tight">
            Izumi
          </span>
        </div>
        <button
          onClick={() => navigate("/")}
          className="text-[12px] font-body uppercase tracking-[0.15em] font-semibold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Home
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-4xl text-center mb-12">
          <span className="text-[12px] font-body font-semibold text-secondary uppercase tracking-[0.3em] mb-3 block">
            Begin Your Journey
          </span>
          <h1 className="font-display text-[44px] sm:text-[52px] font-bold text-primary tracking-[-0.02em] leading-tight">
            Select Your Izumi Account Path
          </h1>
          <p className="text-on-surface-variant font-body text-[16px] sm:text-[18px] max-w-xl mx-auto mt-4 leading-[1.6]">
            Whether you want to shield and grow your personal capital or fuel your business expansion, we have a custom pipeline designed for you.
          </p>
        </div>

        {/* Selection Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
          
          {/* Saver Option */}
          <div className="glass-card hover-lift rounded-2xl p-8 sm:p-10 flex flex-col justify-between border border-outline-variant/40 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110" />
            
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/20 text-primary">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  savings
                </span>
              </div>
              
              <div>
                <h2 className="font-display text-[26px] font-semibold text-primary">
                  Saver &amp; Investor
                </h2>
                <p className="text-on-surface-variant font-body text-[14px] leading-relaxed mt-2">
                  Protect your personal capital from inflation by converting to yield-bearing stable assets. Secure your interest streams with advanced privacy compliance.
                </p>
              </div>

              <ul className="space-y-3 font-body text-[13px] text-on-surface-variant/80 border-t border-outline-variant/20 pt-5">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span>
                  Nomba Virtual Bank Account generation
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span>
                  Up to 5.5% APY stablecoin Yield Vaults
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span>
                  Simulated ZK-SNARK Privacy Shield KYC
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={() => navigate("/saver/onboard")}
                className="w-full py-4 bg-primary text-secondary-fixed rounded-xl font-body font-bold text-[14px] uppercase tracking-wider hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 group-hover:bg-primary-container"
              >
                Start Saver Onboarding
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Borrower Option */}
          <div className="glass-card hover-lift rounded-2xl p-8 sm:p-10 flex flex-col justify-between border border-outline-variant/40 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110" />
            
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary/10 border border-secondary/20 text-secondary">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  business_center
                </span>
              </div>
              
              <div>
                <h2 className="font-display text-[26px] font-semibold text-primary">
                  SME &amp; Borrower
                </h2>
                <p className="text-on-surface-variant font-body text-[14px] leading-relaxed mt-2">
                  Access low-interest credit lines to scale your business. Bypass predatory local banking requirements with automated sweeps from your POS transactions.
                </p>
              </div>

              <ul className="space-y-3 font-body text-[13px] text-on-surface-variant/80 border-t border-outline-variant/20 pt-5">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span>
                  Gemini AI-powered risk and credit grading
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span>
                  Daily POS sales revenue sweep repayments
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span>
                  No physical assets or land titles collateral
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={() => navigate("/borrow/onboard")}
                className="w-full py-4 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl font-body font-bold text-[14px] uppercase tracking-wider hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Start Borrower Onboarding
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-10 text-center text-on-surface-variant/50 font-body text-[12px] border-t border-outline-variant/10 relative z-10">
        &copy; 2026 Izumi Wealth Management. Secured by simulated cryptographic proof frameworks.
      </footer>
    </div>
  );
}
