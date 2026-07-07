import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GrainOverlay } from "@/components/ui/GrainOverlay";

const LOGO_SRC = "/screen.png";

const AVATAR_SRC =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCIJxGtmq6QtJ2qa1xPv0DExkPVGwRmwv3Q7jCo901EMqX-jEHvxx6HLslO-12iaoIgrDU-ncwnDIVsCWwJzOpDBcAq-AfpffyoWgD3cVVhGyFFWWz-ctW86cIxe-VIKz_MNhC7d0BXUQY-pAq9E2VmSp_k6bIxT0PHcXSZVu75erv5jT9e3jgzkrNecuZuMHVhnH4eJz7cwkn1xNYb3BdGKkEjz_EzWm1giOBlctHvZN_wp04NwHe7";

const KYC_DOCUMENTS = [
  { name: "Passport_Vance_Intl.pdf", icon: "article" },
  { name: "Proof_of_Residence.pdf", icon: "home_pin" },
  { name: "Articles_of_Inc_2023.pdf", icon: "corporate_fare" },
];

const TRANSACTIONS = [
  {
    icon: "shopping_cart",
    title: "Stripe POS Bulk",
    amount: "+$12,400.00",
    time: "Batch settlement • 2m ago",
    positive: true,
  },
  {
    icon: "flight",
    title: "Emirates Executive",
    amount: "-$8,200.00",
    time: "T&E Expense • 14m ago",
    positive: false,
  },
  {
    icon: "account_balance",
    title: "Chase Wire Transfer",
    amount: "+$450,000.00",
    time: "Inbound Revenue • 1h ago",
    positive: true,
  },
];

const NAV_LINKS = [
  { label: "Dashboard", href: "#", active: true },
  { label: "Applications", href: "#", active: false },
  { label: "Risk Engine", href: "#", active: false },
  { label: "Settings", href: "#", active: false },
];

const MOBILE_TABS = [
  { label: "Dashboard", icon: "dashboard" },
  { label: "Invest", icon: "account_balance_wallet" },
  { label: "Credit", icon: "payments" },
  { label: "Settings", icon: "settings" },
];

export function UnderwriterAdminPage() {
  const [score, setScore] = useState(0);
  const targetScore = 845;
  const [previewDoc, setPreviewDoc] = useState<{ name: string; icon?: string; content?: string } | null>(null);

  useEffect(() => {
    const duration = 2000;
    const stepTime = Math.max(Math.floor(duration / (targetScore / 5)), 10);

    const timer = setInterval(() => {
      setScore((prev) => {
        const next = prev + 5;
        return next >= targetScore ? targetScore : next;
      });
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <GrainOverlay />
      <div
        className="fixed top-[-10%] right-[-10%] w-[60%] h-[80%] bg-[radial-gradient(circle_at_center,rgba(115,92,0,0.03)_0%,transparent_70%)] rounded-[50%_10%_50%_10%] rotate-[-15deg] -z-10 pointer-events-none"
      />

      {/* ── Header ────────────────────────────────────────────── */}
      <header className="flex justify-between items-center px-container-padding h-16 w-full fixed top-0 z-50 bg-surface/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
            <img
              src={LOGO_SRC}
              alt="IZUMI Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-widest">
            IZUMI
          </h1>
        </div>

        <nav className="hidden md:flex gap-8 items-center">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={
                link.active
                  ? "text-primary font-bold transition-colors"
                  : "text-on-surface-variant hover:text-primary transition-colors"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">
              search
            </span>
          </button>
          <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors relative">
            <span className="material-symbols-outlined text-on-surface-variant">
              notifications
            </span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
          </button>
          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant">
            <span className="material-symbols-outlined text-primary">person</span>
          </div>
        </div>
      </header>

      {/* ── Main Dashboard Grid ───────────────────────────────── */}
      <main className="pt-16 h-screen flex overflow-hidden">

        {/* ── Left Column: KYC & ZK-Proofs ─────────────────── */}
        <aside className="w-[320px] xl:w-[380px] border-r border-outline-variant bg-surface-container-low/50 flex flex-col h-full">
          <div className="p-6 border-b border-outline-variant">
            <p className="font-subhead-caps text-subhead-caps text-on-surface-variant mb-2">
              BORROWER IDENTITY
            </p>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-outline-variant">
                <img
                  className="w-full h-full object-cover"
                  src={AVATAR_SRC}
                  alt="Alexander Vance"
                />
              </div>
              <div>
                <h2 className="font-body-lg text-body-lg font-bold">
                  Alexander Vance
                </h2>
                <p className="text-label-sm text-on-surface-variant uppercase tracking-widest">
                  Global Series A Founder
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary-container/20 rounded-lg border border-secondary/20">
              <span
                className="material-symbols-outlined text-secondary text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified_user
              </span>
              <span className="text-label-sm font-bold text-on-secondary-container">
                ZK-IDENTITY VERIFIED
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
            {/* KYC Documents */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-subhead-caps text-subhead-caps">
                  KYC DOCUMENTS
                </h3>
                <span className="text-label-sm text-on-surface-variant">
                  3 / 4
                </span>
              </div>
              <div className="space-y-3">
                {KYC_DOCUMENTS.map((doc) => (
                  <div
                    key={doc.name}
                    onClick={() => setPreviewDoc({
                      name: doc.name,
                      icon: doc.icon,
                      content: doc.name.includes("Passport") ? "passport" : doc.name.includes("Residence") ? "residence" : "cac"
                    })}
                    className="bg-surface/70 backdrop-blur-sm border border-outline-variant/20 p-3 rounded-xl flex items-center justify-between group hover:border-primary transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary-container">
                        {doc.icon}
                      </span>
                      <span className="text-label-sm">{doc.name}</span>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant text-base opacity-0 group-hover:opacity-100 transition-opacity">
                      visibility
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* ZK Proofs */}
            <section>
              <h3 className="font-subhead-caps text-subhead-caps mb-4">
                CRYPTOGRAPHIC PROOFS
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-primary text-on-primary rounded-xl overflow-hidden relative">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-label-sm font-bold tracking-widest opacity-60">
                        ZK-LIQUIDITY PROOF
                      </span>
                      <span className="material-symbols-outlined text-secondary-fixed">
                        lock_open
                      </span>
                    </div>
                    <div className="font-mono text-[10px] break-all opacity-50 mb-3">
                      0x72a...d8f91c...001e...44f2
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] opacity-60">
                          Verified Threshold
                        </p>
                        <p className="text-body-md font-bold">
                          &gt; $2,500,000.00
                        </p>
                      </div>
                      <span className="text-[10px] bg-white/10 px-2 py-1 rounded">
                        MATCHED
                      </span>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 opacity-10">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "80px" }}
                    >
                      security
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-surface-container-high rounded-xl border border-outline-variant">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-label-sm font-bold text-on-surface-variant uppercase tracking-widest">
                      Age Attestation
                    </span>
                    <span className="text-label-sm text-on-primary-container bg-primary-container/20 px-2 py-0.5 rounded">
                      PASSED
                    </span>
                  </div>
                  <p className="text-label-sm">
                    Privacy-preserving proof confirms borrower age &gt; 21
                    without exposing DOB.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </aside>

        {/* ── Center Column: Credit Engine ──────────────────── */}
        <section className="flex-1 overflow-y-auto no-scrollbar bg-surface/30 px-gutter py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Hero Score Display */}
            <div className="relative group">
              <div className="absolute inset-0 bg-secondary/5 blur-3xl rounded-full transform group-hover:scale-110 transition-transform duration-1000" />
              <div className="relative bg-surface/70 backdrop-blur-sm border border-outline-variant/20 p-10 rounded-[32px] text-center">
                <p className="font-subhead-caps text-subhead-caps text-on-surface-variant mb-6 uppercase tracking-[0.3em]">
                  Institutional Risk Score
                </p>
                <div className="flex flex-col items-center justify-center">
                  <div className="relative">
                    <svg
                      className="w-48 h-48 transform -rotate-90"
                      viewBox="0 0 192 192"
                    >
                      <circle
                        className="text-surface-container-highest"
                        cx="96"
                        cy="96"
                        fill="transparent"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="6"
                      />
                      <circle
                        className="text-primary transition-all duration-1000 ease-out"
                        cx="96"
                        cy="96"
                        fill="transparent"
                        r="88"
                        stroke="currentColor"
                        strokeDasharray="552.92"
                        strokeDashoffset="82.93"
                        strokeWidth="8"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display-lg leading-none text-primary text-[64px]">
                        {score}
                      </span>
                      <span className="text-label-sm font-bold text-on-surface-variant tracking-widest">
                        / 1000
                      </span>
                    </div>
                  </div>
                  <div className="mt-8 flex gap-12">
                    <div className="text-center">
                      <p className="text-label-sm text-on-surface-variant uppercase mb-1">
                        PROBABILITY OF DEFAULT
                      </p>
                      <p className="font-headline-md text-primary">
                        0.02%
                      </p>
                    </div>
                    <div className="w-px h-12 bg-outline-variant" />
                    <div className="text-center">
                      <p className="text-label-sm text-on-surface-variant uppercase mb-1">
                        LOAN-TO-VALUE (LTV)
                      </p>
                      <p className="font-headline-md text-primary">42%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Bento Grid */}
            <div className="grid grid-cols-2 gap-gutter">
              <div className="bg-surface/70 backdrop-blur-sm border border-outline-variant/20 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-subhead-caps text-subhead-caps">
                    DTI RATIO
                  </h4>
                  <span className="material-symbols-outlined text-primary opacity-40">
                    query_stats
                  </span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-[28%] rounded-full" />
                </div>
                <div className="mt-4 flex justify-between items-end">
                  <span className="text-primary text-3xl font-bold font-display-lg">
                    28.4%
                  </span>
                  <span className="text-label-sm text-on-primary-container">
                    OPTIMAL RANGE
                  </span>
                </div>
              </div>

              <div className="bg-surface/70 backdrop-blur-sm border border-outline-variant/20 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-subhead-caps text-subhead-caps">
                    ASSET QUALITY
                  </h4>
                  <span className="material-symbols-outlined text-primary opacity-40">
                    diamond
                  </span>
                </div>
                <div className="flex gap-1 items-end h-8 mb-4">
                  <div className="w-full h-[60%] bg-outline-variant/30 rounded-t-sm" />
                  <div className="w-full h-[80%] bg-outline-variant/30 rounded-t-sm" />
                  <div className="w-full h-full bg-primary rounded-t-sm" />
                  <div className="w-full h-[90%] bg-outline-variant/30 rounded-t-sm" />
                </div>
                <p className="text-label-sm font-bold text-primary">
                  Tier 1 Sovereign Bonds &amp; Blue Chip Equities
                </p>
              </div>
            </div>

            {/* Decision Controls */}
            <div className="sticky bottom-8 bg-surface/90 backdrop-blur-xl border border-outline-variant rounded-[24px] p-8 shadow-2xl flex items-center justify-between">
              <div>
                <p className="text-label-sm text-on-surface-variant uppercase mb-1">
                  RECOMMENDED FACILITY
                </p>
                <h3 className="font-headline-md text-primary">
                  $1,250,000.00{" "}
                  <span className="text-body-md font-normal">
                    @ 4.2% Fixed
                  </span>
                </h3>
              </div>
              <div className="flex gap-4">
                <button className="px-8 py-4 border border-error text-error font-subhead-caps rounded-xl hover:bg-error/5 transition-all active:scale-95">
                  REJECT APPLICATION
                </button>
                <button className="px-10 py-4 bg-primary text-on-primary font-subhead-caps rounded-xl hover:shadow-lg transition-all active:scale-95">
                  APPROVE FACILITY
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Right Column: Real-time Analysis ───────────────── */}
        <aside className="w-[320px] xl:w-[420px] border-l border-outline-variant bg-surface-container-low/50 flex flex-col h-full">
          <div className="p-6 border-b border-outline-variant">
            <div className="flex items-center justify-between mb-2">
              <p className="font-subhead-caps text-subhead-caps text-on-surface-variant uppercase tracking-widest">
                Financial Pulse
              </p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                <span className="text-[10px] font-bold">LIVE FEED</span>
              </div>
            </div>
            <h2 className="font-body-lg text-body-lg font-bold">
              Bank &amp; POS Analysis
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
            {/* Cash Flow Chart */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-label-sm font-bold uppercase text-on-surface-variant">
                  Net Cashflow (90D)
                </h3>
                <span className="text-label-sm text-primary">+14.2%</span>
              </div>
              <div className="h-40 w-full relative flex items-end gap-1">
                <div
                  className="bg-primary/20 hover:bg-primary transition-colors flex-1"
                  style={{ height: "40%" }}
                />
                <div
                  className="bg-primary/20 hover:bg-primary transition-colors flex-1"
                  style={{ height: "55%" }}
                />
                <div
                  className="bg-primary/20 hover:bg-primary transition-colors flex-1"
                  style={{ height: "45%" }}
                />
                <div
                  className="bg-primary/20 hover:bg-primary transition-colors flex-1"
                  style={{ height: "70%" }}
                />
                <div
                  className="bg-primary/20 hover:bg-primary transition-colors flex-1"
                  style={{ height: "65%" }}
                />
                <div
                  className="bg-primary hover:bg-primary transition-colors flex-1"
                  style={{ height: "90%" }}
                />
                <div
                  className="bg-primary/20 hover:bg-primary transition-colors flex-1"
                  style={{ height: "75%" }}
                />
                <div
                  className="bg-primary/20 hover:bg-primary transition-colors flex-1"
                  style={{ height: "85%" }}
                />
              </div>
            </section>

            {/* Transaction Log */}
            <section>
              <h3 className="text-label-sm font-bold uppercase text-on-surface-variant mb-4">
                POS DATA STREAM
              </h3>
              <div className="space-y-4">
                {TRANSACTIONS.map((tx) => (
                  <div
                    key={tx.title}
                    className="flex gap-4 items-start pb-4 border-b border-outline-variant/30"
                  >
                    <div className="w-10 h-10 bg-surface-container-high rounded-full flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-lg">
                        {tx.icon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-label-sm font-bold">
                          {tx.title}
                        </span>
                        <span
                          className={
                            tx.positive
                              ? "text-label-sm text-primary font-bold"
                              : "text-label-sm text-on-surface-variant"
                          }
                        >
                          {tx.amount}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        {tx.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Fraud Detection */}
            <section className="p-4 bg-error/5 border border-error/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="material-symbols-outlined text-error text-lg"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  warning
                </span>
                <h4 className="text-label-sm font-bold text-error">
                  ANOMALY DETECTED
                </h4>
              </div>
              <p className="text-[12px] leading-relaxed text-on-surface-variant">
                Three rapid cross-border transfers from unknown entities in
                Singapore within 4 minutes. Verified via KYC but flagged for
                high velocity.
              </p>
              <button className="mt-3 text-[11px] font-bold text-error underline underline-offset-4 uppercase tracking-wider">
                Investigate Cluster
              </button>
            </section>
          </div>
        </aside>
      </main>

      {/* ── Mobile Bottom Navigation ───────────────────────── */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center h-20 bg-surface/90 backdrop-blur-lg shadow-[0px_-4px_20px_rgba(0,0,0,0.04)] rounded-t-xl">
        {MOBILE_TABS.map((tab) => (
          <div
            key={tab.label}
            className={
              tab.label === "Dashboard"
                ? "flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1"
                : "flex flex-col items-center justify-center text-on-surface-variant px-4 py-1"
            }
          >
            <span className="material-symbols-outlined">{tab.icon}</span>
            <span className="font-label-sm text-label-sm">{tab.label}</span>
          </div>
        ))}
      </nav>

      {/* ── Document Preview Modal ───────────────────────── */}
      {previewDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-surface-container border border-outline-variant max-w-xl w-full rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-surface-container-high border-b border-outline-variant/30">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">
                  {previewDoc.icon || "description"}
                </span>
                <span className="font-body font-bold text-on-surface">{previewDoc.name}</span>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-full hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body: Document Preview Render */}
            <div className="p-8 flex items-center justify-center bg-surface/50 min-h-[320px]">
              {previewDoc.content === "passport" && (
                <div className="w-full bg-[#1b222c] text-[#dcdde1] border border-outline-variant/40 rounded-xl p-6 font-mono text-xs shadow-inner relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-warning opacity-35">
                    <span className="material-symbols-outlined text-[64px]">public</span>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-24 h-28 bg-surface-container-high border border-outline-variant/40 rounded-lg overflow-hidden shrink-0">
                      <img src={AVATAR_SRC} alt="Passport photo" className="w-full h-full object-cover grayscale" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="border-b border-[#353b48] pb-1.5 mb-1.5">
                        <span className="text-[10px] text-outline block uppercase tracking-widest">Surname / Name</span>
                        <span className="font-bold text-sm text-primary">VANCE / ALEXANDER</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-outline block uppercase">Nationality</span>
                          <span className="font-semibold text-white">SWITZERLAND</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-outline block uppercase">Passport No</span>
                          <span className="font-semibold text-warning">P-SW482910</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-outline block uppercase">Date of Birth</span>
                          <span className="font-semibold text-white">12 APR 1994</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-outline block uppercase">Sex</span>
                          <span className="font-semibold text-white">M</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-dashed border-[#353b48] text-center text-[10px] text-outline tracking-[0.2em] font-bold">
                    P&lt;CHEVERT&lt;&lt;ALEXANDER&lt;VANCE&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
                  </div>
                </div>
              )}

              {previewDoc.content === "residence" && (
                <div className="w-full bg-white text-on-surface border border-outline-variant/35 rounded-xl p-8 shadow-inner font-body text-xs relative">
                  <div className="absolute top-4 right-4 flex flex-col items-center border border-success/30 p-2 rounded rotate-12 text-success uppercase text-[8px] font-bold">
                    <span className="material-symbols-outlined text-[18px] mb-0.5">verified</span>
                    Verified Address
                  </div>
                  <div className="border-b border-outline-variant pb-4 mb-4">
                    <h4 className="font-bold text-sm text-primary uppercase tracking-wider">SWISSCOM UTILITY INVOICE</h4>
                    <p className="text-on-surface-variant text-[10px] mt-0.5">Reference: CH-7482910-B</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">Billed To</span>
                      <p className="font-bold text-on-surface mt-0.5">Alexander Vance</p>
                      <p className="text-on-surface-variant font-medium mt-0.5">Bahnhofstrasse 45, 8001 Zürich, Switzerland</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <span className="text-[10px] text-on-surface-variant block uppercase">Billing Period</span>
                        <p className="font-semibold text-on-surface">Jun 1 - Jun 30, 2026</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-on-surface-variant block uppercase">Statement Status</span>
                        <p className="font-bold text-success">PAID IN FULL</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {previewDoc.content === "cac" && (
                <div className="w-full bg-[#fafbfc] text-[#2c3e50] border-4 border-[#27ae60]/40 rounded-xl p-8 shadow-2xl font-body text-xs relative text-center space-y-6">
                  {/* Decorative CAC Seal */}
                  <div className="w-20 h-20 rounded-full border-4 border-[#27ae60] mx-auto flex items-center justify-center bg-[#27ae60]/5 text-[#27ae60] shrink-0">
                    <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      corporate_fare
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-display text-base font-bold text-[#27ae60] uppercase tracking-wider">
                      CORPORATE AFFAIRS COMMISSION
                    </h4>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                      FEDERAL REPUBLIC OF NIGERIA
                    </p>
                  </div>
                  <div className="border-t border-b border-outline-variant/30 py-4 my-2 text-left space-y-3">
                    <div>
                      <span className="text-[9px] text-on-surface-variant block uppercase font-bold tracking-wider">Company Name</span>
                      <p className="font-bold text-sm text-[#2c3e50] mt-0.5">VANCE GLOBAL SOLUTIONS LTD</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] text-on-surface-variant block uppercase font-bold">Registration No (RC)</span>
                        <p className="font-bold text-on-surface">RC-19482710</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-on-surface-variant block uppercase font-bold">Incorporation Date</span>
                        <p className="font-bold text-on-surface">15 OCT 2023</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-[9px] italic text-on-surface-variant leading-relaxed">
                    This certifies that this corporate entity is registered and compliant under the Companies and Allied Matters Act.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
