const LEDGER_ROWS = [
  {
    timestamp: "Today, 09:12 AM",
    type: "Daily Principal Sweep",
    typeStyle:
      "bg-primary/5 text-primary border border-primary/10",
    amount: "₦250,000.00",
  },
  {
    timestamp: "Yesterday, 11:45 PM",
    type: "Interest Adjustment",
    typeStyle:
      "bg-secondary-container/10 text-secondary border border-secondary/20",
    amount: "₦42,108.45",
  },
  {
    timestamp: "May 21, 2024",
    type: "Daily Principal Sweep",
    typeStyle:
      "bg-primary/5 text-primary border border-primary/10",
    amount: "₦250,000.00",
  },
  {
    timestamp: "May 20, 2024",
    type: "Manual Injection",
    typeStyle:
      "bg-surface-container-high text-on-surface-variant",
    amount: "₦1,500,000.00",
  },
] as const;

export function LiveSweepLedger() {
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
                key={row.timestamp + row.amount}
                className="group hover:bg-surface-container-low transition-colors"
              >
                <td className="py-4 text-[16px] font-body text-primary">
                  {row.timestamp}
                </td>
                <td className="py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${row.typeStyle}`}
                  >
                    {row.type}
                  </span>
                </td>
                <td className="py-4 text-[16px] font-body text-primary font-bold text-right">
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
