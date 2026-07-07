import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { borrowerApi, ApiError } from "@/lib/api";
import { useUser } from "@/context/UserContext";

const SECTORS = [
  "Retail", "Agriculture", "Technology", "Manufacturing",
  "Healthcare", "Education", "Logistics", "Food & Beverage",
  "Fashion", "Real Estate", "Other",
];

type Step = "personal" | "business" | "documents" | "review" | "success";

interface UploadedFile {
  type: "CAC_CERTIFICATE" | "DIRECTOR_ID";
  fileName: string;
  fileSize: number;
  base64Data: string;
}

export function BorrowerOnboardingPage() {
  const navigate = useNavigate();
  const { loginAsBorrower } = useUser();

  const [step, setStep] = useState<Step>("personal");

  // Personal Info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bvn, setBvn] = useState("");

  // Business Info
  const [companyName, setCompanyName] = useState("");
  const [cacRcNumber, setCacRcNumber] = useState("");
  const [businessTin, setBusinessTin] = useState("");
  const [sector, setSector] = useState("");

  // Document scan/upload states
  const [cacDoc, setCacDoc] = useState<UploadedFile | null>(null);
  const [directorIdDoc, setDirectorIdDoc] = useState<UploadedFile | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [borrowerId, setBorrowerId] = useState("");

  const STEPS: Step[] = ["personal", "business", "documents", "review", "success"];
  const stepIndex = STEPS.indexOf(step);

  const handleFileUpload = (type: "CAC_CERTIFICATE" | "DIRECTOR_ID") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: max 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      const uploadedFile: UploadedFile = {
        type,
        fileName: file.name,
        fileSize: file.size,
        base64Data
      };

      if (type === "CAC_CERTIFICATE") {
        setCacDoc(uploadedFile);
      } else {
        setDirectorIdDoc(uploadedFile);
      }
    };
    reader.onerror = () => {
      alert("Failed to read file.");
    };
    reader.readAsDataURL(file);
  };

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      // 1. Submit basic business details for KYB onboarding
      const res = await borrowerApi.onboard({
        name,
        email,
        directorBvn: bvn || undefined,
        companyName,
        cacRcNumber,
        businessTin,
        sector,
      });

      // Log in borrower locally
      loginAsBorrower(res.user.id, res.user.name, res.user.email, res.borrowerId);
      setBorrowerId(res.borrowerId);

      // 2. Upload Kyc Documents if present
      if (cacDoc) {
        await borrowerApi.uploadDocument(res.borrowerId, {
          type: cacDoc.type,
          fileName: cacDoc.fileName,
          fileSize: cacDoc.fileSize,
          base64Data: cacDoc.base64Data
        });
      }

      if (directorIdDoc) {
        await borrowerApi.uploadDocument(res.borrowerId, {
          type: directorIdDoc.type,
          fileName: directorIdDoc.fileName,
          fileSize: directorIdDoc.fileSize,
          base64Data: directorIdDoc.base64Data
        });
      }

      setStep("success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-6 shadow-xl">
            <span className="material-symbols-outlined text-[32px] text-secondary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>
              business_center
            </span>
          </div>
          <h1 className="font-display text-[40px] font-bold text-primary tracking-[-0.02em]">
            Business Credit
          </h1>
          <p className="text-on-surface-variant font-body mt-2">
            Unlock AI-powered financing for your SME.
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {STEPS.filter(s => s !== "success").map((s, i) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
              i < stepIndex ? "bg-primary" : i === stepIndex ? "bg-primary" : "bg-outline-variant/40"
            }`} />
          ))}
        </div>

        <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-8 shadow-xl">

          {/* ── Step 1: Personal ─────────────────────────────────────── */}
          {step === "personal" && (
            <form onSubmit={e => { e.preventDefault(); setStep("business"); }} className="space-y-6">
              <div>
                <h2 className="font-display text-[22px] font-semibold text-on-surface mb-1">Director Details</h2>
                <p className="text-sm text-on-surface-variant font-body">Your personal KYC information.</p>
              </div>
              <div className="space-y-4">
                {[
                  { id: "borrow-name", label: "Director Full Name", value: name, onChange: setName, type: "text", placeholder: "Chukwuemeka Obi" },
                  { id: "borrow-email", label: "Email", value: email, onChange: setEmail, type: "email", placeholder: "ceo@company.ng" },
                ].map(f => (
                  <div key={f.id}>
                    <label className="text-[12px] font-body font-semibold uppercase tracking-[0.15em] text-on-surface-variant block mb-2">{f.label}</label>
                    <input
                      id={f.id} type={f.type} required value={f.value}
                      onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder}
                      className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-on-surface placeholder:text-outline focus:border-primary focus:outline-none transition-colors font-body"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-[12px] font-body font-semibold uppercase tracking-[0.15em] text-on-surface-variant block mb-2">Director BVN (11 digits)</label>
                  <input
                    id="borrow-bvn" type="text" inputMode="numeric" maxLength={11} required value={bvn}
                    onChange={e => setBvn(e.target.value.replace(/\D/g, ""))} placeholder="22234567890"
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-on-surface placeholder:text-outline focus:border-primary focus:outline-none transition-colors font-body tracking-widest"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-3.5 bg-primary text-secondary-fixed rounded-xl font-body font-bold text-[14px] hover:shadow-xl active:scale-[0.98] transition-all">
                Continue to Business Info
              </button>
            </form>
          )}

          {/* ── Step 2: Business ─────────────────────────────────────── */}
          {step === "business" && (
            <form onSubmit={e => { e.preventDefault(); setStep("documents"); }} className="space-y-6">
              <div>
                <h2 className="font-display text-[22px] font-semibold text-on-surface mb-1">Business Details</h2>
                <p className="text-sm text-on-surface-variant font-body">CAC registration & compliance information.</p>
              </div>
              <div className="space-y-4">
                {[
                  { id: "borrow-company", label: "Company Name", value: companyName, onChange: setCompanyName, placeholder: "Obi Ventures Ltd" },
                  { id: "borrow-cac", label: "CAC RC Number (Must start with RC or BN)", value: cacRcNumber, onChange: setCacRcNumber, placeholder: "RC-1234567" },
                  { id: "borrow-tin", label: "Business TIN (At least 8 characters)", value: businessTin, onChange: setBusinessTin, placeholder: "12345678-0001" },
                ].map(f => (
                  <div key={f.id}>
                    <label className="text-[12px] font-body font-semibold uppercase tracking-[0.15em] text-on-surface-variant block mb-2">{f.label}</label>
                    <input
                      id={f.id} type="text" required value={f.value}
                      onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder}
                      className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-on-surface placeholder:text-outline focus:border-primary focus:outline-none transition-colors font-body"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-[12px] font-body font-semibold uppercase tracking-[0.15em] text-on-surface-variant block mb-2">Business Sector</label>
                  <select
                    id="borrow-sector" required value={sector} onChange={e => setSector(e.target.value)}
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-on-surface focus:border-primary focus:outline-none transition-colors font-body appearance-none"
                  >
                    <option value="" disabled>Select sector…</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep("personal")} className="px-5 py-3 border border-outline-variant text-on-surface-variant rounded-xl font-body text-sm hover:bg-surface-container transition-all">Back</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-secondary-fixed rounded-xl font-body font-bold text-[14px] hover:shadow-xl active:scale-[0.98] transition-all">Continue to Documents</button>
              </div>
            </form>
          )}

          {/* ── Step 3: Documents ────────────────────────────────────── */}
          {step === "documents" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-[22px] font-semibold text-on-surface mb-1">Company Documents</h2>
                <p className="text-sm text-on-surface-variant font-body">Upload your corporate and identification documents.</p>
              </div>

              <div className="space-y-6">
                {/* CAC Certificate upload */}
                <div>
                  <label className="text-[12px] font-body font-semibold uppercase tracking-[0.15em] text-on-surface-variant block mb-2">
                    CAC Certificate (Image/PDF)
                  </label>
                  <div className="border-2 border-dashed border-outline-variant rounded-xl p-6 text-center hover:border-primary transition-all relative">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload("CAC_CERTIFICATE")}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <span className="material-symbols-outlined text-[32px] text-outline mb-2">
                      corporate_fare
                    </span>
                    {cacDoc ? (
                      <div className="text-sm text-on-surface font-body">
                        <p className="font-semibold text-primary">{cacDoc.fileName}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">{(cacDoc.fileSize / 1024).toFixed(1)} KB</p>
                      </div>
                    ) : (
                      <div className="text-xs text-on-surface-variant font-body">
                        <p className="font-semibold">Tap to capture or upload certificate</p>
                        <p className="mt-1">Supports PDF, PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Director ID upload */}
                <div>
                  <label className="text-[12px] font-body font-semibold uppercase tracking-[0.15em] text-on-surface-variant block mb-2">
                    Director ID (Driver's License/NIN/Passport)
                  </label>
                  <div className="border-2 border-dashed border-outline-variant rounded-xl p-6 text-center hover:border-primary transition-all relative">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload("DIRECTOR_ID")}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <span className="material-symbols-outlined text-[32px] text-outline mb-2">
                      badge
                    </span>
                    {directorIdDoc ? (
                      <div className="text-sm text-on-surface font-body">
                        <p className="font-semibold text-primary">{directorIdDoc.fileName}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">{(directorIdDoc.fileSize / 1024).toFixed(1)} KB</p>
                      </div>
                    ) : (
                      <div className="text-xs text-on-surface-variant font-body">
                        <p className="font-semibold">Scan or upload Director's ID</p>
                        <p className="mt-1">Opens phone camera on mobile scanner</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setStep("business")} className="px-5 py-3 border border-outline-variant text-on-surface-variant rounded-xl font-body text-sm hover:bg-surface-container transition-all">Back</button>
                <button
                  type="button"
                  onClick={() => setStep("review")}
                  disabled={!cacDoc || !directorIdDoc}
                  className="flex-1 py-3 bg-primary text-secondary-fixed rounded-xl font-body font-bold text-[14px] hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Review Application
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Review ───────────────────────────────────────── */}
          {step === "review" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-[22px] font-semibold text-on-surface mb-1">Review & Submit</h2>
                <p className="text-sm text-on-surface-variant font-body">Confirm your details before KYB verification.</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Name", value: name },
                  { label: "Email", value: email },
                  { label: "BVN", value: `•••••${bvn.slice(-4)}` },
                  { label: "Company", value: companyName },
                  { label: "CAC RC", value: cacRcNumber },
                  { label: "TIN", value: businessTin },
                  { label: "Sector", value: sector },
                  { label: "CAC Doc", value: cacDoc?.fileName || "Missing" },
                  { label: "ID Doc", value: directorIdDoc?.fileName || "Missing" },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-2.5 border-b border-outline-variant/40 last:border-0">
                    <span className="text-[12px] font-body font-semibold uppercase tracking-[0.1em] text-on-surface-variant">{item.label}</span>
                    <span className="text-[14px] font-body font-medium text-on-surface">{item.value}</span>
                  </div>
                ))}
              </div>
              {error && (
                <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm font-body">{error}</div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep("documents")} className="px-5 py-3 border border-outline-variant text-on-surface-variant rounded-xl font-body text-sm hover:bg-surface-container transition-all">Edit</button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3 bg-primary text-secondary-fixed rounded-xl font-body font-bold text-[14px] hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>Submitting KYB…</>
                  ) : "Submit Application"}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 5: Success ───────────────────────────────────────── */}
          {step === "success" && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary mx-auto">
                <span className="material-symbols-outlined text-[40px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <div>
                <h2 className="font-display text-[28px] font-bold text-on-surface">KYB Verified!</h2>
                <p className="text-on-surface-variant font-body mt-2 leading-relaxed">
                  {companyName} is now registered on Izumi. Apply for a loan to get started.
                </p>
                {borrowerId && (
                  <p className="mt-3 text-[11px] font-body text-outline font-mono">Borrower ID: {borrowerId}</p>
                )}
              </div>
              <button onClick={() => navigate("/borrow/apply")} className="w-full py-3.5 bg-primary text-secondary-fixed rounded-xl font-body font-bold text-[14px] hover:shadow-xl active:scale-[0.98] transition-all">
                Apply for Credit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
