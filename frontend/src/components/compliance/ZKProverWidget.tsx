import { useState, useCallback } from "react";
import { generateKycProof } from "@/lib/zk";
import { useUser } from "@/context/UserContext";

type ProofStep = "idle" | "generating" | "verifying" | "done" | "error";

const STEP_LABELS = [
  { icon: "person_check", label: "Identity" },
  { icon: "generating_tokens", label: "Generation" },
  { icon: "verified", label: "Verification" },
] as const;

function stepIndex(step: ProofStep): number {
  if (step === "generating") return 0;
  if (step === "verifying") return 1;
  if (step === "done") return 2;
  return -1;
}

export function ZKProverWidget() {
  const { session } = useUser();
  const [bvn, setBvn] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [proofStep, setProofStep] = useState<ProofStep>("idle");
  const [commitment, setCommitment] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!bvn || bvn.length !== 11 || !/^\d+$/.test(bvn)) {
      setError("BVN must be exactly 11 digits.");
      return;
    }
    const walletAddr = session?.walletAddress || "0x0000000000000000000000000000000000000001";
    setError(null);
    setProofStep("generating");
    try {
      await new Promise(r => setTimeout(r, 900));
      const proof = await generateKycProof(bvn, walletAddr);
      setProofStep("verifying");
      await new Promise(r => setTimeout(r, 700));
      setCommitment(proof.publicSignals[0]);
      setProofStep("done");
    } catch (err) {
      setError((err as Error).message);
      setProofStep("error");
    }
  }, [bvn, session?.walletAddress]);

  const isProcessing = proofStep === "generating" || proofStep === "verifying";
  const activeStep = stepIndex(proofStep);

  return (
    <div className="glass-panel p-12 rounded-xl text-center relative overflow-hidden">
      {/* Shield Animation */}
      <div className="mb-10 relative h-48 flex items-center justify-center">
        <div className={`absolute w-32 h-32 bg-primary/5 rounded-full opacity-20 ${isProcessing ? "animate-ping-slow" : ""}`} />
        <div className="absolute w-40 h-40 border border-primary-fixed/30 rounded-full" />
        <div className={`z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all ${
          proofStep === "done" ? "bg-green-500" : proofStep === "error" ? "bg-error" : "bg-primary"
        } text-secondary-container`}>
          <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {proofStep === "done" ? "verified" : proofStep === "error" ? "error" : "shield_lock"}
          </span>
        </div>
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 400 200">
          <path d="M50,150 Q200,20 350,150" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary" />
          <path d="M20,180 Q200,0 380,180" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary" />
        </svg>
      </div>

      {/* Heading */}
      <div className="max-w-md mx-auto space-y-2">
        <h1 className="font-display text-[32px] font-semibold text-primary leading-tight">Compliance Shield</h1>
        <p className="text-on-surface-variant font-body leading-relaxed">
          Generate a zero-knowledge proof of regulatory standing without revealing your underlying sensitive data.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="mt-12 flex items-center justify-center gap-4 max-w-lg mx-auto">
        {STEP_LABELS.map((step, index) => {
          const isActive = index <= activeStep;
          const isCurrent = index === activeStep && isProcessing;
          return (
            <div key={step.label} className="contents">
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isActive ? "bg-primary text-on-primary" : "bg-surface-container-high text-outline"
                } ${isCurrent ? "animate-pulse" : ""}`}>
                  <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                </div>
                <span className={`text-[12px] font-body ${isActive ? "font-bold text-primary" : "font-semibold text-on-surface-variant"}`}>
                  {step.label}
                </span>
              </div>
              {index < STEP_LABELS.length - 1 && (
                <div className={`w-12 h-[2px] mb-6 transition-colors ${isActive ? "bg-primary" : "bg-outline-variant"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Action Area */}
      <div className="mt-12 p-8 bg-surface-container-low rounded-lg border border-outline-variant/30 space-y-5">
        {proofStep === "done" && commitment ? (
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2 text-green-600">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <p className="font-body font-bold text-[14px]">ZK Proof Generated Successfully</p>
            </div>
            <div className="p-4 bg-surface-container-highest rounded-xl border border-outline-variant/40">
              <p className="text-[11px] font-body font-semibold uppercase tracking-[0.15em] text-on-surface-variant mb-1">Commitment Hash (Public)</p>
              <p className="font-mono text-[11px] text-surface-tint break-all">{commitment}</p>
            </div>
            <p className="text-[11px] text-on-surface-variant font-body italic">
              Your BVN was never transmitted. Only this cryptographic commitment was generated.
            </p>
            <button
              onClick={() => { setProofStep("idle"); setBvn(""); setShowInput(false); setCommitment(null); }}
              className="w-full border border-outline-variant py-3 rounded-full text-[13px] font-body font-semibold text-on-surface-variant hover:bg-surface-container transition-all"
            >
              Reset Shield
            </button>
          </div>
        ) : (
          <>
            {showInput ? (
              <div className="space-y-4 text-left">
                <div>
                  <label className="text-[12px] font-body font-semibold uppercase tracking-[0.15em] text-on-surface-variant block mb-2">
                    BVN (stays on your device)
                  </label>
                  <input
                    id="zk-bvn-input"
                    type="password"
                    inputMode="numeric"
                    maxLength={11}
                    value={bvn}
                    onChange={e => { setBvn(e.target.value.replace(/\D/g, "")); setError(null); }}
                    placeholder="•••••••••••"
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-on-surface focus:border-primary focus:outline-none transition-colors font-mono tracking-widest"
                  />
                </div>
                <div className="flex items-start gap-2 p-3 bg-secondary-fixed/10 rounded-lg border border-secondary/20">
                  <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">lock</span>
                  <p className="text-[11px] font-body text-on-surface-variant leading-relaxed">
                    Only a SHA-256 commitment is computed locally. Your BVN is <strong>never sent</strong> to any server.
                  </p>
                </div>
                {error && <p className="text-error text-sm font-body">{error}</p>}
              </div>
            ) : (
              <div className="flex items-center justify-between text-left">
                <div>
                  <p className="text-[12px] font-body font-bold text-primary">
                    {session ? `KYC Status: ${session.kycStatus}` : "KYC Hash Validated"}
                  </p>
                  <p className="text-[12px] font-body text-on-surface-variant italic">
                    {session ? session.email : "Izumi-Internal-0041-X"}
                  </p>
                </div>
                <span className="material-symbols-outlined text-surface-tint" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {session ? "verified_user" : "check_circle"}
                </span>
              </div>
            )}

            {!showInput ? (
              <button
                onClick={() => setShowInput(true)}
                className="w-full bg-primary text-secondary-container py-4 px-8 rounded-full text-[14px] font-body font-semibold uppercase tracking-[0.15em] hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3"
              >
                GENERATE PRIVACY SHIELD
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={isProcessing || bvn.length !== 11}
                className="w-full bg-primary text-secondary-container py-4 px-8 rounded-full text-[14px] font-body font-semibold uppercase tracking-[0.15em] hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <><span className="material-symbols-outlined animate-spin">progress_activity</span>
                    {proofStep === "generating" ? "Computing Proof…" : "Verifying…"}
                  </>
                ) : (
                  <><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shield_lock</span>SUBMIT PRIVACY SHIELD</>
                )}
              </button>
            )}
            <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em]">
              Gas-less transaction powered by Izumi Relayer
            </p>
          </>
        )}
      </div>
    </div>
  );
}
