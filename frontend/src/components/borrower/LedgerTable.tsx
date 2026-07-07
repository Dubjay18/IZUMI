const FILTERS = [
  { key: "all", label: "All History" },
  { key: "repayments", label: "Repayments" },
  { key: "disbursements", label: "Disbursements" },
];

type FilterKey = "all" | "repayments" | "disbursements";

function formatAmount(amount: number, type: string): { display: string; color: string } {
  const formatted = amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (type === "DISBURSEMENT") {
    return { display: `+₦${formatted}`, color: "text-[#1b5e20]" };
  }
  return { display: `-₦${formatted}`, color: "text-primary" };
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function VerificationBadge({ v }: { v: "ZK-VERIFIED" | "STANDARD" | "AUTO" }) {
  const isZk = v === "ZK-VERIFIED";
  return (
    <div className="flex items-center gap-2">
      <span
        className={`material-symbols-outlined text-[20px] ${isZk ? "text-secondary" : "text-outline-variant"}`}
        style={isZk ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        verified_user
      </span>
      <span className="text-[11px] font-medium text-outline">{v}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isCompleted = status.toLowerCase() === "completed";
  const isPending = status.toLowerCase() === "pending";
  const dotColor = isCompleted ? "bg-[#1b5e20]" : isPending ? "bg-secondary animate-pulse" : "bg-error";
  const textColor = isCompleted ? "text-[#1b5e20]" : isPending ? "text-secondary" : "text-error";
  
  return (
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span className={`text-xs font-bold ${textColor}`}>{status}</span>
    </div>
  );
}

interface LedgerTableProps {
  entries: any[];
  pagination: any;
  loading: boolean;
  setPage: (page: number) => void;
  setFilter: (filter?: string) => void;
  setSearch: (search: string) => void;
  page: number;
  filter?: string;
  search: string;
}

export function LedgerTable({
  entries,
  pagination,
  loading,
  setPage,
  setFilter,
  setSearch,
  page,
  filter,
  search,
}: LedgerTableProps) {
  const activeFilter: FilterKey = (filter?.toLowerCase() === "repayment" ? "repayments" : filter?.toLowerCase() === "disbursement" ? "disbursements" : "all") as FilterKey;

  function handleFilterChange(key: FilterKey) {
    if (key === "all") {
      setFilter(undefined);
    } else if (key === "repayments") {
      setFilter("REPAYMENT");
    } else {
      setFilter("DISBURSEMENT");
    }
  }

  const fromEntry = pagination?.total === 0 ? 0 : (page - 1) * (pagination?.limit ?? 20) + 1;
  const toEntry = Math.min(page * (pagination?.limit ?? 20), pagination?.total ?? 0);

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
              onClick={() => handleFilterChange(f.key as FilterKey)}
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
            {loading && entries.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="p-12 space-y-4 animate-pulse">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-4 items-center">
                        <div className="h-4 w-28 bg-surface-container-high rounded" />
                        <div className="h-4 w-16 bg-surface-container-high rounded" />
                        <div className="h-4 w-24 bg-surface-container-high rounded" />
                        <div className="h-4 w-14 bg-surface-container-high rounded" />
                        <div className="h-4 w-12 bg-surface-container-high rounded ml-auto" />
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-on-surface-variant font-body-md">
                  No transactions found.
                </td>
              </tr>
            ) : (
              entries.map((tx) => {
                const fmt = formatAmount(tx.amount, tx.type);
                const verificationType = tx.type === "REPAYMENT" ? "ZK-VERIFIED" : "STANDARD";
                return (
                  <tr key={tx.id} className="hover:bg-surface-container-low transition-colors group cursor-pointer">
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="font-body-md text-sm font-bold text-primary">{tx.name}</span>
                        <span className="text-[10px] text-outline font-mono mt-0.5">
                          {fmtDate(tx.createdAt)} &middot; {tx.reference.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="px-2 py-1 text-[10px] font-bold bg-surface-container-high text-on-surface-variant tracking-wider">
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-6">
                      <VerificationBadge v={verificationType} />
                    </td>
                    <td className="p-6">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="p-6 text-right">
                      <span className={`font-body-md text-sm font-bold ${fmt.color}`}>{fmt.display}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="p-6 border-t border-outline-variant/30 flex items-center justify-between">
          <p className="text-[11px] text-outline">
            Showing {fromEntry} to {toEntry} of {pagination.total} transactions
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage(page - 1)}
              className="p-2 hover:bg-surface-container-low rounded transition-all material-symbols-outlined text-primary disabled:opacity-30 disabled:cursor-not-allowed"
            >
              chevron_left
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, page - 2), Math.min(pagination.totalPages, page + 1))
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold ${
                    p === page ? "bg-primary text-surface" : "hover:bg-surface-container-low"
                  }`}
                >
                  {p}
                </button>
              ))}
            <button
              disabled={page >= pagination.totalPages || loading}
              onClick={() => setPage(page + 1)}
              className="p-2 hover:bg-surface-container-low rounded transition-all material-symbols-outlined text-primary disabled:opacity-30 disabled:cursor-not-allowed"
            >
              chevron_right
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
