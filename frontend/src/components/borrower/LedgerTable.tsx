import { useState } from "react";

type FilterTab = "all" | "repayments" | "disbursements" | "splits";

const FILTERS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All History" },
  { key: "repayments", label: "Repayments" },
  { key: "disbursements", label: "Disbursements" },
  { key: "splits", label: "Daily Splits" },
];

const TRANSACTIONS = [
  {
    name: "Daily Split Repayment",
    id: "TXN-009827-ZK",
    type: "REPAYMENT",
    typeStyle: "bg-surface-container-high text-on-surface-variant",
    verified: true,
    verifiedLabel: "ZK-VERIFIED",
    status: "Completed",
    statusDot: "bg-[#1b5e20]",
    statusColor: "text-[#1b5e20]",
    amount: "-$1,420.00",
    amountColor: "text-primary",
  },
  {
    name: "Loan Disbursement",
    id: "TXN-009826-WF",
    type: "DISBURSEMENT",
    typeStyle: "bg-surface-container-high text-on-surface-variant",
    verified: false,
    verifiedLabel: "STANDARD",
    status: "Pending",
    statusDot: "bg-secondary animate-pulse",
    statusColor: "text-secondary",
    amount: "+$50,000.00",
    amountColor: "text-[#1b5e20]",
  },
  {
    name: "Repayment Withdrawal",
    id: "TXN-009825-AM",
    type: "WITHDRAWAL",
    typeStyle: "bg-surface-container-high text-on-surface-variant",
    verified: true,
    verifiedLabel: "ZK-VERIFIED",
    status: "Completed",
    statusDot: "bg-[#1b5e20]",
    statusColor: "text-[#1b5e20]",
    amount: "-$24,500.00",
    amountColor: "text-primary",
  },
  {
    name: "Daily Split Repayment",
    id: "TXN-009824-ZK",
    type: "REPAYMENT",
    typeStyle: "bg-surface-container-high text-on-surface-variant",
    verified: true,
    verifiedLabel: "ZK-VERIFIED",
    status: "Completed",
    statusDot: "bg-[#1b5e20]",
    statusColor: "text-[#1b5e20]",
    amount: "-$1,420.00",
    amountColor: "text-primary",
  },
  {
    name: "Interest Accrued",
    id: "TXN-009823-TY",
    type: "INTEREST",
    typeStyle: "bg-surface-container-high text-on-surface-variant",
    verified: false,
    verifiedLabel: "AUTO",
    status: "Completed",
    statusDot: "bg-[#1b5e20]",
    statusColor: "text-[#1b5e20]",
    amount: "+$412.18",
    amountColor: "text-[#1b5e20]",
  },
];

export function LedgerTable() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const filtered = TRANSACTIONS.filter((tx) => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "repayments" && tx.type === "REPAYMENT") ||
      (activeFilter === "disbursements" && tx.type === "DISBURSEMENT") ||
      (activeFilter === "splits" && tx.type === "REPAYMENT");
    const matchesSearch =
      !search ||
      tx.name.toLowerCase().includes(search.toLowerCase()) ||
      tx.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="glass-panel shadow-sm overflow-hidden flex flex-col">
      {/* Search & Filter Bar */}
      <div className="p-6 border-b border-outline-variant/30 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border-b-2 border-transparent focus:border-secondary outline-none font-body-md text-sm transition-all placeholder:text-outline/50"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${
                activeFilter === f.key
                  ? "bg-secondary-container text-on-secondary-container"
                  : "hover:bg-surface-container-low text-on-surface-variant border border-transparent hover:border-outline-variant/20"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/50">
              <th className="p-6 font-subhead-caps text-[11px] text-outline uppercase tracking-widest">Transaction &amp; ID</th>
              <th className="p-6 font-subhead-caps text-[11px] text-outline uppercase tracking-widest">Type</th>
              <th className="p-6 font-subhead-caps text-[11px] text-outline uppercase tracking-widest">Verification</th>
              <th className="p-6 font-subhead-caps text-[11px] text-outline uppercase tracking-widest">Status</th>
              <th className="p-6 font-subhead-caps text-[11px] text-outline uppercase tracking-widest text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-on-surface-variant font-body-md">
                  No transactions match your search.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-surface-container-low transition-colors group cursor-pointer">
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="font-body-md text-sm font-bold text-primary">{tx.name}</span>
                      <span className="text-[10px] text-outline font-mono">{tx.id}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`px-2 py-1 text-[10px] font-bold ${tx.typeStyle}`}>{tx.type}</span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <span
                        className={`material-symbols-outlined text-[20px] ${
                          tx.verified ? "text-secondary" : "text-outline-variant"
                        }`}
                        style={tx.verified ? { fontVariationSettings: "'FILL' 1" } : undefined}
                      >
                        verified_user
                      </span>
                      <span className={`text-[11px] font-medium ${tx.verified ? "text-secondary" : "text-outline"}`}>
                        {tx.verifiedLabel}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${tx.statusDot}`} />
                      <span className={`text-xs font-bold ${tx.statusColor}`}>{tx.status}</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <span className={`font-body-md text-sm font-bold ${tx.amountColor}`}>{tx.amount}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-6 border-t border-outline-variant/30 flex items-center justify-between">
        <p className="text-[11px] text-outline">Showing 1 to {filtered.length} of {TRANSACTIONS.length} transactions</p>
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-surface-container-low rounded transition-all material-symbols-outlined text-primary disabled:opacity-30" disabled>
            chevron_left
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-surface text-xs font-bold">1</button>
          <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-low text-xs font-bold">2</button>
          <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-low text-xs font-bold">3</button>
          <button className="p-2 hover:bg-surface-container-low rounded transition-all material-symbols-outlined text-primary">
            chevron_right
          </button>
        </div>
      </div>
    </div>
  );
}
