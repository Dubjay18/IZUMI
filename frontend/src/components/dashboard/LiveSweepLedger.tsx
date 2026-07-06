import { useUser } from "@/context/UserContext";
import { useLoans } from "@/hooks/useLoans";

interface LiveSweepLedgerProps {
  percent: number;
}

export function LiveSweepLedger({ percent }: LiveSweepLedgerProps) {
  const { session } = useUser();
  const { activeLoan } = useLoans(session?.borrowerId);

  // Default revenue baseline is ₦1,200,000 monthly
  const monthlyRevenue = activeLoan?.amountRequested
    ? Number(activeLoan.amountRequested)
    : 1200000;

  // Calculate daily sweep cap
  const dailySweepCap = (percent / 100) * (monthlyRevenue / 30);
  const formattedCap = dailySweepCap.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const interestAdjustment = (dailySweepCap * 0.12).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const manualInjection = (monthlyRevenue * 0.5).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const LEDGER_ROWS = [
    {
      timestamp: "Today, 11:59 PM (Scheduled)",
      type: "Daily Principal Sweep",
      typeStyle: "bg-primary/5 text-primary border border-primary/10",
      amount: `₦${formattedCap}`,
    },
    {
      timestamp: "Yesterday, 11:59 PM",
      type: "Daily Principal Sweep",
      typeStyle: "bg-primary/5 text-primary border border-primary/10",
      amount: `₦${formattedCap}`,
    },
    {
      timestamp: "2 days ago, 11:59 PM",
      type: "Interest Adjustment",
      typeStyle: "bg-secondary-container/10 text-secondary border border-secondary/20",
      amount: `₦${interestAdjustment}`,
    },
    {
      timestamp: "3 days ago, 10:14 AM",
      type: "Manual Injection",
      typeStyle: "bg-surface-container-high text-on-surface-variant border border-outline-variant/30",
      amount: `₦${manualInjection}`,
    },
  ] as const;

  return (
    <div>
      <h3 className="text-[32px] font-display font-semibold text-primary mb-[8px]">
        Live Sweep Ledger
      </h3>

      <div className="overflow-x-auto">
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
            {LEDGER_ROWS.map((row) => (
              <tr
                key={row.timestamp}
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
      </div>
    </div>
  );
}
