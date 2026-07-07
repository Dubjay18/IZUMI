import { useUser } from "@/context/UserContext";
import { useBorrowerLedger } from "@/hooks/useBorrowerLedger";
import { useLoans } from "@/hooks/useLoans";

interface LiveSweepLedgerProps {
  percent: number;
}

export function LiveSweepLedger({ percent }: LiveSweepLedgerProps) {
  const { session } = useUser();
  const { activeLoan } = useLoans(session?.borrowerId);
  const { entries, loading } = useBorrowerLedger(session?.borrowerId, 10);

  // Default revenue baseline is ₦1,200,000 monthly
  const monthlyRevenue = activeLoan?.amountRequested
    ? Number(activeLoan.amountRequested)
    : 1200000;

  // Calculate daily sweep cap
  const dailySweepCap = (percent / 100) * (monthlyRevenue / 30);
  
  const formatNGN = (val: number) =>
    "₦" + val.toLocaleString("en-NG", { maximumFractionDigits: 0 });

  const hasActualData = entries && entries.length > 0;

  const displayRows = hasActualData
    ? entries.map((entry) => {
        const isDisbursement = entry.type === "DISBURSEMENT";
        return {
          timestamp: new Date(entry.createdAt).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }),
          type: isDisbursement ? "Loan Disbursement" : "Daily POS Sweep",
          typeStyle: isDisbursement 
            ? "bg-secondary-container/15 text-secondary border border-secondary/20 font-semibold"
            : "bg-primary/5 text-primary border border-primary/10",
          amount: formatNGN(entry.amount),
          id: entry.id
        };
      })
    : [
        {
          timestamp: "Today, 11:59 PM (Scheduled)",
          type: "Projected Sweep (Preview)",
          typeStyle: "bg-outline-variant/10 text-on-surface-variant border border-outline-variant/30",
          amount: formatNGN(dailySweepCap),
          id: "projected-1"
        },
        {
          timestamp: "Tomorrow, 11:59 PM (Scheduled)",
          type: "Projected Sweep (Preview)",
          typeStyle: "bg-outline-variant/10 text-on-surface-variant border border-outline-variant/30",
          amount: formatNGN(dailySweepCap),
          id: "projected-2"
        }
      ];

  return (
    <div>
      <h3 className="text-[32px] font-display font-semibold text-primary mb-[8px]">
        Live Sweep Ledger
      </h3>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-8 text-center text-on-surface-variant/60 font-body text-sm animate-pulse">
            Loading ledger entries...
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="pb-4 text-[12px] font-body font-semibold text-secondary uppercase tracking-[0.15em]">
                  Timestamp
                </th>
                <th className="pb-4 text-[12px] font-body font-semibold text-secondary uppercase tracking-[0.15em]">
                  Type
                </th>
                <th className="pb-4 text-[12px] font-body font-semibold text-secondary uppercase tracking-[0.15em] text-right">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {displayRows.map((row) => (
                <tr
                  key={row.id}
                  className="group hover:bg-surface-container-low transition-colors"
                >
                  <td className="py-4 text-[14px] font-body text-primary font-medium">
                    {row.timestamp}
                  </td>
                  <td className="py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${row.typeStyle}`}
                    >
                      {row.type}
                    </span>
                  </td>
                  <td className="py-4 text-[15px] font-body text-primary font-bold text-right font-mono">
                    {row.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
