import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { saverApi, ApiError } from "@/lib/api";
import { useUser } from "@/context/UserContext";

const LOGO_SRC = "/screen.png";

export function LoginPage() {
  const navigate = useNavigate();
  const { loginAsSaver, loginAsBorrower } = useUser();
  const cardRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mouse perspective movement effect matching OnboardingPage
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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await saverApi.login(email.trim());
      
      if (res.role === "BORROWER") {
        loginAsBorrower(
          res.userId,
          res.name,
          res.email,
          res.borrowerId || "",
          res.virtualAccount
        );
        navigate("/borrow/dashboard");
      } else {
        loginAsSaver(
          res.userId,
          res.name,
          res.email,
          res.walletAddress,
          res.virtualAccount
        );
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err instanceof ApiError ? err.message : (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface font-body relative overflow-hidden flex flex-col justify-between py-8 px-4 md:px-12 selection:bg-secondary-fixed/30 selection:text-secondary-fixed-dim">
      {/* Background radial highlight */}
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-[1280px] mx-auto w-full flex justify-between items-center mb-12">
        <Link to="/" className="flex items-center gap-3 group">
          <img src={LOGO_SRC} alt="Izumi Logo" className="h-8 w-auto filter invert dark:invert-0" />
          <span className="font-display font-bold text-xl tracking-tight text-primary">IZUMI</span>
        </Link>
        <Link
          to="/onboard"
          className="text-xs font-semibold tracking-[0.1em] text-on-surface-variant hover:text-primary uppercase border-b border-transparent hover:border-primary transition-all duration-200"
        >
          Create Account
        </Link>
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center relative z-10 max-w-lg mx-auto w-full mb-16">
        <div
          ref={cardRef}
          className="w-full bg-surface-container-low border border-outline-variant/60 rounded-3xl p-8 md:p-12 shadow-2xl transition-transform duration-300 ease-out flex flex-col justify-between min-h-[460px]"
        >
          <div>
            <div className="mb-8">
              <span className="text-[11px] font-bold tracking-[0.2em] text-secondary uppercase block mb-3">
                Welcome Back
              </span>
              <h2 className="text-[32px] md:text-[36px] font-display font-semibold text-primary leading-tight tracking-tight">
                Access Portal
              </h2>
              <p className="text-on-surface-variant text-[14px] mt-2 leading-relaxed">
                Enter your credentials to connect your Izumi account and smart wallet.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[20px]">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-outline-variant rounded-xl outline-none font-medium text-[15px] focus:border-primary transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-[13px] leading-relaxed">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-4.5 bg-primary text-on-primary font-bold rounded-xl text-[14px] hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 duration-150"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">
                      progress_activity
                    </span>
                    Connecting Session...
                  </>
                ) : (
                  <>
                    Sign In
                    <span className="material-symbols-outlined text-[18px]">login</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-8 border-t border-outline-variant/60 text-center">
            <p className="text-xs text-on-surface-variant">
              New to Izumi?{" "}
              <Link to="/onboard" className="font-bold text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-[1280px] mx-auto w-full text-center">
        <p className="text-[11px] text-on-surface-variant/60 tracking-wider">
          &copy; {new Date().getFullYear()} Izumi Protocol. Institutional fixed-yield bridge.
        </p>
      </footer>
    </div>
  );
}
