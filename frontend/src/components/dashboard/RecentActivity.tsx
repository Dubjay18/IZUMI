import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useLedger } from "@/hooks/useLedger";
import { saverApi } from "@/lib/api";

const MICRO_USDC = 1_000_000;

function formatAmount(amount: string, type: string): string {
  const usd = Number(amount) / MICRO_USDC;
  const sign = type === "WITHDRAWAL" ? "-" : "+";
  return `${sign}$${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getEntryMeta(type: string) {
  switch (type) {
    case "DEPOSIT":
      return { title: "Deposit Received", icon: "south_east", iconBg: "bg-secondary-fixed", iconColor: "text-on-secondary-fixed", amountColor: "text-primary font-bold" };
    case "YIELD":
      return { title: "Yield Credited", icon: "payments", iconBg: "bg-primary-fixed", iconColor: "text-on-primary-fixed", amountColor: "text-surface-tint font-bold" };
    case "WITHDRAWAL":
      return { title: "Withdrawal", icon: "north_west", iconBg: "bg-outline-variant", iconColor: "text-on-surface-variant", amountColor: "text-on-surface-variant" };
    default:
      return { title: type, icon: "swap_horiz", iconBg: "bg-surface-container", iconColor: "text-on-surface", amountColor: "text-on-surface" };
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

const PLACEHOLDER_ITEMS = [
  { title: "Dividend Reinvestment", time: "Today, 2:45 PM", amount: "+$12,400", amountColor: "text-primary font-bold", icon: "payments", iconBg: "bg-secondary-fixed", iconColor: "text-on-secondary-fixed" },
  { title: "Allocation Transfer", time: "Yesterday", amount: "-$50,000", amountColor: "text-on-surface-variant", icon: "swap_horiz", iconBg: "bg-primary-fixed", iconColor: "text-on-primary-fixed" },
];

export function RecentActivity() {
  const { session } = useUser();
  const { entries, loading } = useLedger(session?.userId);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const hasLiveData = entries.length > 0;

  const handleSync = async () => {
    if (!session?.userId) return;
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await saverApi.syncDeposits(session.userId);
      setSyncResult(res.message);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setSyncResult(err.message || "Sync failed.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[14px] font-body font-semibold text-primary uppercase tracking-[0.15em]">
          Recent Activity
        </h3>
        <div className="flex items-center gap-2">
          {syncResult && (
            <span className="text-[10px] text-primary/70 animate-pulse font-body truncate max-w-[120px]">
              {syncResult}
            </span>
          )}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="text-secondary text-xs hover:underline font-body flex items-center gap-1 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[14px]">sync</span>
            {syncing ? "Syncing..." : "Sync Deposits"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-full bg-surface-container-high animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 bg-surface-container-high rounded animate-pulse" />
                <div className="h-2.5 w-1/2 bg-surface-container-high rounded animate-pulse" />
              </div>
              <div className="h-3 w-16 bg-surface-container-high rounded animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {!loading && hasLiveData && (
        <div className="space-y-6">
          {entries.slice(0, 5).map((entry) => {
            const meta = getEntryMeta(entry.type);
            return (
              <div key={entry.id} className="flex gap-4">
                <div className={`w-10 h-10 rounded-full ${meta.iconBg} flex items-center justify-center shrink-0`}>
                  <span className={`material-symbols-outlined ${meta.iconColor} text-lg`}>{meta.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-body font-bold text-on-surface">{meta.title}</p>
                  <p className="text-[12px] font-body text-on-surface-variant opacity-60">{timeAgo(entry.createdAt)}</p>
                  {entry.txHash && <p className="text-[10px] font-mono text-outline truncate max-w-[120px]">{entry.txHash}</p>}
                </div>
                <p className={`ml-auto text-[12px] font-body shrink-0 ${meta.amountColor}`}>
                  {formatAmount(entry.amount, entry.type)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !hasLiveData && (
        <div className="space-y-6">
          {PLACEHOLDER_ITEMS.map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className={`w-10 h-10 rounded-full ${item.iconBg} flex items-center justify-center shrink-0`}>
                <span className={`material-symbols-outlined ${item.iconColor} text-lg`}>{item.icon}</span>
              </div>
              <div>
                <p className="text-[12px] font-body font-bold text-on-surface">{item.title}</p>
                <p className="text-[12px] font-body text-on-surface-variant opacity-60">{item.time}</p>
              </div>
              <p className={`ml-auto text-[12px] font-body ${item.amountColor}`}>{item.amount}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
