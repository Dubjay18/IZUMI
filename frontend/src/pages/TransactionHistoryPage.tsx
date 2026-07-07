import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useUser } from "@/context/UserContext";
import { useTransactions } from "@/hooks/useTransactions";
import type { LedgerEntry } from "@/lib/types";

type FilterTab = "All History" | "Deposits" | "Withdrawals" | "Yield";

const PAGE_SIZE = 20;



/* ─── Helpers ────────────────────────────────────────────────────────── */

const MICRO_USDC = 1_000_000;

function fmtAmount(amount: string, type: string) {
  const val = Number(amount) / MICRO_USDC;
  const abs = val.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = type === "DEPOSIT" || type === "YIELD" ? "+" : "-";
  return `${sign}$${abs}`;
}

function typeToApiFilter(tab: FilterTab): string | undefined {
  if (tab === "All History") return undefined;
  if (tab === "Deposits") return "DEPOSIT";
  if (tab === "Withdrawals") return "WITHDRAWAL";
  if (tab === "Yield") return "YIELD";
  return undefined;
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getEntryMeta(type: string) {
  switch (type) {
    case "DEPOSIT": return { label: "Liquidity Deposit", icon: "south_east", verification: "STANDARD" as const };
    case "YIELD": return { label: "Treasury Yield", icon: "payments", verification: "AUTO" as const };
    case "WITHDRAWAL": return { label: "External Withdrawal", icon: "north_west", verification: "ZK-VERIFIED" as const };
    default: return { label: type, icon: "swap_horiz", verification: "STANDARD" as const };
  }
}

type TxVerification = "ZK-VERIFIED" | "STANDARD" | "AUTO";

/* ─── Sub-components ─────────────────────────────────────────────────── */

function VerificationBadge({ v }: { v: TxVerification }) {
  const isZk = v === "ZK-VERIFIED";
  const isAuto = v === "AUTO";
  return (
    <div className="flex items-center gap-2">
      <span
        className={`material-symbols-outlined text-[20px] ${isZk ? "text-secondary" : "text-outline-variant"}`}
        style={isZk ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        verified_user
      </span>
      <span
        className={`text-[11px] font-medium ${
          isZk ? "text-secondary" : isAuto ? "text-outline" : "text-outline"
        }`}
      >
        {v}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: "COMPLETED" | "PENDING" | "FAILED" }) {
  const map: Record<string, { dot: string; text: string }> = {
    COMPLETED: { dot: "bg-[#1b5e20]", text: "text-[#1b5e20]" },
    PENDING: { dot: "bg-secondary animate-pulse", text: "text-secondary" },
    FAILED: { dot: "bg-error", text: "text-error" },
  };
  const { dot, text } = map[status] ?? map.FAILED;
  return (
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span className={`text-xs font-bold ${text}`}>{status}</span>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export function TransactionHistoryPage() {
  const { session } = useUser();
  const {
    entries,
    pagination,
    loading,
    error,
    setPage,
    setFilter,
    page,
  } = useTransactions(session?.userId, PAGE_SIZE);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All History");

  const TABS: FilterTab[] = ["All History", "Deposits", "Withdrawals", "Yield"];

  const filtered = useMemo(() => {
    let result = entries;

    // Apply tab filter on client side as a robust fallback
    const apiFilter = typeToApiFilter(activeFilter);
    if (apiFilter) {
      result = result.filter((e) => e.type === apiFilter);
    }

    if (!search.trim()) return result;
    const q = search.toLowerCase();
    return result.filter(
      (e) =>
        e.type.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        (e.txHash && e.txHash.toLowerCase().includes(q))
    );
  }, [entries, search, activeFilter]);

  function handleFilter(tab: FilterTab) {
    setActiveFilter(tab);
    const apiFilter = typeToApiFilter(tab);
    setFilter(apiFilter);
  }

  const totalEntries = pagination?.total ?? filtered.length;
  const totalPages = pagination?.totalPages ?? Math.max(1, Math.ceil(totalEntries / PAGE_SIZE));
  const fromEntry = totalEntries === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const toEntry = Math.min(page * PAGE_SIZE, totalEntries);

  const notifications = useMemo(() => {
    const list = [];
    
    // Generate notifications from actual ledger entries
    const recentLedger = entries.slice(0, 5);
    recentLedger.forEach((entry, idx) => {
      const amountUSD = Number(entry.amount) / MICRO_USDC;
      const formattedAmount = amountUSD.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      let title = "";
      let body = "";
      
      if (entry.type === "DEPOSIT") {
        title = "Deposit Successful";
        body = `Your liquidity deposit of $${formattedAmount} was processed successfully.`;
      } else if (entry.type === "WITHDRAWAL") {
        title = entry.status === "PENDING" ? "Withdrawal Pending" : entry.status === "FAILED" ? "Withdrawal Failed" : "Withdrawal Processed";
        body = `A withdrawal of $${formattedAmount} was ${entry.status.toLowerCase()} to your bank account.`;
      } else if (entry.type === "YIELD") {
        title = "Yield Distributed";
        body = `Treasury yield of $${formattedAmount} was credited to your vault.`;
      }

      if (title) {
        // Calculate relative time or format nicely
        const entryDate = new Date(entry.createdAt);
        const diffMs = Date.now() - entryDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        let timeStr = "";
        if (diffMins < 1) {
          timeStr = "JUST NOW";
        } else if (diffMins < 60) {
          timeStr = `${diffMins} MINUTE${diffMins > 1 ? "S" : ""} AGO`;
        } else if (diffHours < 24) {
          timeStr = `${diffHours} HOUR${diffHours > 1 ? "S" : ""} AGO`;
        } else if (diffDays < 7) {
          timeStr = `${diffDays} DAY${diffDays > 1 ? "S" : ""} AGO`;
        } else {
          timeStr = entryDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
        }

        list.push({
          id: `tx-notif-${entry.id}`,
          title,
          body,
          time: timeStr,
          isNew: entry.status === "PENDING" || idx === 0,
        });
      }
    });

    if (list.length === 0) {
      list.push({
        id: "n-welcome",
        title: "Welcome to IZUMI",
        body: "Onboarded successfully. Your virtual account is ready to receive deposits.",
        time: "JUST NOW",
        isNew: true
      });
    }

    list.push({
      id: "n-trust",
      title: "ZK-KYC Verified",
      body: "On-chain identity bound via ZK-Proof derivation address.",
      time: "ONBOARDING",
      isNew: false
    });

    return list;
  }, [entries]);

  return (
    <AppLayout showCurve={false}>
      <div
        className="fixed top-[-10%] right-[-10%] w-[80%] h-[80%] rounded-[50%_100%] -rotate-15 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(115,92,0,0.03) 0%, transparent 70%)",
        }}
      />

      <main className="pt-10 pb-32 px-gutter md:px-container-padding max-w-[1440px] mx-auto min-h-screen">

        <section className="mb-section-gap">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <p className="font-subhead-caps text-subhead-caps text-secondary mb-2 uppercase tracking-widest">
                Global Overview
              </p>
              <h2 className="font-display-lg text-[clamp(40px,5vw,56px)] leading-none text-primary">
                Transaction Ledger
              </h2>
            </div>

            <div className="flex gap-4 shrink-0">
              <button className="bg-primary text-surface px-6 py-3 flex items-center gap-2 transition-all active:scale-95 hover:shadow-lg hover:shadow-primary/20">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  add
                </span>
                <span className="font-label-sm text-label-sm">New Transfer</span>
              </button>
              <button className="border border-primary text-primary px-6 py-3 flex items-center gap-2 transition-all active:scale-95 hover:bg-surface-container-low">
                <span className="material-symbols-outlined">download</span>
                <span className="font-label-sm text-label-sm">Export CSV</span>
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <aside className="lg:col-span-4 space-y-8">

            <div className="glass-panel shadow-sm">
              <div className="flex justify-between items-center p-6 pb-4">
                <h3 className="font-headline-md text-[20px] font-bold text-primary">
                  Notifications
                </h3>
                <span className="bg-secondary-container text-on-secondary-container text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                  {notifications.filter((n) => n.isNew).length} NEW
                </span>
              </div>

              <div className="max-h-[360px] overflow-y-auto custom-scrollbar px-2 pb-2">
                {notifications.map((n, i) => (
                  <div
                    key={n.id}
                    className={`group px-4 py-4 hover:bg-surface-container-low transition-colors cursor-pointer ${
                      i < notifications.length - 1
                        ? "border-b border-outline-variant/30"
                        : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                          n.isNew ? "bg-secondary" : "bg-outline-variant"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-bold text-primary">{n.title}</p>
                        <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">
                          {n.body}
                        </p>
                        <p className="text-[10px] text-outline mt-2 tracking-widest">
                          {n.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-outline-variant/40 mx-4" />
              <button className="w-full py-4 px-6 text-center text-secondary font-label-sm text-label-sm hover:underline transition-all">
                View All Notifications
              </button>
            </div>

            <div className="bg-primary p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 border border-secondary/20 rounded-full pointer-events-none" />
              <div className="absolute -right-2 -bottom-2 w-24 h-24 border border-secondary/10 rounded-full pointer-events-none" />

              <p className="font-subhead-caps text-[12px] text-secondary-fixed-dim uppercase tracking-[0.2em] mb-4">
                Account Health
              </p>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-surface text-4xl font-display font-bold">
                  99.8
                </span>
                <span className="text-secondary-fixed text-xl font-body-md">%</span>
              </div>
              <p className="text-surface-container-highest/60 text-xs leading-relaxed max-w-[200px]">
                Verification trust score is optimized for high-velocity liquidity
                Split repayments.
              </p>

              <div className="mt-6 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary-container rounded-full"
                  style={{ width: "99.8%" }}
                />
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8">
            <div className="glass-panel shadow-sm overflow-hidden flex flex-col">

              <div className="p-6 border-b border-outline-variant/30 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-64 transition-transform duration-200 focus-within:scale-[1.02]">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search transactions..."
                    className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border-b-2 border-transparent focus:border-secondary outline-none font-body-md text-sm transition-all placeholder:text-outline/50"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleFilter(tab)}
                      className={`px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${
                        activeFilter === tab
                          ? "bg-secondary-container text-on-secondary-container"
                          : "border border-transparent hover:border-outline-variant/20 hover:bg-surface-container-low text-on-surface-variant font-medium"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="mx-6 mt-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm font-body">
                  {error}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/50">
                      {["Transaction & ID", "Type", "Verification", "Status", "Amount"].map(
                        (col, i) => (
                          <th
                            key={col}
                            className={`p-6 font-subhead-caps text-[11px] text-outline uppercase tracking-widest ${
                              i === 4 ? "text-right" : ""
                            }`}
                          >
                            {col}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {loading && filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="p-12 space-y-4">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="flex gap-4 items-center">
                                <div className="h-4 w-24 bg-surface-container-high rounded animate-pulse" />
                                <div className="h-4 w-16 bg-surface-container-high rounded animate-pulse" />
                                <div className="h-4 w-20 bg-surface-container-high rounded animate-pulse" />
                                <div className="h-4 w-12 bg-surface-container-high rounded animate-pulse ml-auto" />
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-12 text-center text-on-surface-variant font-body-md text-sm"
                        >
                          No transactions found.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((entry: LedgerEntry) => {
                        const meta = getEntryMeta(entry.type);
                        const isCredit = entry.type === "DEPOSIT" || entry.type === "YIELD";
                        return (
                          <tr
                            key={entry.id}
                            className="hover:bg-surface-container-low transition-colors cursor-pointer group"
                          >
                            <td className="p-6">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-body-md text-sm font-bold text-primary group-hover:text-on-primary-fixed-variant transition-colors">
                                  {meta.label}
                                </span>
                                <span className="text-[10px] text-outline font-mono">
                                  {fmtDate(entry.createdAt)}
                                </span>
                              </div>
                            </td>

                            <td className="p-6">
                              <span className="bg-surface-container-high px-2 py-1 text-[10px] font-bold text-on-surface-variant tracking-wider">
                                {entry.type}
                              </span>
                            </td>

                            <td className="p-6">
                              <VerificationBadge v={meta.verification} />
                            </td>

                            <td className="p-6">
                              <StatusBadge status={entry.status as "COMPLETED" | "PENDING" | "FAILED"} />
                            </td>

                            <td className="p-6 text-right">
                              <span
                                className={`font-body-md text-sm font-bold ${
                                  isCredit ? "text-[#1b5e20]" : "text-primary"
                                }`}
                              >
                                {fmtAmount(entry.amount, entry.type)}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-6 border-t border-outline-variant/30 flex items-center justify-between gap-4">
                <p className="text-[11px] text-outline">
                  {loading
                    ? "Loading..."
                    : `Showing ${fromEntry} to ${toEntry} of ${totalEntries} transactions`}
                </p>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1 || loading}
                    className="p-2 hover:bg-surface-container-low rounded transition-all material-symbols-outlined text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    chevron_left
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(Math.max(0, page - 2), Math.min(totalPages, page + 1))
                    .map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-colors ${
                          p === page
                            ? "bg-primary text-surface"
                            : "hover:bg-surface-container-low text-on-surface"
                        }`}
                      >
                        {p}
                      </button>
                    ))}

                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages || loading}
                    className="p-2 hover:bg-surface-container-low rounded transition-all material-symbols-outlined text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    chevron_right
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
