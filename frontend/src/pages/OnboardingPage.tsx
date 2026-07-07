import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { saverApi, ApiError } from "@/lib/api";
import { generateKycProof } from "@/lib/zk";
import { useUser } from "@/context/UserContext";
import { TimelineNav, type StepKey } from "@/components/onboarding/TimelineNav";

const LOGO_SRC = "/screen.png";

type KycMethod = "bvn" | "zk" | null;
type KycSubStep = "method" | "liveness";

export function OnboardingPage() {
  const navigate = useNavigate();
  const { loginAsSaver } = useUser();
  const cardRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<StepKey>("identity");
  const [kycMethod, setKycMethod] = useState<KycMethod>(null);
  const [kycSubStep, setKycSubStep] = useState<KycSubStep>("method");

  // Personal Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [consent, setConsent] = useState(false);

  // KYC inputs
  const [bvn, setBvn] = useState("");
  const [nin, setNin] = useState("");

  // Handshake and Polling states
  const [kycToken, setKycToken] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState("");

  const pollIntervalRef = useRef<any>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Mouse move effect for Card perspective
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      const moveX = (x - 0.5) * 10;
      const moveY = (y - 0.5) * 10;
      cardRef.current.style.transform = `perspective(1000px) rotateY(${moveX}deg) rotateX(${-moveY}deg)`;
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  // Cleanup polling interval and local stream on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);

  // Bind video stream object
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  function handleIdentityNext(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !consent) return;
    setStep("kyc");
    setError(null);
  }

  // Generate compliance session and start polling
  async function handleProceedToLiveness(e: React.FormEvent) {
    e.preventDefault();
    if (!kycMethod) return;

    if (bvn.length !== 11 || !/^\d+$/.test(bvn)) {
      setError("BVN must be exactly 11 digits.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 1. Create a session handshake token on the backend
      const res = await saverApi.createKycSession();
      setKycToken(res.token);
      setKycSubStep("liveness");
      setIsPolling(true);

      // 2. Poll status every 2 seconds
      pollIntervalRef.current = setInterval(async () => {
        try {
          const pollRes = await saverApi.pollKycSession(res.token);
          if (pollRes.status === "VERIFIED") {
            clearInterval(pollIntervalRef.current);
            setIsPolling(false);
            // Execute the submit flow automatically once verified!
            await executeSaverOnboarding();
          }
        } catch (pollErr) {
          console.error("KYC Polling Error:", pollErr);
        }
      }, 2000);

    } catch (err) {
      setError(err instanceof ApiError ? err.message : (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // Handle local desktop scanning using real webcam with simulated analysis
  const handleLocalDesktopScan = async () => {
    if (!kycToken) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Request webcam access and assign stream to local state
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 300, height: 300, facingMode: "user" }
      });
      setLocalStream(stream);

      // 2. Wait 3 seconds for analysis/biometric check simulation
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      // 3. Stop all camera tracks
      stream.getTracks().forEach(track => track.stop());
      setLocalStream(null);

      // 4. Mark token as verified directly on backend
      await saverApi.verifyKycSession(kycToken, "");
    } catch (err: any) {
      console.error("Local webcam access failed:", err);
      setError("Webcam access failed. Please ensure you grant camera permissions in your browser or use the mobile simulator link below.");
    } finally {
      setLoading(false);
    }
  };

  async function executeSaverOnboarding() {
    setLoading(true);
    setError(null);
    const fullName = `${firstName} ${lastName}`.trim();

    try {
      if (kycMethod === "bvn") {
        const res = await saverApi.onboard({ name: fullName, email, bvn, nin: nin || undefined });
        loginAsSaver(res.userId, fullName, email, res.walletAddress, res.virtualAccount);
        setWalletAddress(res.walletAddress);
        setStep("success");
      } else if (kycMethod === "zk") {
        const { address: targetAddress } = await saverApi.getNextAddress();
        const proof = await generateKycProof(bvn, targetAddress);
        const res = await saverApi.onboard({ name: fullName, email, zkProof: proof });
        loginAsSaver(res.userId, fullName, email, res.walletAddress, res.virtualAccount);
        setWalletAddress(res.walletAddress);
        setStep("success");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // Get QR Link for mobile browser hand-off
  const mobileKycLink = `${window.location.origin}/onboard/mobile-kyc?token=${kycToken}`;

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <div className="grain-overlay" />
      <div className="parabolic-curve -top-1/2 -left-1/4 rotate-12 fixed pointer-events-none -z-10" />
      <div className="parabolic-curve -bottom-1/2 -right-1/4 -rotate-12 fixed pointer-events-none -z-10" />

      <header className="flex justify-between items-center px-container-padding h-20 w-full fixed top-0 z-50 bg-surface/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-sm overflow-hidden">
            <img src={LOGO_SRC} alt="Izumi Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-headline-md text-[24px] font-bold text-primary tracking-tight">
            Izumi
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-subhead-caps text-subhead-caps text-on-surface-variant">Support</span>
          <span className="material-symbols-outlined text-on-surface-variant">help_outline</span>
        </div>
      </header>

      <main className="pt-32 pb-20 px-container-padding min-h-screen max-w-[1440px] mx-auto grid grid-cols-12 gap-gutter relative">
        <aside className="col-span-4 flex flex-col pt-12">
          <div className="mb-12">
            <h1 className="font-headline-md text-headline-md text-primary mb-2">Join the Collective</h1>
            <p className="text-on-surface-variant font-body-lg">
              Begin your journey with our secure verification process.
            </p>
          </div>
          <TimelineNav currentStep={step} />
        </aside>

        <section className="col-span-8 flex justify-center items-start pt-4 relative">
          <div
            ref={cardRef}
            className="glass-card w-full max-w-2xl p-12 rounded-xl shadow-xl shadow-primary/5 relative overflow-hidden transition-transform duration-75"
          >
            <div className="absolute -top-24 -right-24 w-64 h-64 border border-secondary/10 rounded-full pointer-events-none" />

            <header className="mb-10">
              <span className="font-subhead-caps text-subhead-caps text-secondary mb-2 block">
                VERIFICATION FORM
              </span>
              <h2 className="font-headline-md text-headline-md text-primary">Izumi</h2>
              <p className="text-on-surface-variant font-body-md mt-2">
                Please ensure all details match your official government-issued identification.
              </p>
            </header>

            {/* Step 1: Identity */}
            {step === "identity" && (
              <form onSubmit={handleIdentityNext} className="space-y-10">
                <div className="grid grid-cols-2 gap-gutter">
                  <div className="relative">
                    <label className="font-subhead-caps text-subhead-caps text-on-surface-variant block mb-1">
                      Legal First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Alexander"
                      required
                      className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-outline-variant py-3 px-0 font-body-lg text-primary focus:border-secondary transition-colors outline-none"
                    />
                  </div>
                  <div className="relative">
                    <label className="font-subhead-caps text-subhead-caps text-on-surface-variant block mb-1">
                      Legal Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Vanderbilt"
                      required
                      className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-outline-variant py-3 px-0 font-body-lg text-primary focus:border-secondary transition-colors outline-none"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="font-subhead-caps text-subhead-caps text-on-surface-variant block mb-1">
                    Premier Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alexander@vanderbilt.co"
                    required
                    className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-outline-variant py-3 px-0 font-body-lg text-primary focus:border-secondary transition-colors outline-none"
                  />
                  <span className="absolute right-0 bottom-3 material-symbols-outlined text-outline-variant text-sm pointer-events-none">
                    lock
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-gutter">
                  <div className="relative">
                    <label className="font-subhead-caps text-subhead-caps text-on-surface-variant block mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="text"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      onFocus={(e) => (e.target.type = "date")}
                      onBlur={(e) => {
                        if (!e.target.value) e.target.type = "text";
                      }}
                      placeholder="MM / DD / YYYY"
                      className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-outline-variant py-3 px-0 font-body-lg text-primary focus:border-secondary transition-colors outline-none"
                    />
                  </div>
                  <div className="relative">
                    <label className="font-subhead-caps text-subhead-caps text-on-surface-variant block mb-1">
                      Country of Residence
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-outline-variant py-3 px-0 font-body-lg text-primary focus:border-secondary transition-colors appearance-none outline-none"
                    >
                      <option>Nigeria</option>
                      <option>Switzerland</option>
                      <option>United Kingdom</option>
                      <option>Singapore</option>
                      <option>United States</option>
                      <option>Japan</option>
                    </select>
                    <span className="absolute right-0 bottom-3 material-symbols-outlined text-outline-variant pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                <div className="py-4 flex items-center gap-4">
                  <div className="h-[1px] bg-outline-variant/30 flex-grow" />
                  <span className="material-symbols-outlined text-secondary text-base">verified_user</span>
                  <div className="h-[1px] bg-outline-variant/30 flex-grow" />
                </div>

                <div className="flex items-start gap-4">
                  <input
                    id="consent"
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded-sm border-outline-variant text-primary focus:ring-secondary cursor-pointer shrink-0"
                  />
                  <label htmlFor="consent" className="font-label-sm text-on-surface-variant leading-relaxed">
                    I consent to the collection of my personal data in accordance with Izumi&apos;s{" "}
                    <a className="text-primary underline decoration-secondary/30 hover:decoration-secondary transition-all" href="#">
                      Privacy Policy
                    </a>{" "}
                    and understand that my information is secured using institutional-grade encryption.
                  </label>
                </div>

                <div className="pt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="font-subhead-caps text-subhead-caps text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Return to Selection
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-secondary-fixed px-12 py-4 font-subhead-caps text-subhead-caps tracking-widest hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all flex items-center gap-3"
                  >
                    PROCEED TO STEP 2
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: KYC */}
            {step === "kyc" && (
              <div>
                {kycSubStep === "method" ? (
                  <form onSubmit={handleProceedToLiveness} className="space-y-10">
                    <header className="mb-2">
                      <h3 className="font-headline-md text-[22px] text-primary">Verify Identity</h3>
                      <p className="text-on-surface-variant font-body-md mt-1">
                        Choose how you&apos;d like to complete KYC.
                      </p>
                    </header>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setKycMethod("bvn")}
                        className={`p-6 rounded-xl border-2 text-left transition-all ${
                          kycMethod === "bvn"
                            ? "border-primary bg-primary/5"
                            : "border-outline-variant hover:border-outline"
                        }`}
                      >
                        <span
                          className="material-symbols-outlined text-primary block mb-3 text-2xl"
                          style={{ fontVariationSettings: kycMethod === "bvn" ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          badge
                        </span>
                        <p className="font-body font-bold text-[14px] text-on-surface">BVN</p>
                        <p className="font-body text-[12px] text-on-surface-variant mt-0.5">Standard KYC</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setKycMethod("zk")}
                        className={`p-6 rounded-xl border-2 text-left transition-all ${
                          kycMethod === "zk"
                            ? "border-primary bg-primary/5"
                            : "border-outline-variant hover:border-outline"
                        }`}
                      >
                        <span
                          className="material-symbols-outlined text-primary block mb-3 text-2xl"
                          style={{ fontVariationSettings: kycMethod === "zk" ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          shield_lock
                        </span>
                        <p className="font-body font-bold text-[14px] text-on-surface">Privacy Shield</p>
                        <p className="font-body text-[12px] text-on-surface-variant mt-0.5">ZK-SNARK proof</p>
                      </button>
                    </div>

                    {kycMethod && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="relative">
                          <label className="font-subhead-caps text-subhead-caps text-on-surface-variant block mb-1">
                            {kycMethod === "zk" ? "BVN (11 digits, stays on your device)" : "BVN (11 digits)"}
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={11}
                            value={bvn}
                            onChange={(e) => setBvn(e.target.value.replace(/\D/g, ""))}
                            placeholder="22234567890"
                            required
                            className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-outline-variant py-3 px-0 font-body-lg text-primary focus:border-secondary transition-colors outline-none tracking-widest"
                          />
                        </div>
                        {kycMethod === "bvn" && (
                          <div className="relative">
                            <label className="font-subhead-caps text-subhead-caps text-on-surface-variant block mb-1">
                              NIN (optional, 11 digits)
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={11}
                              value={nin}
                              onChange={(e) => setNin(e.target.value.replace(/\D/g, ""))}
                              placeholder="12345678901"
                              className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-outline-variant py-3 px-0 font-body-lg text-primary focus:border-secondary transition-colors outline-none tracking-widest"
                            />
                          </div>
                        )}
                        {kycMethod === "zk" && (
                          <div className="flex items-start gap-2 p-4 bg-secondary-fixed/10 rounded-lg border border-secondary/20">
                            <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5 shrink-0">lock</span>
                            <p className="text-[12px] font-body text-on-surface-variant leading-relaxed">
                              Your BVN is used locally to generate a cryptographic proof. It is <strong>never sent</strong> to our servers.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {error && (
                      <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm font-body">
                        {error}
                      </div>
                    )}

                    <div className="pt-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => { setStep("identity"); setError(null); setKycMethod(null); }}
                        className="font-subhead-caps text-subhead-caps text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={!kycMethod || loading}
                        className="bg-primary text-secondary-fixed px-12 py-4 font-subhead-caps text-subhead-caps tracking-widest hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                      >
                        {loading ? (
                          <>
                            <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                            VERIFYING...
                          </>
                        ) : (
                          <>
                            CONTINUE TO LIVENESS
                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Sub-step: Liveness (Mobile QR Hand-off + Desktop Local Scanner) */
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <header className="mb-2">
                      <h3 className="font-display text-[22px] font-bold text-primary">Biometric Liveness attestation</h3>
                      <p className="text-on-surface-variant font-body-md mt-1">
                        Complete liveness checks to authorize ZK-Compliance credentials.
                      </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-4">
                      {/* Left: Mobile Hand-off QR Code */}
                      <div className="bg-surface-container-low border border-outline-variant/40 rounded-xl p-6 text-center space-y-4 shadow-sm">
                        <span className="font-subhead-caps text-[10px] text-outline block">MOBILE SCAN HAND-OFF</span>
                        
                        {/* Real QR Code Wrapper */}
                        <div className="w-40 h-40 bg-white p-2 rounded-lg mx-auto flex flex-col items-center justify-center border border-outline-variant/30 shadow-inner group overflow-hidden">
                          {kycToken ? (
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(mobileKycLink)}`}
                              alt="Scan to verify liveness"
                              className="w-full h-full object-contain group-hover:scale-95 transition-transform"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-[140px] text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>
                              qr_code_2
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          Scan with your phone to complete face verification in high quality on your mobile camera.
                        </p>
                        
                        {kycToken && (
                          <button
                            onClick={() => window.open(mobileKycLink, "_blank")}
                            className="text-xs text-primary font-bold underline hover:brightness-110"
                          >
                            Open Mobile Simulator in New Tab
                          </button>
                        )}
                      </div>

                      {/* Right: Desktop Local Camera Simulator */}
                      <div className="border border-outline-variant/50 rounded-xl p-6 text-center space-y-4 bg-surface/50 backdrop-blur-sm">
                        <span className="font-subhead-caps text-[10px] text-outline block">VERIFY LOCALLY</span>
                        
                        {/* Biometric Scan circular guide */}
                        <div className="relative w-36 h-36 rounded-full overflow-hidden border-2 border-dashed border-outline-variant mx-auto flex items-center justify-center bg-surface-container-low/30 shadow-inner">
                          {localStream ? (
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-full object-cover scale-x-[-1]"
                            />
                          ) : (
                            <>
                              {loading ? (
                                <div className="absolute inset-0 border-2 border-t-primary rounded-full animate-spin" />
                              ) : null}
                              <span className="material-symbols-outlined text-[54px] text-outline animate-pulse">
                                face
                              </span>
                            </>
                          )}
                        </div>

                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          Verify locally using your computer's webcam. Fits standard desktop onboarding triggers.
                        </p>

                        <button
                          onClick={handleLocalDesktopScan}
                          disabled={loading}
                          className="w-full py-3.5 bg-primary text-secondary-fixed rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-50"
                        >
                          {loading ? "Scanning Face..." : "Start Face Scan"}
                        </button>
                      </div>
                    </div>

                    {isPolling && (
                      <div className="flex items-center justify-center gap-3 p-4 bg-secondary-fixed/5 border border-secondary-fixed/20 rounded-xl text-center">
                        <span className="material-symbols-outlined text-secondary text-sm animate-spin">sync</span>
                        <p className="text-xs text-on-surface-variant">
                          Listening for mobile verification sync status...
                        </p>
                      </div>
                    )}

                    <div className="pt-4 flex justify-start">
                      <button
                        type="button"
                        onClick={() => { setKycSubStep("method"); setError(null); }}
                        className="font-subhead-caps text-subhead-caps text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Back to BVN
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Success */}
            {step === "success" && (
              <div className="text-center space-y-8 py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary">
                  <span className="material-symbols-outlined text-[40px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-md text-[28px] text-primary">
                    Welcome, {firstName}!
                  </h3>
                  <p className="text-on-surface-variant font-body-md mt-3 leading-relaxed max-w-sm mx-auto">
                    Your account is live. A virtual account has been created for you.
                  </p>
                  {walletAddress && (
                    <p className="mt-4 text-[11px] font-body text-outline font-mono break-all bg-surface-container-low p-3 rounded-lg border border-outline-variant/30 max-w-sm mx-auto">
                      Wallet: {walletAddress}
                    </p>
                  )}
                </div>
                <div className="pt-4 flex gap-4 justify-center">
                  <button
                    onClick={() => navigate("/dashboard/deposit")}
                    className="bg-primary text-secondary-fixed px-10 py-4 font-subhead-caps text-subhead-caps tracking-widest hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all"
                  >
                    VIEW DEPOSIT DETAILS
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="px-10 py-4 font-subhead-caps text-subhead-caps tracking-widest text-on-surface-variant border border-outline-variant hover:text-primary hover:border-primary/30 transition-all"
                  >
                    GO TO DASHBOARD
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 w-full py-6 px-container-padding flex justify-between items-center text-on-surface-variant/60 font-label-sm bg-background/80 backdrop-blur-sm">
        <div className="flex gap-8">
          <span>&copy; 2024 Izumi Wealth Management</span>
          <span>GDPR Compliant</span>
          <span>SEC Registered</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            encrypted
          </span>
          Institutional Grade Security Active
        </div>
      </footer>
    </div>
  );
}
