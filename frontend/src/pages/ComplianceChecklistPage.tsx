import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";

/* ─── Types & Data ───────────────────────────────────────────────────── */

type ItemStatus = "complete" | "in-progress" | "overdue";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  status: ItemStatus;
  lastReviewed: string;
  owner: string;
}

interface ChecklistGroup {
  category: string;
  icon: string;
  items: ChecklistItem[];
}

const CHECKLIST_DATA: ChecklistGroup[] = [
  {
    category: "AML / CTF",
    icon: "gavel",
    items: [
      { id: "aml-1", title: "Customer Due Diligence (CDD)", description: "Verify identity of all onboarded customers and maintain up-to-date records.", status: "complete", lastReviewed: "Jul 1, 2026", owner: "Compliance Team" },
      { id: "aml-2", title: "Enhanced Due Diligence (EDD)", description: "High-risk and PEP customer review with senior sign-off.", status: "in-progress", lastReviewed: "Jun 28, 2026", owner: "Risk Committee" },
      { id: "aml-3", title: "Suspicious Activity Reports (SAR)", description: "Submit SARs to FIU within 24 hours of detection.", status: "complete", lastReviewed: "Jul 3, 2026", owner: "AML Officer" },
      { id: "aml-4", title: "Transaction Monitoring Rules", description: "Quarterly review of automated monitoring thresholds.", status: "overdue", lastReviewed: "Apr 10, 2026", owner: "Risk Team" },
    ],
  },
  {
    category: "KYC / KYB",
    icon: "badge",
    items: [
      { id: "kyc-1", title: "Individual Identity Verification", description: "BVN / ZK-Proof KYC passed for all active savers.", status: "complete", lastReviewed: "Jul 5, 2026", owner: "Onboarding Team" },
      { id: "kyc-2", title: "Corporate KYB Verification", description: "Beneficial ownership structure verified for all borrowers.", status: "in-progress", lastReviewed: "Jul 2, 2026", owner: "Legal Team" },
      { id: "kyc-3", title: "Annual Re-verification", description: "Periodic re-KYC for existing customers per regulatory mandate.", status: "overdue", lastReviewed: "Jan 15, 2026", owner: "Compliance Team" },
    ],
  },
  {
    category: "Data Privacy",
    icon: "lock",
    items: [
      { id: "dp-1", title: "GDPR Data Processing Records", description: "Maintain Article 30 records of processing activities.", status: "complete", lastReviewed: "Jun 30, 2026", owner: "DPO" },
      { id: "dp-2", title: "Data Breach Response Plan", description: "72-hour notification procedure tested and documented.", status: "complete", lastReviewed: "May 20, 2026", owner: "Security Team" },
      { id: "dp-3", title: "Privacy Impact Assessments (PIA)", description: "PIA completed for all new data processing systems.", status: "in-progress", lastReviewed: "Jun 15, 2026", owner: "DPO" },
    ],
  },
  {
    category: "Reporting",
    icon: "bar_chart",
    items: [
      { id: "rep-1", title: "Quarterly Regulatory Report", description: "Submit portfolio and risk metrics to SEC / CBN.", status: "complete", lastReviewed: "Jul 1, 2026", owner: "CFO Office" },
      { id: "rep-2", title: "Annual Audit Preparation", description: "Compile documentation package for external auditors (Sentinel Labs).", status: "in-progress", lastReviewed: "Jun 25, 2026", owner: "Finance Team" },
      { id: "rep-3", title: "On-chain Proof of Reserves", description: "Publish verifiable proof-of-reserves attestation on-chain.", status: "complete", lastReviewed: "Jul 4, 2026", owner: "Engineering" },
    ],
  },
];

const STATUS_CONFIG: Record<ItemStatus, { label: string; dot: string; badge: string; text: string; icon: string }> = {
  complete:    { label: "Complete",     dot: "bg-[#1b5e20]",    badge: "bg-[#e8f5e9] text-[#1b5e20]",   text: "text-[#1b5e20]",   icon: "check_circle" },
  "in-progress": { label: "In Progress", dot: "bg-secondary animate-pulse", badge: "bg-secondary-container text-on-secondary-container", text: "text-secondary", icon: "pending" },
  overdue:     { label: "Overdue",      dot: "bg-error animate-pulse", badge: "bg-error-container text-on-error-container",    text: "text-error",      icon: "error" },
};

type FilterStatus = "ALL" | ItemStatus;

/* ─── Page ───────────────────────────────────────────────────────────── */

export function ComplianceChecklistPage() {
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  /* Aggregate counts */
  const allItems = CHECKLIST_DATA.flatMap((g) => g.items);
  const counts = {
    total: allItems.length,
    complete: allItems.filter((i) => i.status === "complete").length,
    "in-progress": allItems.filter((i) => i.status === "in-progress").length,
    overdue: allItems.filter((i) => i.status === "overdue").length,
  };
  const pct = Math.round((counts.complete / counts.total) * 100);

  const FILTER_TABS: { key: FilterStatus; label: string }[] = [
    { key: "ALL",         label: "All Items" },
    { key: "complete",    label: "Complete" },
    { key: "in-progress", label: "In Progress" },
    { key: "overdue",     label: "Overdue" },
  ];

  const filteredGroups = CHECKLIST_DATA.map((g) => ({
    ...g,
    items: filter === "ALL" ? g.items : g.items.filter((i) => i.status === filter),
  })).filter((g) => g.items.length > 0);

  return (
    <AppLayout showCurve={false}>
      {/* Ambient blobs */}
      <div
        className="fixed top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full -z-10 pointer-events-none"
        style={{ background: "radial-gradient(circle at center, rgba(186,26,26,0.04) 0%, transparent 70%)" }}
      />

      <main className="pt-10 pb-32 px-gutter md:px-container-padding max-w-[1440px] mx-auto">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <section className="mb-section-gap flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <p className="font-subhead-caps text-subhead-caps text-secondary tracking-[0.15em] mb-4">
              ADMINISTRATION
            </p>
            <h2 className="font-display-lg text-[clamp(40px,5vw,56px)] leading-none text-primary mb-4">
              Compliance Checklist
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Track regulatory requirements, audit preparation status, and
              compliance obligations across all active frameworks.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button className="bg-primary text-background px-8 py-3 rounded-full font-subhead-caps text-subhead-caps hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">download</span>
              AUDIT EXPORT
            </button>
            <button className="border border-primary text-primary px-8 py-3 rounded-full font-subhead-caps text-subhead-caps hover:bg-primary hover:text-white transition-all active:scale-95">
              ASSIGN TASKS
            </button>
          </div>
        </section>

        {/* ── Progress Summary ─────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-gutter mb-section-gap">
          {/* Overall progress */}
          <div className="lg:col-span-1 bg-primary p-8 rounded-xl relative overflow-hidden">
            <svg className="absolute bottom-0 right-0 opacity-10 w-24 h-24" viewBox="0 0 100 100">
              <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="0.5" />
              <circle cx="100" cy="100" r="55" fill="none" stroke="white" strokeWidth="0.5" />
            </svg>
            <p className="font-subhead-caps text-[11px] text-secondary-fixed-dim tracking-[0.2em] mb-3">OVERALL PROGRESS</p>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-4xl font-display font-bold text-background">{pct}</span>
              <span className="text-xl text-secondary-container font-body">%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-secondary-container rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-[12px] text-background/60">{counts.complete} of {counts.total} items complete</p>
          </div>

          {/* Count cards */}
          {[
            { label: "COMPLETE",     count: counts.complete,       color: "text-[#1b5e20]", bg: "bg-[#e8f5e9]",                  icon: "check_circle" },
            { label: "IN PROGRESS",  count: counts["in-progress"], color: "text-secondary",  bg: "bg-secondary-container/30",      icon: "pending" },
            { label: "OVERDUE",      count: counts.overdue,        color: "text-error",      bg: "bg-error-container",             icon: "error" },
          ].map((c) => (
            <div key={c.label} className="glass-card p-8 rounded-xl flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <span className="font-subhead-caps text-[11px] text-on-surface-variant">{c.label}</span>
                <span className={`material-symbols-outlined text-[20px] ${c.color}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}>
                  {c.icon}
                </span>
              </div>
              <div>
                <span className={`text-4xl font-display font-bold ${c.color}`}>{c.count}</span>
                <span className="text-[13px] text-on-surface-variant font-body ml-2">items</span>
              </div>
            </div>
          ))}
        </section>

        {/* ── Filter Tabs ──────────────────────────────────────────────── */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {FILTER_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-5 py-2 rounded-full text-[12px] font-bold transition-all ${
                filter === t.key
                  ? "bg-primary text-white"
                  : "border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {t.label}
              {t.key !== "ALL" && (
                <span className="ml-2 opacity-60">
                  {t.key === "complete" ? counts.complete : t.key === "in-progress" ? counts["in-progress"] : counts.overdue}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Checklist Groups ─────────────────────────────────────────── */}
        <div className="space-y-8">
          {filteredGroups.map((group) => (
            <div key={group.category} className="glass-card rounded-xl overflow-hidden">
              {/* Group header */}
              <div className="flex items-center gap-3 px-8 py-5 bg-surface-container-low border-b border-outline-variant/20">
                <span className="material-symbols-outlined text-primary text-[20px]">{group.icon}</span>
                <h3 className="font-headline-md text-[18px] text-primary font-bold">{group.category}</h3>
                <span className="ml-auto text-[11px] font-bold text-on-surface-variant">
                  {group.items.filter((i) => i.status === "complete").length}/{group.items.length} complete
                </span>
              </div>

              {/* Items */}
              <div className="divide-y divide-outline-variant/10">
                {group.items.map((item) => {
                  const cfg = STATUS_CONFIG[item.status];
                  const isOpen = expanded.has(item.id);
                  return (
                    <div key={item.id} className="hover:bg-surface-container-lowest transition-colors">
                      <div
                        className="flex items-center gap-4 px-8 py-5 cursor-pointer"
                        onClick={() => toggle(item.id)}
                      >
                        {/* Status dot */}
                        <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />

                        {/* Title */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold text-primary">{item.title}</p>
                          {isOpen && (
                            <p className="text-[13px] text-on-surface-variant mt-1 leading-relaxed">{item.description}</p>
                          )}
                        </div>

                        {/* Status badge */}
                        <span className={`text-[10px] px-2.5 py-1 rounded font-bold tracking-widest shrink-0 ${cfg.badge}`}>
                          {cfg.label.toUpperCase()}
                        </span>

                        {/* Meta */}
                        <div className="hidden md:flex flex-col items-end gap-0.5 shrink-0 ml-4">
                          <span className="text-[11px] text-outline">{item.lastReviewed}</span>
                          <span className="text-[11px] text-on-surface-variant">{item.owner}</span>
                        </div>

                        {/* Chevron */}
                        <span className={`material-symbols-outlined text-outline-variant text-[20px] transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}>
                          expand_more
                        </span>
                      </div>

                      {/* Expanded row actions */}
                      {isOpen && (
                        <div className="px-8 pb-5 flex items-center gap-3 flex-wrap">
                          <button className="text-[11px] font-bold text-primary border border-primary/30 px-4 py-1.5 rounded-full hover:bg-primary hover:text-white transition-all active:scale-95">
                            Mark Complete
                          </button>
                          <button className="text-[11px] font-bold text-on-surface-variant border border-outline-variant/40 px-4 py-1.5 rounded-full hover:bg-surface-container-low transition-all active:scale-95">
                            Assign Owner
                          </button>
                          <button className="text-[11px] font-bold text-on-surface-variant border border-outline-variant/40 px-4 py-1.5 rounded-full hover:bg-surface-container-low transition-all active:scale-95">
                            Add Note
                          </button>
                          <span className="ml-auto text-[11px] text-outline hidden md:block">
                            Last reviewed: {item.lastReviewed} · {item.owner}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredGroups.length === 0 && (
            <div className="glass-card rounded-xl p-16 text-center">
              <span className="material-symbols-outlined text-5xl text-outline-variant block mb-4">
                check_circle
              </span>
              <p className="text-on-surface-variant font-body-md">No items match this filter.</p>
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
}
