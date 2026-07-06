import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";

/* ─── Types ─────────────────────────────────────────────────────────── */

type TxType = "REPAYMENT" | "DEPOSIT" | "WITHDRAWAL" | "YIELD";
type TxStatus = "Completed" | "Pending" | "Failed";
type TxVerification = "ZK-VERIFIED" | "STANDARD" | "AUTO";
type FilterTab = "All History" | "Deposits" | "Withdrawals" | "Daily Splits";

interface Transaction {
  id: string;
  name: string;
  txnId: string;
  type: TxType;
  verification: TxVerification;
  status: TxStatus;
  amount: number; // positive = credit, negative = debit
  date: string;
}

/* ─── Static Data ────────────────────────────────────────────────────── */

const TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    name: "Daily Split Repayment",
    txnId: "TXN-009827-ZK",
    type: "REPAYMENT",
    verification: "ZK-VERIFIED",
    status: "Completed",
    amount: -1420.0,
    date: "Jul 6, 2026",
  },
  {
    id: "2",
    name: "Liquidity Deposit",
    txnId: "TXN-009826-WF",
    type: "DEPOSIT",
    verification: "STANDARD",
    status: "Pending",
    amount: 50000.0,
    date: "Jul 6, 2026",
  },
  {
    id: "3",
    name: "External Withdrawal",
    txnId: "TXN-009825-AM",
    type: "WITHDRAWAL",
    verification: "ZK-VERIFIED",
    status: "Completed",
    amount: -24500.0,
    date: "Jul 5, 2026",
  },
  {
    id: "4",
    name: "Daily Split Repayment",
    txnId: "TXN-009824-ZK",
    type: "REPAYMENT",
    verification: "ZK-VERIFIED",
    status: "Completed",
    amount: -1420.0,
    date: "Jul 5, 2026",
  },
  {
    id: "5",
    name: "Treasury Yield",
    txnId: "TXN-009823-TY",
    type: "YIELD",
    verification: "AUTO",
    status: "Completed",
    amount: 412.18,
    date: "Jul 4, 2026",
  },
  {
    id: "6",
    name: "Liquidity Deposit",
    txnId: "TXN-009822-WF",
    type: "DEPOSIT",
    verification: "STANDARD",
    status: "Completed",
    amount: 15000.0,
    date: "Jul 4, 2026",
  },
  {
    id: "7",
    name: "Daily Split Repayment",
    txnId: "TXN-009821-ZK",
    type: "REPAYMENT",
    verification: "ZK-VERIFIED",
    status: "Completed",
    amount: -1420.0,
    date: "Jul 3, 2026",
  },
  {
    id: "8",
    name: "External Withdrawal",
    txnId: "TXN-009820-AM",
    type: "WITHDRAWAL",
    verification: "ZK-VERIFIED",
    status: "Completed",
    amount: -8000.0,
    date: "Jul 3, 2026",
  },
];

const NOTIFICATIONS = [
  {
    id: "n1",
    title: "Large Withdrawal Detected",
    body: "A withdrawal of $24,500.00 was processed to Account **4921.",
    time: "2 MINUTES AGO",
    isNew: true,
  },
  {
    id: "n2",
    title: "ZK-Verification Successful",
    body: "Daily Split repayment #882-X verified on-chain via ZK-Proof.",
    time: "1 HOUR AGO",
    isNew: true,
  },
  {
    id: "n3",
    title: "Portfolio Rebalanced",
    body: "Asset allocation updated according to Q3 strategy.",
    time: "4 HOURS AGO",
    isNew: false,
  },
  {
    id: "n4",
    title: "Yield Distributed",
    body: "Treasury yield of $412.18 credited to your vault.",
    time: "6 HOURS AGO",
    isNew: true,
  },
];

const PAGE_SIZE = 5;

/* ─── Helpers ────────────────────────────────────────────────────────── */

function fmt(amount: number) {
  const abs = Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount >= 0 ? "+" : "-"}$${abs}`;
}

function typeToFilter(type: TxType): FilterTab | null {
  if (type === "DEPOSIT" || type === "YIELD") return "Deposits";
  if (type === "WITHDRAWAL") return "Withdrawals";
  if (type === "REPAYMENT") return "Daily Splits";
  return null;
}

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

function StatusBadge({ status }: { status: TxStatus }) {
  const map: Record<TxStatus, { dot: string; text: string }> = {
    Completed: { dot: "bg-[#1b5e20]", text: "text-[#1b5e20]" },
    Pending: { dot: "bg-secondary animate-pulse", text: "text-secondary" },
    Failed: { dot: "bg-error", text: "text-error" },
  };
  const { dot, text } = map[status];
  return (
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span className={`text-xs font-bold ${text}`}>{status}</span>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export function TransactionHistoryPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All History");
  const [page, setPage] = useState(1);

  const TABS: FilterTab[] = ["All History", "Deposits", "Withdrawals", "Daily Splits"];

  const filtered = useMemo(() => {
    let rows = TRANSACTIONS;

    if (activeFilter !== "All History") {
      rows = rows.filter((t) => typeToFilter(t.type) === activeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.txnId.toLowerCase().includes(q) ||
          t.type.toLowerCase().includes(q)
      );
    }

    return rows;
  }, [search, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFilter(tab: FilterTab) {
    setActiveFilter(tab);
    setPage(1);
  }

  return (
    <AppLayout showCurve={false}>
      {/* Subtle parabolic bg */}
      <div
        className="fixed top-[-10%] right-[-10%] w-[80%] h-[80%] rounded-[50%_100%] -rotate-15 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(115,92,0,0.03) 0%, transparent 70%)",
        }}
      />

      <main className="pt-10 pb-32 px-gutter md:px-container-padding max-w-[1440px] mx-auto min-h-screen">

        {/* ── Page Header ─────────────────────────────────────────────── */}
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

        {/* ── Body Grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── Left Sidebar ─────────────────────────────────────────── */}
          <aside className="lg:col-span-4 space-y-8">

            {/* Notifications */}
            <div className="glass-panel shadow-sm">
              <div className="flex justify-between items-center p-6 pb-4">
                <h3 className="font-headline-md text-[20px] font-bold text-primary">
                  Notifications
                </h3>
                <span className="bg-secondary-container text-on-secondary-container text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                  {NOTIFICATIONS.filter((n) => n.isNew).length} NEW
                </span>
              </div>

              <div className="max-h-[360px] overflow-y-auto custom-scrollbar px-2 pb-2">
                {NOTIFICATIONS.map((n, i) => (
                  <div
                    key={n.id}
                    className={`group px-4 py-4 hover:bg-surface-container-low transition-colors cursor-pointer ${
                      i < NOTIFICATIONS.length - 1
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

            {/* Account Health Score */}
            <div className="bg-primary p-8 shadow-2xl relative overflow-hidden">
              {/* Decorative ring */}
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

              {/* Progress bar */}
              <div className="mt-6 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary-container rounded-full"
                  style={{ width: "99.8%" }}
                />
              </div>
            </div>
          </aside>

          {/* ── Ledger Table ─────────────────────────────────────────── */}
          <div className="lg:col-span-8">
            <div className="glass-panel shadow-sm overflow-hidden flex flex-col">

              {/* Search & Filter Bar */}
              <div className="p-6 border-b border-outline-variant/30 flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
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

                {/* Filter tabs */}
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

              {/* Table */}
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
                    {paginated.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-12 text-center text-on-surface-variant font-body-md text-sm"
                        >
                          No transactions found.
                        </td>
                      </tr>
                    ) : (
                      paginated.map((tx) => {
                        const isCredit = tx.amount >= 0;
                        return (
                          <tr
                            key={tx.id}
                            className="hover:bg-surface-container-low transition-colors cursor-pointer group"
                          >
                            {/* Name + ID */}
                            <td className="p-6">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-body-md text-sm font-bold text-primary group-hover:text-on-primary-fixed-variant transition-colors">
                                  {tx.name}
                                </span>
                                <span className="text-[10px] text-outline font-mono">
                                  {tx.txnId}
                                </span>
                              </div>
                            </td>

                            {/* Type chip */}
                            <td className="p-6">
                              <span className="bg-surface-container-high px-2 py-1 text-[10px] font-bold text-on-surface-variant tracking-wider">
                                {tx.type}
                              </span>
                            </td>

                            {/* Verification */}
                            <td className="p-6">
                              <VerificationBadge v={tx.verification} />
                            </td>

                            {/* Status */}
                            <td className="p-6">
                              <StatusBadge status={tx.status} />
                            </td>

                            {/* Amount */}
                            <td className="p-6 text-right">
                              <span
                                className={`font-body-md text-sm font-bold ${
                                  isCredit ? "text-[#1b5e20]" : "text-primary"
                                }`}
                              >
                                {fmt(tx.amount)}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="p-6 border-t border-outline-variant/30 flex items-center justify-between gap-4">
                <p className="text-[11px] text-outline">
                  Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to{" "}
                  {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}{" "}
                  transactions
                </p>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 hover:bg-surface-container-low rounded transition-all material-symbols-outlined text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    chevron_left
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(
                      Math.max(0, page - 2),
                      Math.min(totalPages, page + 1)
                    )
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
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
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
