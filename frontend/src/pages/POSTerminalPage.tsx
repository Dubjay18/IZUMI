import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";

/* ─── Types & Data ───────────────────────────────────────────────────── */

type TerminalStatus = "active" | "inactive" | "overdue";

interface POSTerminal {
  id: string;
  merchantName: string;
  businessType: string;
  deviceId: string;
  location: string;
  lastTransaction: string;
  outstandingBalance: number;
  totalLoaned: number;
  repaidPct: number;
  status: TerminalStatus;
}

const TERMINALS: POSTerminal[] = [
  { id: "t1", merchantName: "Celestine Bazaar Ltd", businessType: "Retail", deviceId: "POS-882-XD", location: "Lagos, NG", lastTransaction: "Jul 6, 2026", outstandingBalance: 84200, totalLoaned: 150000, repaidPct: 44, status: "active" },
  { id: "t2", merchantName: "Fontaine Grocers", businessType: "FMCG", deviceId: "POS-741-KM", location: "Abuja, NG", lastTransaction: "Jul 5, 2026", outstandingBalance: 32000, totalLoaned: 80000, repaidPct: 60, status: "active" },
  { id: "t3", merchantName: "Obi Pharma Group", businessType: "Healthcare", deviceId: "POS-309-RT", location: "Port Harcourt, NG", lastTransaction: "Jun 18, 2026", outstandingBalance: 67500, totalLoaned: 120000, repaidPct: 44, status: "overdue" },
  { id: "t4", merchantName: "Nakamura Electronics", businessType: "Technology", deviceId: "POS-552-PL", location: "London, UK", lastTransaction: "Jul 4, 2026", outstandingBalance: 0, totalLoaned: 200000, repaidPct: 100, status: "inactive" },
  { id: "t5", merchantName: "Soleil Fashion House", businessType: "Retail", deviceId: "POS-228-VS", location: "Geneva, CH", lastTransaction: "Jul 6, 2026", outstandingBalance: 41800, totalLoaned: 95000, repaidPct: 56, status: "active" },
  { id: "t6", merchantName: "Harvest Agri Co.", businessType: "Agriculture", deviceId: "POS-991-AQ", location: "Kano, NG", lastTransaction: "May 22, 2026", outstandingBalance: 58900, totalLoaned: 100000, repaidPct: 41, status: "overdue" },
];

const STATUS_CFG: Record<TerminalStatus, { label: string; dot: string; badge: string; text: string }> = {
  active:   { label: "Active",    dot: "bg-[#1b5e20]",        badge: "bg-[#e8f5e9] text-[#1b5e20]",                          text: "text-[#1b5e20]" },
  inactive: { label: "Inactive",  dot: "bg-outline-variant",  badge: "bg-surface-container-high text-on-surface-variant",     text: "text-on-surface-variant" },
  overdue:  { label: "Overdue",   dot: "bg-error animate-pulse", badge: "bg-error-container text-on-error-container",         text: "text-error" },
};

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US");
}

type StatusFilter = "ALL" | TerminalStatus;

/* ─── Page ───────────────────────────────────────────────────────────── */

export function POSTerminalPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const STATUS_TABS: { key: StatusFilter; label: string }[] = [
    { key: "ALL",      label: "All Terminals" },
    { key: "active",   label: "Active" },
    { key: "overdue",  label: "Overdue" },
    { key: "inactive", label: "Inactive" },
  ];

  const filtered = TERMINALS.filter((t) => {
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || t.merchantName.toLowerCase().includes(q) || t.deviceId.toLowerCase().includes(q) || t.location.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalOutstanding = TERMINALS.reduce((s, t) => s + t.outstandingBalance, 0);
  const totalLoaned = TERMINALS.reduce((s, t) => s + t.totalLoaned, 0);
  const overdueCount = TERMINALS.filter((t) => t.status === "overdue").length;
  const activeCount = TERMINALS.filter((t) => t.status === "active").length;

  const selectedTerminal = selected ? TERMINALS.find((t) => t.id === selected) : null;

  return (
    <AppLayout showCurve={false}>
      {/* Ambient bg */}
      <div
        className="fixed top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full -z-10 pointer-events-none"
        style={{ background: "radial-gradient(circle at center, rgba(115,92,0,0.04) 0%, transparent 70%)" }}
      />

      <main className="pt-10 pb-32 px-gutter md:px-container-padding max-w-[1440px] mx-auto">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <section className="mb-section-gap flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <p className="font-subhead-caps text-subhead-caps text-secondary tracking-[0.15em] mb-4">
              LOAN &amp; CREDIT OPERATIONS
            </p>
            <h2 className="font-display-lg text-[clamp(40px,5vw,56px)] leading-none text-primary mb-4">
              POS Terminal Manager
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Manage merchant borrowers with registered POS terminals. Monitor
              repayment performance, terminal health, and outstanding balances.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button className="bg-primary text-background px-8 py-3 rounded-full font-subhead-caps text-subhead-caps hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
              REGISTER TERMINAL
            </button>
            <button className="border border-primary text-primary px-8 py-3 rounded-full font-subhead-caps text-subhead-caps hover:bg-primary hover:text-white transition-all active:scale-95">
              EXPORT
            </button>
          </div>
        </section>

        {/* ── Metric Cards ────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-section-gap">
          {[
            { label: "TOTAL TERMINALS",       value: TERMINALS.length.toString(),  icon: "point_of_sale",    sub: `${activeCount} active`,              subColor: "text-on-primary-container" },
            { label: "TOTAL OUTSTANDING",     value: fmt(totalOutstanding),         icon: "account_balance",  sub: "Across all borrowers",              subColor: "text-on-primary-container" },
            { label: "TOTAL CAPITAL DEPLOYED",value: fmt(totalLoaned),              icon: "payments",         sub: "Cumulative loans issued",            subColor: "text-on-primary-container" },
            { label: "OVERDUE ACCOUNTS",      value: overdueCount.toString(),       icon: "warning",          sub: "Require immediate review",          subColor: "text-error" },
          ].map((m) => (
            <div key={m.label} className="glass-card p-8 rounded-xl flex flex-col justify-between h-44 group hover:border-primary/20 transition-all">
              <div className="flex justify-between items-start">
                <span className="font-subhead-caps text-[11px] text-on-surface-variant leading-tight">{m.label}</span>
                <span className="material-symbols-outlined text-primary opacity-40 group-hover:opacity-100 transition-opacity">{m.icon}</span>
              </div>
              <div>
                <h3 className="font-headline-md text-[26px] text-primary font-bold">{m.value}</h3>
                <p className={`text-[11px] mt-1 font-medium ${m.subColor}`}>{m.sub}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Terminal Table */}
          <div className={`${selectedTerminal ? "lg:col-span-8" : "lg:col-span-12"} transition-all duration-300`}>
            <div className="glass-card rounded-xl overflow-hidden">

              {/* Search + Filter */}
              <div className="p-6 border-b border-outline-variant/20 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-64 focus-within:scale-[1.02] transition-transform duration-200">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search merchant, device..."
                    className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border-b-2 border-transparent focus:border-secondary outline-none font-body-md text-sm transition-all placeholder:text-outline/50"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {STATUS_TABS.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setStatusFilter(t.key)}
                      className={`px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${
                        statusFilter === t.key
                          ? "bg-secondary-container text-on-secondary-container"
                          : "border border-transparent hover:border-outline-variant/20 hover:bg-surface-container-low text-on-surface-variant font-medium"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-outline-variant/40">
                      {["Merchant", "Device ID", "Location", "Outstanding", "Repaid", "Status", ""].map((col, i) => (
                        <th key={i} className="p-5 font-subhead-caps text-[11px] text-outline uppercase tracking-widest whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-on-surface-variant text-sm">No terminals found.</td>
                      </tr>
                    ) : filtered.map((t) => {
                      const cfg = STATUS_CFG[t.status];
                      const isSelected = selected === t.id;
                      return (
                        <tr
                          key={t.id}
                          onClick={() => setSelected(isSelected ? null : t.id)}
                          className={`transition-colors cursor-pointer ${isSelected ? "bg-secondary-container/20" : "hover:bg-surface-container-low"}`}
                        >
                          <td className="p-5">
                            <div>
                              <p className="text-[13px] font-bold text-primary">{t.merchantName}</p>
                              <p className="text-[11px] text-outline">{t.businessType}</p>
                            </div>
                          </td>
                          <td className="p-5">
                            <span className="font-mono text-[12px] text-on-surface-variant">{t.deviceId}</span>
                          </td>
                          <td className="p-5">
                            <span className="text-[13px] text-on-surface">{t.location}</span>
                          </td>
                          <td className="p-5">
                            <span className={`text-[13px] font-bold ${t.outstandingBalance > 0 ? "text-primary" : "text-on-primary-container"}`}>
                              {fmt(t.outstandingBalance)}
                            </span>
                          </td>
                          <td className="p-5">
                            <div className="flex flex-col gap-1">
                              <span className="text-[12px] font-bold text-on-surface">{t.repaidPct}%</span>
                              <div className="w-16 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${t.repaidPct}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                              <span className={`text-[11px] font-bold ${cfg.text}`}>{cfg.label}</span>
                            </div>
                          </td>
                          <td className="p-5">
                            <span className="material-symbols-outlined text-outline-variant text-[18px]">
                              {isSelected ? "expand_less" : "chevron_right"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table footer */}
              <div className="p-5 border-t border-outline-variant/20">
                <p className="text-[11px] text-outline">
                  Showing {filtered.length} of {TERMINALS.length} terminals
                </p>
              </div>
            </div>
          </div>

          {/* Terminal Detail Panel */}
          {selectedTerminal && (
            <div className="lg:col-span-4">
              <div className="glass-card rounded-xl overflow-hidden sticky top-24">
                {/* Header */}
                <div className="bg-primary p-6 relative overflow-hidden">
                  <svg className="absolute bottom-0 right-0 opacity-10 w-24 h-24" viewBox="0 0 100 100">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="0.5" />
                  </svg>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-secondary-fixed-dim tracking-[0.2em] mb-1 font-subhead-caps">TERMINAL PROFILE</p>
                      <h4 className="font-headline-md text-[18px] text-background leading-tight">{selectedTerminal.merchantName}</h4>
                      <p className="text-[12px] text-background/60 mt-1">{selectedTerminal.deviceId}</p>
                    </div>
                    <button onClick={() => setSelected(null)} className="text-background/60 hover:text-background transition-colors">
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>
                  <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold ${STATUS_CFG[selectedTerminal.status].badge}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${STATUS_CFG[selectedTerminal.status].dot}`} />
                    {STATUS_CFG[selectedTerminal.status].label}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-5">
                  {[
                    { label: "Business Type",      value: selectedTerminal.businessType },
                    { label: "Location",           value: selectedTerminal.location },
                    { label: "Last Transaction",   value: selectedTerminal.lastTransaction },
                    { label: "Total Loaned",       value: fmt(selectedTerminal.totalLoaned) },
                    { label: "Outstanding Balance", value: fmt(selectedTerminal.outstandingBalance) },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center border-b border-outline-variant/20 pb-3 last:border-0 last:pb-0">
                      <span className="text-[12px] text-on-surface-variant">{row.label}</span>
                      <span className="text-[13px] font-bold text-primary">{row.value}</span>
                    </div>
                  ))}

                  {/* Repayment progress */}
                  <div>
                    <div className="flex justify-between text-[12px] mb-2">
                      <span className="text-on-surface-variant">Repayment Progress</span>
                      <span className="font-bold text-primary">{selectedTerminal.repaidPct}%</span>
                    </div>
                    <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-700"
                        style={{ width: `${selectedTerminal.repaidPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex flex-col gap-2">
                  <button className="w-full bg-primary text-background py-2.5 rounded-full text-[12px] font-bold hover:shadow-lg transition-all active:scale-95">
                    VIEW AMORTIZATION
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="border border-primary text-primary py-2 rounded-full text-[11px] font-bold hover:bg-primary hover:text-white transition-all active:scale-95">
                      {selectedTerminal.status === "active" ? "DEACTIVATE" : "ACTIVATE"}
                    </button>
                    <button className="border border-outline-variant/40 text-on-surface-variant py-2 rounded-full text-[11px] font-bold hover:bg-surface-container-low transition-all active:scale-95">
                      SEND NOTICE
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
}
