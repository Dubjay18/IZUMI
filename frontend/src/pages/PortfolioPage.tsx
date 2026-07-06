import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";

/* ─── Static Data ────────────────────────────────────────────────────── */

const ALLOCATION = [
  { label: "Treasury Bonds",     pct: 38, color: "#001512", lightColor: "bg-primary" },
  { label: "Stable Yield Pools", pct: 28, color: "#2b4d46", lightColor: "bg-on-primary-fixed-variant" },
  { label: "Private Credit",     pct: 20, color: "#735c00", lightColor: "bg-secondary" },
  { label: "Liquid Equities",    pct: 10, color: "#a9cec5", lightColor: "bg-primary-fixed-dim" },
  { label: "Cash Reserve",       pct: 4,  color: "#c1c8c5", lightColor: "bg-outline-variant" },
] as const;

const PERFORMANCE = [
  { month: "Jan", yield: 2.1, principal: 48 },
  { month: "Feb", yield: 2.4, principal: 49 },
  { month: "Mar", yield: 3.0, principal: 51 },
  { month: "Apr", yield: 2.8, principal: 52 },
  { month: "May", yield: 3.5, principal: 54 },
  { month: "Jun", yield: 4.1, principal: 56 },
  { month: "Jul", yield: 3.9, principal: 57 },
] as const;

const METRICS = [
  { label: "Total Portfolio Value",  value: "$284,920",  icon: "account_balance",   change: "+12.4%", positive: true },
  { label: "Current APY",            value: "8.72%",     icon: "trending_up",       change: "+0.3pp", positive: true },
  { label: "Total Yield Earned",     value: "$18,340",   icon: "payments",          change: "+$1,820 this month", positive: true },
  { label: "Unrealized Gains",       value: "$24,160",   icon: "show_chart",        change: "Since inception", positive: true },
] as const;

const DISTRIBUTION = [
  { period: "Q1 2026", principal: 220, yield: 14 },
  { period: "Q2 2026", principal: 245, yield: 19 },
  { period: "Q3 2026", principal: 258, yield: 22 },
  { period: "Q4 2026", principal: 271, yield: 26 },
] as const;

type PerfTab = "6M" | "1Y" | "ALL";

/* ─── Donut Chart (SVG) ──────────────────────────────────────────────── */

function DonutChart() {
  const [hovered, setHovered] = useState<number | null>(null);
  const cx = 80, cy = 80, r = 62, strokeW = 18;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const segments = ALLOCATION.map((a, i) => {
    const dash = (a.pct / 100) * circumference;
    const gap = circumference - dash;
    const seg = { ...a, dash, gap, offset, i };
    offset += dash;
    return seg;
  });

  const total = ALLOCATION.reduce((s, a) => s + a.pct, 0);
  const hoveredItem = hovered !== null ? ALLOCATION[hovered] : null;

  return (
    <div className="flex flex-col md:flex-row items-center gap-8">
      {/* SVG donut */}
      <div className="relative shrink-0">
        <svg width="160" height="160" viewBox="0 0 160 160" className="rotate-[-90deg]">
          {segments.map((seg) => (
            <circle
              key={seg.i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={hovered === seg.i ? strokeW + 4 : strokeW}
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={-seg.offset}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHovered(seg.i)}
              onMouseLeave={() => setHovered(null)}
              style={{ opacity: hovered !== null && hovered !== seg.i ? 0.4 : 1 }}
            />
          ))}
        </svg>
        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {hoveredItem ? (
            <>
              <span className="text-[22px] font-display font-bold text-primary leading-none">
                {hoveredItem.pct}%
              </span>
              <span className="text-[10px] text-on-surface-variant font-body text-center px-3 mt-1 leading-tight">
                {hoveredItem.label}
              </span>
            </>
          ) : (
            <>
              <span className="text-[22px] font-display font-bold text-primary leading-none">
                {total}%
              </span>
              <span className="text-[10px] text-on-surface-variant font-body mt-1">Deployed</span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        {ALLOCATION.map((a, i) => (
          <div
            key={a.label}
            className="flex items-center gap-3 cursor-pointer group"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0 transition-transform group-hover:scale-125"
              style={{ backgroundColor: a.color }}
            />
            <span className="text-[13px] font-body text-on-surface-variant flex-1 truncate group-hover:text-on-surface transition-colors">
              {a.label}
            </span>
            <span className="text-[13px] font-body font-bold text-primary shrink-0">
              {a.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Performance Chart (SVG line) ──────────────────────────────────── */

function PerformanceChart({ tab }: { tab: PerfTab }) {
  const data = tab === "ALL" ? PERFORMANCE : tab === "1Y" ? PERFORMANCE : PERFORMANCE.slice(-4);
  const maxYield = Math.max(...data.map((d) => d.yield));
  const H = 200, W = 600, pad = 30;

  const points = data.map((d, i) => ({
    x: pad + (i / (data.length - 1)) * (W - pad * 2),
    y: H - pad - (d.yield / (maxYield * 1.2)) * (H - pad * 2),
    ...d,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${H - pad} L ${points[0].x} ${H - pad} Z`;

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={pad} y1={pad + t * (H - pad * 2)}
            x2={W - pad} y2={pad + t * (H - pad * 2)}
            stroke="#c1c8c5" strokeWidth="0.5" opacity="0.5"
          />
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="rgba(0,21,18,0.04)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#001512" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points + labels */}
        {points.map((p) => (
          <g key={p.month}>
            <circle cx={p.x} cy={p.y} r="4" fill="#001512" />
            <text x={p.x} y={H - 8} textAnchor="middle" fill="#717976" fontSize="11" fontFamily="Hanken Grotesk">
              {p.month}
            </text>
            <text x={p.x} y={p.y - 10} textAnchor="middle" fill="#001512" fontSize="10" fontFamily="Hanken Grotesk" fontWeight="600">
              {p.yield}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ─── Distribution Bar Chart ─────────────────────────────────────────── */

function DistributionChart() {
  const maxVal = Math.max(...DISTRIBUTION.map((d) => d.principal + d.yield));
  return (
    <div className="flex items-end gap-4 h-40">
      {DISTRIBUTION.map((d) => {
        const totalH = ((d.principal + d.yield) / maxVal) * 100;
        const yieldH = (d.yield / (d.principal + d.yield)) * totalH;
        const principalH = totalH - yieldH;
        return (
          <div key={d.period} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col justify-end" style={{ height: "128px" }}>
              <div
                className="w-full bg-secondary rounded-t-sm transition-all duration-700"
                style={{ height: `${yieldH}%` }}
                title={`Yield: $${d.yield}k`}
              />
              <div
                className="w-full bg-primary transition-all duration-700"
                style={{ height: `${principalH}%` }}
                title={`Principal: $${d.principal}k`}
              />
            </div>
            <span className="text-[10px] text-on-surface-variant font-body whitespace-nowrap">
              {d.period}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export function PortfolioPage() {
  const [perfTab, setPerfTab] = useState<PerfTab>("6M");
  const PERF_TABS: PerfTab[] = ["6M", "1Y", "ALL"];

  return (
    <AppLayout showCurve={false}>
      {/* Ambient bg blobs */}
      <div
        className="fixed top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full -z-10 pointer-events-none"
        style={{ background: "radial-gradient(circle at center, rgba(169,206,197,0.12) 0%, transparent 70%)" }}
      />
      <div
        className="fixed bottom-[-15%] left-[-5%] w-[50%] h-[50%] rounded-full -z-10 pointer-events-none"
        style={{ background: "radial-gradient(circle at center, rgba(233,195,73,0.06) 0%, transparent 60%)" }}
      />

      <main className="pt-10 pb-32 px-gutter md:px-container-padding max-w-[1440px] mx-auto">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <section className="mb-section-gap flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <p className="font-subhead-caps text-subhead-caps text-secondary tracking-[0.15em] mb-4">
              WEALTH OVERVIEW
            </p>
            <h2 className="font-display-lg text-[clamp(40px,5vw,56px)] leading-none text-primary mb-4">
              Investment Portfolio
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              A curated view of your asset deployment, yield generation, and
              capital performance across all Izumi Fountain strategies.
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <button className="bg-primary text-background px-8 py-3 rounded-full font-subhead-caps text-subhead-caps hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95">
              REBALANCE
            </button>
            <button className="border border-primary text-primary px-8 py-3 rounded-full font-subhead-caps text-subhead-caps hover:bg-primary hover:text-white transition-all active:scale-95">
              EXPORT REPORT
            </button>
          </div>
        </section>

        {/* ── Metric Cards ────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-section-gap">
          {METRICS.map((m) => (
            <div
              key={m.label}
              className="glass-card p-8 rounded-xl flex flex-col justify-between h-44 group hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <span className="font-subhead-caps text-subhead-caps text-on-surface-variant leading-tight text-[11px]">
                  {m.label}
                </span>
                <span className="material-symbols-outlined text-primary opacity-40 group-hover:opacity-100 transition-opacity">
                  {m.icon}
                </span>
              </div>
              <div>
                <h3 className="font-headline-md text-[28px] text-primary font-bold">{m.value}</h3>
                <p className={`text-[11px] flex items-center gap-1 mt-1 font-medium ${m.positive ? "text-on-primary-container" : "text-error"}`}>
                  <span className="material-symbols-outlined text-[13px]">
                    {m.positive ? "arrow_upward" : "arrow_downward"}
                  </span>
                  {m.change}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* ── Main Grid ───────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-gutter">

          {/* Asset Allocation */}
          <div className="glass-card p-container-padding rounded-xl">
            <div className="mb-8">
              <h4 className="font-headline-md text-[22px] text-primary mb-1">Asset Allocation</h4>
              <p className="text-[13px] text-on-surface-variant font-body-md">
                Current deployment by strategy class
              </p>
            </div>
            <DonutChart />
          </div>

          {/* Performance Analytics */}
          <div className="lg:col-span-2 glass-card p-container-padding rounded-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h4 className="font-headline-md text-[22px] text-primary mb-1">Performance Analytics</h4>
                <p className="text-[13px] text-on-surface-variant font-body-md">
                  Monthly yield rate over time
                </p>
              </div>
              {/* Period tabs */}
              <div className="flex gap-1 bg-surface-container-high rounded-full p-1 shrink-0">
                {PERF_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPerfTab(tab)}
                    className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                      perfTab === tab
                        ? "bg-primary text-white shadow"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <PerformanceChart tab={perfTab} />
          </div>
        </section>

        {/* ── Distribution Visualization ──────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">

          {/* Stacked bar chart */}
          <div className="lg:col-span-2 glass-card p-container-padding rounded-xl">
            <div className="flex justify-between items-center mb-8 gap-4">
              <div>
                <h4 className="font-headline-md text-[22px] text-primary mb-1">
                  Distribution Visualization
                </h4>
                <p className="text-[13px] text-on-surface-variant font-body-md">
                  Principal vs. earned yield by quarter (USD thousands)
                </p>
              </div>
              <div className="flex gap-4 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-primary inline-block" />
                  <span className="text-[11px] text-on-surface-variant font-body">Principal</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-secondary inline-block" />
                  <span className="text-[11px] text-on-surface-variant font-body">Yield</span>
                </div>
              </div>
            </div>
            <DistributionChart />
          </div>

          {/* Strategy snapshot */}
          <div className="flex flex-col gap-gutter">
            {/* Quick stats */}
            <div className="glass-card p-8 rounded-xl flex-1">
              <h4 className="font-headline-md text-[20px] text-primary mb-6">Strategy Mix</h4>
              <div className="space-y-5">
                {[
                  { label: "Conservative", pct: 66, desc: "Bonds + stable pools" },
                  { label: "Growth",       pct: 20, desc: "Private credit" },
                  { label: "Opportunistic", pct: 14, desc: "Equities + reserve" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[13px] font-bold text-on-surface">{s.label}</span>
                      <span className="text-[13px] font-bold text-primary">{s.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-700"
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-outline">{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next yield date */}
            <div className="bg-primary p-8 rounded-xl relative overflow-hidden">
              <svg className="absolute bottom-0 right-0 opacity-10 w-28 h-28" viewBox="0 0 100 100">
                <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="0.5" />
                <circle cx="100" cy="100" r="55" fill="none" stroke="white" strokeWidth="0.5" />
              </svg>
              <div className="relative z-10">
                <p className="font-subhead-caps text-[11px] text-secondary-fixed-dim tracking-[0.2em] mb-3">
                  NEXT YIELD EVENT
                </p>
                <h4 className="font-headline-md text-[22px] text-background mb-1">July 15, 2026</h4>
                <p className="text-[13px] text-background/60 mb-4">Est. payout: $1,840</p>
                <div className="flex items-center gap-2 text-secondary-container">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    event_available
                  </span>
                  <span className="font-subhead-caps text-[11px]">AUTO-REINVEST ON</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </AppLayout>
  );
}
