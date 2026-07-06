import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const LOGO_SRC =
  "https://lh3.googleusercontent.com/aida/AP1WRLsUCwblwQwd_F48dQLPLKWBsCL_a2uMk4CsEKZT1ZEH2eHTa7NKH87jhIewFYLypznNnH1Go5gc1EreNf78KU5U-LCiVz_B_jYOENNVxxTre0nvvKCdJxJVkpDMphYmbUpdc9MhuPD3Y5aAFvib0kanwJLyA6yY3mx89GU5RoDiGVCTu-fYmRA2t9PQyT1bZLXxtK9jRM0AgmyeXJmA2P9KLd22p4fKSSM5Jo2cy7iBOKHb9emUHfwvapY";

const INSTITUTIONS = [
  {
    name: "GTBank",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBIRkK58SIG-vmdSMeev9cUxw6qlgQIFwLg2bP16-oFChpBb-5DWpxG0dN7Kl5l5NMgk4SGy02Nq4VDKr3cCkMwEtSuXZ_OAHmDdxPlAwnlw4Iut7H-j37bjeg2AEWy9G2decgSk3XfLhxlWck5SLoMwGT7GAL8BXQeLyRzb-f_AesIgQFuR9pB-bRtcVwGOn14S8dv3PAVSKYxO88t-rk6Fz5siKQK8X9Zv9KvrFEtvjKCrRgPj-IR",
  },
  {
    name: "Zenith Bank",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRX4OVjEl3TaQWSx_lEMQp9R7XkK56hs9Dawm-aGD4Gl8QpH3L6qSm2HE6M9T8mPy5qpVrUgV1YSVJHRkeuA2vLigXBh7ydPEHgF6Hn7dpnKt3dC2sva3XhH5Y-XBQd5jnm-wFUd6fMjz8fFkfWU2tvdrF5S5IyhZ3L5o3Lf1-PRsBveGwvw2CYQzXc5Y_Yvk9sms54MCILl-YRX22NcLwsEHN8ep8jtqpzRmMM7bilgCG282s-qAW",
  },
  {
    name: "Access Bank",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAN7Wr9EiZ-I1qlcu6JM58icO1kPa-3VdAe6wzu87QtzRipX3XYRvKe4Z3C9zy7NDnmGXywuOpbWyurlDcDd93YwCLpGIs0-fzfUNOR6w-tu6xNtk_9tpjarEQBHpiL3EeiIOwX3IGfm-5wxcu56qJF5jqGtQdxBu50OzazqV34KNBxa4PLsTR3Iqgk2APhuEGO3tBK7E1b_23jUHp6CWgPJou86W0SUrMgk2_0JsYopcLWjsafW2A7",
    selected: true,
  },
  {
    name: "Stanbic IBTC",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqze1Ih0zyQHXNjwNhQ2UDSXtNUCWAgeX1GEF9tH9m-wiTYQPaatpwa-82bRj-KHfQ3VU6xomtfNUBw-b3K1v7dVp3660A7pGWXwZmNI9eI146kPRjNtc2QeP50yo0ZBtKUzcA5DZd754aelOVmN1HeYBJzienI_BsDFkvcCwK3cooNYm1hdThxJCgefpNiq2d7A5EPNBoP4oSKtLQ0OlUfJ7esn1FUSM9kzCgRhkNt0ZHEMqS1T_J",
  },
  {
    name: "First Bank",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHBF7AnoWGHdQi95XgzlROomktEABf18psTf0n7trsepLUblgL8yR_uNSjoTSIOkBAZM7wu3_ExcR97f1wUuv7VJtORgswg3RAYLBbd6xTUfSpLLsRM5eXCeHa_Kk7J-uAmpl94ttkdTZBPHwT0zgEHSoNTljbMwrWvUk9hH6TYHQXmHzorQRC_kwc7bi-nPO6Er35wbsvC5_mbkW4gRcdy3VbX5DxjDVv0nTKUu8X1X9dV-2bYl9H",
  },
  {
    name: "Standard Chartered",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8wjkqXXKphdorsan8rrGUWCO10IVgz9Vi7jBZL0055fwzujay20y4cd6MZ36z7Clmpi2HxjUuxFlhNOToC73rZt38E356Tomv9Gma96b7sPHmxHdcHBg1doMTa9DHrncMX52w1QjKqehTHR14TEw9XaKtc8t4FPbdBCCFDMtigmaV1UrOwjfMZmxqQhl-IE0hQkGWhZ7uoB_rSwzeh7iq3wCoJMSH0HY-vgBjvFbwA1z-pku_99Du",
  },
];

export function IngestionPage() {
  const navigate = useNavigate();
  const curvesRef = useRef<HTMLDivElement[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const moveX = (e.clientX - window.innerWidth / 2) / 100;
      const moveY = (e.clientY - window.innerHeight / 2) / 100;
      curvesRef.current.forEach((el) => {
        if (el) el.style.transform = `translate(${moveX}px, ${moveY}px) skewY(-10deg)`;
      });
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  const filtered = INSTITUTIONS.filter((inst) =>
    inst.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden bg-primary selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      <div
        className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03]"
        style={{
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/p6-static.png')",
        }}
      />

      <div
        ref={(el) => { if (el) curvesRef.current[0] = el; }}
        className="izumi-curve"
      />
      <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-primary-container rounded-full opacity-20 blur-[120px] pointer-events-none" />

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="w-full h-full bg-cover bg-center opacity-40 blur-md"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuASSldUMqUeOiqKbWuATPR__Ahjkp2l5vQ2P7BKNz4Nzr8Apdx3ycTRiEvbmBmy0rGMYT9SEDu1sU2uB7mwDWqDFgYZ4XhtVss2V5f9vElkzf7AgfMtGKk3TuOnJDj7vKMtIhs0snw_oQGmwYloRsgIhl5uTBjiV6lv52nfJmI6L6jEHaH4d0O9b-xdBYmFsLU0RjsNwsf1K-98BJH3f8nPLOXCpOuJGPa69NzaEJ3zPXviBuXT2n07')",
          }}
        />
      </div>

      <section className="relative z-10 w-full max-w-[640px] glass-card rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <header className="px-8 pt-10 pb-6 text-center border-b border-outline-variant/10">
          <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full overflow-hidden">
            <img src={LOGO_SRC} alt="Izumi Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-headline-md text-headline-md text-primary tracking-tight">
            Secure Data Ingestion
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-md mx-auto">
            Connect your institutional accounts through our encrypted portal to synchronize your
            global wealth portfolio.
          </p>
        </header>

        <div className="px-8 pt-6">
          <div ref={searchRef} className="relative group transition-transform duration-200">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => searchRef.current?.classList.add("scale-[1.01]")}
              onBlur={() => searchRef.current?.classList.remove("scale-[1.01]")}
              placeholder="Search for your financial institution..."
              className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary focus:ring-0 font-body-md text-primary placeholder:text-on-surface-variant/50 transition-all outline-none"
            />
          </div>
        </div>

        <div className="px-8 py-8 flex-1 overflow-y-auto max-h-[400px] ingestion-scroll">
          <h2 className="font-subhead-caps text-subhead-caps text-on-surface-variant uppercase mb-6">
            Popular Institutions
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((inst) => (
              <button
                key={inst.name}
                className={`flex flex-col items-center justify-center p-6 bg-surface border rounded-lg hover:border-secondary/40 hover:bg-surface-container-high transition-all active:scale-95 group ${
                  inst.selected
                    ? "border-2 border-secondary/20"
                    : "border-outline-variant/10"
                }`}
              >
                <div className="w-12 h-12 mb-3 flex items-center justify-center overflow-hidden rounded-md bg-white p-2">
                  <img
                    src={inst.img}
                    alt={inst.name}
                    className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all"
                  />
                </div>
                <span className="font-label-sm text-label-sm text-primary">
                  {inst.name}
                </span>
                {inst.selected && <div className="mt-1 w-1 h-1 bg-secondary rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        <footer className="px-8 pb-10 pt-6 bg-surface-container-low/50">
          <button className="w-full py-5 bg-primary text-secondary-fixed font-subhead-caps text-subhead-caps uppercase tracking-[0.2em] rounded-full hover:shadow-[0_0_20px_rgba(66,101,93,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-3">
            Authenticate Connection
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
          <div className="mt-6 flex items-center justify-center gap-2 opacity-50">
            <div className="w-4 h-4 overflow-hidden">
              <img src={LOGO_SRC} alt="Izumi Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-label-sm text-label-sm">Secured by Izumi Quantum Encryption</span>
          </div>
        </footer>

        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 right-6 text-on-surface-variant/40 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </section>
    </div>
  );
}
