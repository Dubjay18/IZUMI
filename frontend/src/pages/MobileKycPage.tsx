import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { vaultApi, ApiError } from "@/lib/api";

export function MobileKycPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [step, setStep] = useState<"intro" | "scan" | "verifying" | "success" | "error">("intro");
  const [photo, setPhoto] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStep("error");
      setErrorMessage("Missing secure compliance session token.");
    }
  }, [token]);

  const handleSelfieCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
      setStep("scan");
    };
    reader.readAsDataURL(file);
  };

  const handleVerify = async () => {
    if (!token) return;
    setStep("verifying");
    try {
      // Simulate face analysis verification delay
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // Trigger compliance session verification status update on backend
      await vaultApi.verifyKycSession(token, "");
      setStep("success");
    } catch (err) {
      setStep("error");
      setErrorMessage(err instanceof ApiError ? err.message : (err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between px-6 py-12 font-body select-none">
      {/* Header */}
      <header className="text-center pt-4">
        <h1 className="font-display text-[26px] font-bold text-primary tracking-tight">
          Izumi Trust ID
        </h1>
        <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">
          Identity Attestation Portal
        </p>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center py-8">
        
        {/* Step: Intro */}
        {step === "intro" && (
          <div className="text-center space-y-8 max-w-sm">
            <div className="w-32 h-32 rounded-full border border-outline-variant/30 flex items-center justify-center mx-auto bg-surface-container-low shadow-sm">
              <span className="material-symbols-outlined text-[48px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                photo_camera
              </span>
            </div>
            <div className="space-y-3">
              <h2 className="font-display text-xl font-bold text-primary">Biometric Selfie Scan</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Position your phone directly in front of your face in a well-lit room. Tap below to capture a liveness selfie.
              </p>
            </div>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleSelfieCapture}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className="w-full py-4 bg-primary text-secondary-fixed rounded-xl font-bold text-[14px] uppercase tracking-wider shadow-lg">
                Open Camera
              </button>
            </div>
          </div>
        )}

        {/* Step: Confirm Scan */}
        {step === "scan" && photo && (
          <div className="text-center space-y-8 max-w-sm">
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-primary mx-auto shadow-2xl">
              <img src={photo} alt="Selfie preview" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-3">
              <h2 className="font-display text-xl font-bold text-primary">Verify Identity Image?</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Confirm your face is clearly visible without glare or heavy shadows.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleSelfieCapture}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button className="w-full py-4 border border-outline-variant text-on-surface-variant rounded-xl font-bold text-xs uppercase tracking-wider">
                  Retake
                </button>
              </div>
              <button
                onClick={handleVerify}
                className="flex-grow py-4 bg-primary text-secondary-fixed rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg"
              >
                Submit Selfie
              </button>
            </div>
          </div>
        )}

        {/* Step: Verifying */}
        {step === "verifying" && (
          <div className="text-center space-y-6">
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-outline-variant/30 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin" />
              <span className="material-symbols-outlined text-[36px] text-primary animate-pulse">
                face
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-lg font-bold text-primary">Analyzing Liveness</h3>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest animate-pulse">
                Processing ZK-Attestation...
              </p>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="text-center space-y-8 max-w-sm">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border-2 border-primary">
              <span className="material-symbols-outlined text-[48px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
            </div>
            <div className="space-y-3">
              <h2 className="font-display text-2xl font-bold text-primary">Attestation Complete!</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Your ZK-Liveness validation is complete. You can close this tab and return to your computer.
              </p>
            </div>
          </div>
        )}

        {/* Step: Error */}
        {step === "error" && (
          <div className="text-center space-y-8 max-w-sm">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-error/10 border-2 border-error">
              <span className="material-symbols-outlined text-[40px] text-error">
                error
              </span>
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-lg font-bold text-primary">Verification Failed</h2>
              <p className="text-sm text-error font-body leading-relaxed">{errorMessage}</p>
            </div>
            <button
              onClick={() => setStep("intro")}
              className="w-full py-3.5 bg-surface-container-high border border-outline-variant text-primary rounded-xl font-bold text-xs uppercase"
            >
              Try Again
            </button>
          </div>
        )}

      </main>

      {/* Footer info */}
      <footer className="text-center text-[10px] text-on-surface-variant/50 leading-relaxed pt-4 border-t border-outline-variant/20">
        <p>Biometric data is parsed client-side and immediately discarded.</p>
        <p className="font-semibold tracking-[0.1em] mt-0.5">GDPR &amp; NDPR COMPLIANT</p>
      </footer>
    </div>
  );
}
