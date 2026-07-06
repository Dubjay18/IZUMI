import { useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";

/* ─── Static Data ──────────────────────────────────────────────────── */

const METRICS = [
  {
    label: "TOTAL VALUE LOCKED",
    value: "$1.24B",
    icon: "account_balance",
    sub: "+4.2% (30d)",
    subIcon: "arrow_upward",
    subColor: "text-on-primary-container",
    bar: null,
  },
  {
    label: "UTILIZATION RATE",
    value: "68.4%",
    icon: "trending_up",
    sub: null,
    bar: 68.4,
  },
  {
    label: "DEFAULT RATE",
    value: "0.02%",
    icon: "shield_lock",
    sub: "Lowest in tier class",
    subColor: "text-outline",
    bar: null,
  },
  {
    label: "TOTAL YIELD DISTRIBUTED",
    value: "$42.8M",
    icon: "payments",
    sub: "Fiscal Year to Date",
    subColor: "text-on-primary-container",
    bar: null,
  },
] as const;

const RESERVES = [
  { label: "Stable Assets", pct: 52, colorClass: "bg-primary" },
  { label: "Govt. Securities", pct: 38, colorClass: "bg-primary/60" },
  { label: "Liquid Equities", pct: 10, colorClass: "bg-secondary" },
] as const;

const PARAMS = [
  { name: "Liquidation Threshold", value: "85.0%", status: "STABLE",  date: "Oct 12, 2024" },
  { name: "Reserve Factor",        value: "10.0%", status: "OPTIMAL", date: "Oct 10, 2024" },
  { name: "Max Loan-to-Value",     value: "75.0%", status: "STABLE",  date: "Sept 28, 2024" },
] as const;

/* ─── Component ────────────────────────────────────────────────────── */

export function VaultHealthPage() {
  const cardsRef = useRef<HTMLDivElement>(null);

  /* subtle mouse-tracking glow on metric cards */
  useEffect(() => {
    const cards = cardsRef.current?.querySelectorAll<HTMLDivElement>(".metric-card");
    if (!cards) return;

    const handlers: Array<{ el: HTMLDivElement; fn: (e: MouseEvent) => void }> = [];

    cards.forEach((card) => {
      const fn = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
        card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
      };
      card.addEventListener("mousemove", fn);
      handlers.push({ el: card, fn });
    });

    return () => handlers.forEach(({ el, fn }) => el.removeEventListener("mousemove", fn));
  }, []);

  return (
    <AppLayout showCurve={false}>
      {/* Parabolic accent blobs matching the design */}
      <div
        className="fixed top-[-10%] right-[-10%] w-[80%] h-[80%] rounded-[50%_20%_60%_30%] -rotate-15 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(169,206,197,0.15) 0%, transparent 70%)",
        }}
      />
      <div
        className="fixed bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-[30%_60%_20%_50%] -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(233,195,73,0.08) 0%, transparent 60%)",
        }}
      />

      <main className="pt-10 pb-32 px-gutter md:px-container-padding max-w-[1440px] mx-auto">

        {/* ── Hero Header ───────────────────────────────────────────── */}
        <section className="mb-section-gap flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="max-w-2xl">
            <p className="font-subhead-caps text-subhead-caps text-secondary tracking-[0.15em] mb-4">
              PROTOCOL GOVERNANCE
            </p>
            <h2 className="font-display-lg text-[clamp(40px,5vw,56px)] leading-none text-primary mb-6">
              IZUMI Vault Health
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Real-time solvency metrics and risk assessments for the Izumi Fountain
              ecosystem. Our commitment to radical transparency ensures the permanence
              of your capital.
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <button className="bg-primary text-background px-8 py-3 rounded-full font-subhead-caps text-subhead-caps hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95">
              EXPORT REPORT
            </button>
            <button className="border border-primary text-primary px-8 py-3 rounded-full font-subhead-caps text-subhead-caps hover:bg-primary hover:text-white transition-all active:scale-95">
              GOVERNANCE FORUM
            </button>
          </div>
        </section>

        {/* ── Metric Cards ──────────────────────────────────────────── */}
        <section ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-gutter mb-section-gap">
          {METRICS.map((m) => (
            <div
              key={m.label}
              className="metric-card glass-card p-8 rounded-xl flex flex-col justify-between h-48 group hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <span className="font-subhead-caps text-subhead-caps text-on-surface-variant leading-tight">
                  {m.label}
                </span>
                <span className="material-symbols-outlined text-primary opacity-40 group-hover:opacity-100 transition-opacity">
                  {m.icon}
                </span>
              </div>

              <div>
                <h3 className="font-headline-md text-headline-md text-primary">{m.value}</h3>

                {/* bar variant */}
                {m.bar !== null && (
                  <div className="w-full bg-surface-container-highest h-1 mt-3 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-1000"
                      style={{ width: `${m.bar}%` }}
                    />
                  </div>
                )}

                {/* text sub-line variant */}
                {m.sub && (
                  <p className={`text-label-sm flex items-center gap-1 mt-1 ${m.subColor ?? ""}`}>
                    {"subIcon" in m && m.subIcon && (
                      <span className="material-symbols-outlined text-[14px]">{m.subIcon}</span>
                    )}
                    {m.sub}
                  </p>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* ── Main Chart + Sidebar ───────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">

          {/* Vault Solvency Chart */}
          <div className="lg:col-span-2 glass-card p-container-padding rounded-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
              <div>
                <h4 className="font-headline-md text-[24px] text-primary">
                  Vault Solvency vs. Debt
                </h4>
                <p className="font-body-md text-on-surface-variant text-[15px]">
                  12-month trailing performance and resilience testing
                </p>
              </div>
              <div className="flex gap-4 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary inline-block" />
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Solvency</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-outline-variant inline-block" />
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Outstanding Debt</span>
                </div>
              </div>
            </div>

            <div className="w-full h-80 relative overflow-hidden rounded-lg">
              <svg
                viewBox="0 0 1000 400"
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                {/* Y-axis grid lines */}
                {[50, 150, 250, 350].map((y) => (
                  <line
                    key={y}
                    x1="0" y1={y} x2="1000" y2={y}
                    stroke="currentColor"
                    className="text-outline-variant opacity-20"
                  />
                ))}

                {/* Solvency area fill */}
                <path
                  d="M0,350 L0,150 Q250,50 500,100 T1000,40 L1000,350 Z"
                  fill="rgba(0,21,18,0.04)"
                />

                {/* Solvency curve */}
                <path
                  d="M0,150 Q250,50 500,100 T1000,40"
                  fill="none"
                  stroke="#001512"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Debt curve (dashed) */}
                <path
                  d="M0,280 Q300,220 500,260 T1000,200"
                  fill="none"
                  stroke="#c1c8c5"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                />

                {/* Peak marker */}
                <circle cx="500" cy="100" r="5" fill="#001512" />
                <text x="514" y="92" fill="#001512" fontSize="14" fontFamily="Hanken Grotesk" fontWeight="600">
                  Peak Reserve
                </text>

                {/* Month labels */}
                {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(
                  (month, i) => (
                    <text
                      key={month}
                      x={i * (1000 / 11)}
                      y="390"
                      fill="#717976"
                      fontSize="13"
                      fontFamily="Hanken Grotesk"
                      textAnchor="middle"
                    >
                      {month}
                    </text>
                  )
                )}
              </svg>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-gutter">

            {/* Reserve Composition */}
            <div className="glass-card p-8 rounded-xl flex-1">
              <h4 className="font-headline-md text-[20px] text-primary mb-6">
                Reserve Composition
              </h4>
              <div className="space-y-6">
                {RESERVES.map((r) => (
                  <div key={r.label} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center font-label-sm text-label-sm">
                      <span className="text-on-surface-variant">{r.label}</span>
                      <span className="text-primary font-bold">{r.pct}%</span>
                    </div>
                    <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${r.colorClass} transition-all duration-700`}
                        style={{ width: `${r.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Badge */}
            <div className="bg-primary text-background p-8 rounded-xl relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-headline-md text-[20px] mb-2">Quarterly Audit</h4>
                <p className="text-label-sm opacity-70 mb-4">
                  Completed Sept 2024 by Sentinel Labs
                </p>
                <div className="flex items-center gap-2 text-secondary-container">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  <span className="font-subhead-caps text-subhead-caps">
                    FULLY COLLATERALIZED
                  </span>
                </div>
              </div>

              {/* Decorative concentric circles */}
              <svg
                className="absolute bottom-0 right-0 opacity-20 w-32 h-32"
                viewBox="0 0 100 100"
              >
                <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="0.5" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="white" strokeWidth="0.5" />
                <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="0.5" />
              </svg>
            </div>
          </div>
        </section>

        {/* ── Risk Parameters Table ──────────────────────────────────── */}
        <section className="mt-section-gap">
          <div className="flex items-center justify-between mb-8 gap-4">
            <h4 className="font-headline-md text-headline-md text-primary">
              Active Risk Parameters
            </h4>
            <a
              href="#"
              className="text-primary font-subhead-caps text-subhead-caps flex items-center gap-2 hover:gap-4 transition-all group"
            >
              VIEW ALL PROPOSALS
              <span className="material-symbols-outlined transition-all group-hover:translate-x-1">
                trending_flat
              </span>
            </a>
          </div>

          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-left">
                  {["PARAMETER", "CURRENT VALUE", "RISK STATUS", "LAST UPDATE"].map(
                    (col, i) => (
                      <th
                        key={col}
                        className={`p-6 font-subhead-caps text-subhead-caps text-on-surface-variant ${i === 3 ? "text-right" : ""}`}
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {PARAMS.map((row) => (
                  <tr
                    key={row.name}
                    className="hover:bg-surface-container-lowest transition-colors"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <span className="w-2 h-2 rounded-full bg-secondary inline-block shrink-0" />
                        <span className="font-body-md text-primary font-medium">
                          {row.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 font-body-md text-on-surface">{row.value}</td>
                    <td className="p-6">
                      <span className="bg-surface-container-high text-on-surface text-[10px] px-3 py-1 rounded tracking-widest font-bold">
                        {row.status}
                      </span>
                    </td>
                    <td className="p-6 text-right text-label-sm text-outline">
                      {row.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </AppLayout>
  );
}
