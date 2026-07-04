import { useState, useCallback } from "react";
import { api } from "@/services/api";

const STEPS = [
  { icon: "person_check", label: "Identity", id: "identity" },
  { icon: "generating_tokens", label: "Generation", id: "generation" },
  { icon: "verified", label: "Verification", id: "verification" },
] as const;

// Standard mock Groth16 zk-SNARK proof format matching the ZK Service validation constraints
const MOCK_ZK_PROOF = {
  pi_a: ["0x98f...", "0x2bc...", "1"],
  pi_b: [["0x111...", "0x01"], ["0x222...", "0x02"], ["1", "0"]],
  pi_c: ["0x45a...", "0x3dd...", "1"],
  publicSignals: ["0x7e53f...", "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"]
};

export function ZKProverWidget() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"SAVER" | "BORROWER">("SAVER");
  const [currentStep, setCurrentStep] = useState<"input" | "generating" | "verifying" | "success" | "error">("input");
  const [onboardedData, setOnboardedData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      setCurrentStep("generating");
      // Simulate client-side ZK-SNARK proving time
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setCurrentStep("verifying");
      
      if (role === "SAVER") {
        const response = await api.onboardSaver(name, email, MOCK_ZK_PROOF);
        setOnboardedData(response);
        // Persist session locally
        localStorage.setItem("izumi_user_role", "SAVER");
        localStorage.setItem("izumi_user_id", response.userId);
        localStorage.setItem("izumi_user_name", name);
        localStorage.setItem("izumi_user_email", email);
        localStorage.setItem("izumi_user_wallet", response.walletAddress);
        localStorage.setItem("izumi_virtual_account", JSON.stringify(response.virtualAccount));
      } else {
        const response = await api.onboardBorrower(name, email, MOCK_ZK_PROOF);
        setOnboardedData(response);
        // Persist session locally
        localStorage.setItem("izumi_user_role", "BORROWER");
        localStorage.setItem("izumi_user_id", response.borrowerId);
        localStorage.setItem("izumi_user_name", name);
        localStorage.setItem("izumi_user_email", email);
        localStorage.setItem("izumi_user_wallet", response.walletAddress);
      }

      setCurrentStep("success");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred during onboarding.");
      setCurrentStep("error");
    }
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setCurrentStep("input");
    setOnboardedData(null);
    setErrorMsg("");
  };

  return (
    <div className="glass-panel p-12 rounded-xl text-center relative overflow-hidden">
      {/* Shield Animation */}
      <div className="mb-10 relative h-48 flex items-center justify-center">
        <div className={`absolute w-32 h-32 bg-primary/5 rounded-full opacity-20 ${currentStep === "generating" || currentStep === "verifying" ? "animate-pulse" : "animate-ping-slow"}`} />
        <div className="absolute w-40 h-40 border border-primary-fixed/30 rounded-full" />
        <div className={`z-10 w-24 h-24 text-secondary-container rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${currentStep === "success" ? "bg-secondary-container text-primary" : "bg-primary text-secondary-container"}`}>
          <span
            className="material-symbols-outlined text-[48px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {currentStep === "success" ? "verified" : currentStep === "error" ? "gpp_bad" : "shield_lock"}
          </span>
        </div>
        {/* Parabolic SVG paths */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
          viewBox="0 0 400 200"
        >
          <path
            className="text-primary"
            d="M50,150 Q200,20 350,150"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            className="text-primary"
            d="M20,180 Q200,0 380,180"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Heading */}
      <div className="max-w-md mx-auto space-y-2 mb-8">
        <h1 className="font-display text-[32px] font-semibold text-primary leading-tight">
          Compliance Shield
        </h1>
        <p className="text-on-surface-variant font-body leading-relaxed text-sm">
          Generate a zero-knowledge proof of regulatory standing without
          revealing your underlying sensitive credentials.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-4 max-w-lg mx-auto mb-10">
        {STEPS.map((step, index) => {
          const isActive = 
            (step.id === "identity" && currentStep !== "success") ||
            (step.id === "generation" && (currentStep === "generating" || currentStep === "verifying" || currentStep === "success")) ||
            (step.id === "verification" && (currentStep === "verifying" || currentStep === "success"));

          return (
            <div key={step.label} className="contents">
              <div className="flex-1 flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-high text-outline"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {step.icon}
                  </span>
                </div>
                <span
                  className={`text-[12px] font-body transition-all ${
                    isActive
                      ? "font-bold text-primary"
                      : "font-semibold text-on-surface-variant"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className="w-12 h-[2px] bg-outline-variant mb-6" />
              )}
            </div>
          );
        })}
      </div>

      {/* Form / Actions */}
      {currentStep === "input" && (
        <form onSubmit={handleOnboard} className="text-left max-w-md mx-auto space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Onboarding Persona</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("SAVER")}
                className={`py-3 rounded-lg border font-bold text-sm transition-all ${role === "SAVER" ? "border-primary bg-primary/10 text-primary" : "border-outline-variant text-on-surface-variant"}`}
              >
                Retail Saver
              </button>
              <button
                type="button"
                onClick={() => setRole("BORROWER")}
                className={`py-3 rounded-lg border font-bold text-sm transition-all ${role === "BORROWER" ? "border-primary bg-primary/10 text-primary" : "border-outline-variant text-on-surface-variant"}`}
              >
                SME Merchant
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Full Name / Business Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chinedu Stores"
              className="w-full p-3 bg-white border border-outline-variant rounded-lg text-sm focus:border-primary outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. chinedu@stores.com"
              className="w-full p-3 bg-white border border-outline-variant rounded-lg text-sm focus:border-primary outline-none"
              required
            />
          </div>

          <button
            type="submit"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`w-full py-4 mt-4 bg-primary text-secondary-container rounded-full text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-md flex items-center justify-center gap-3 cursor-pointer ${isHovered ? "shimmer" : ""}`}
          >
            GENERATE ZK PROOF & ONBOARD
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </form>
      )}

      {currentStep === "generating" && (
        <div className="p-8 bg-surface-container-low rounded-lg border border-outline-variant/30 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-bold text-primary">Generating Cryptographic Proof...</p>
          <p className="text-xs text-on-surface-variant">Hashing parameters & signing locally using groth16 prover</p>
        </div>
      )}

      {currentStep === "verifying" && (
        <div className="p-8 bg-surface-container-low rounded-lg border border-outline-variant/30 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-bold text-secondary">Verifying Proof On-Chain...</p>
          <p className="text-xs text-on-surface-variant">Checking signature verification keys & creating gas-less wallet</p>
        </div>
      )}

      {currentStep === "success" && (
        <div className="p-8 bg-surface-container-low rounded-lg border border-outline-variant/30 text-left space-y-5 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-secondary">Onboarding Verified!</span>
            <span className="material-symbols-outlined text-secondary">check_circle</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="font-bold text-on-surface-variant uppercase tracking-wider block">Assigned User ID</span>
              <span className="font-mono text-on-surface break-all bg-white p-2 border border-outline-variant/40 rounded block mt-1">{onboardedData?.userId || onboardedData?.borrowerId}</span>
            </div>
            <div>
              <span className="font-bold text-on-surface-variant uppercase tracking-wider block">Gas-less Web3 Wallet</span>
              <span className="font-mono text-on-surface break-all bg-white p-2 border border-outline-variant/40 rounded block mt-1">{onboardedData?.walletAddress}</span>
            </div>
            {onboardedData?.virtualAccount && (
              <div>
                <span className="font-bold text-on-surface-variant uppercase tracking-wider block">Nomba Virtual Bank Account</span>
                <div className="bg-white p-3 border border-outline-variant/40 rounded space-y-1 mt-1 font-semibold text-on-surface">
                  <p>Bank: {onboardedData.virtualAccount.bankName}</p>
                  <p>Name: {onboardedData.virtualAccount.accountName}</p>
                  <p className="text-sm text-primary font-bold">Number: {onboardedData.virtualAccount.accountNumber}</p>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="w-full py-3 bg-secondary text-on-secondary rounded-lg font-bold text-xs uppercase tracking-wider text-center cursor-pointer"
          >
            Onboard Another Account
          </button>
        </div>
      )}

      {currentStep === "error" && (
        <div className="p-8 bg-error-container text-on-error-container rounded-lg border border-error/20 text-center space-y-4 max-w-md mx-auto">
          <p className="font-bold text-error">Onboarding Failed</p>
          <p className="text-sm leading-relaxed">{errorMsg}</p>
          <button
            type="button"
            onClick={handleReset}
            className="w-full py-3 bg-error text-white rounded-lg font-bold text-xs uppercase tracking-wider text-center cursor-pointer"
          >
            Retry Form
          </button>
        </div>
      )}
    </div>
  );
}

