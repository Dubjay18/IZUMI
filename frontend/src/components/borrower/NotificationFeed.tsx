const NOTIFICATIONS = [
  {
    dot: "bg-secondary",
    title: "Large Withdrawal Detected",
    description: "A withdrawal of $24,500.00 was processed to Account **4921.",
    time: "2 MINUTES AGO",
  },
  {
    dot: "bg-secondary",
    title: "ZK-Verification Successful",
    description: "Daily Split repayment #882-X verified on-chain via ZK-Proof.",
    time: "1 HOUR AGO",
  },
  {
    dot: "bg-outline-variant",
    title: "Portfolio Rebalanced",
    description: "Asset allocation updated according to Q3 strategy.",
    time: "4 HOURS AGO",
  },
];

export function NotificationFeed() {
  return (
    <div className="glass-panel p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline-md text-[20px] font-bold text-primary">Notifications</h3>
        <span className="bg-secondary-container text-on-secondary-container text-[10px] px-2 py-0.5 rounded-full font-bold">
          4 NEW
        </span>
      </div>
      <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
        {NOTIFICATIONS.map((n) => (
          <div
            key={n.title}
            className="group p-4 border-b border-outline-variant/30 hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <div className="flex gap-3">
              <div className={`mt-1 w-2 h-2 rounded-full ${n.dot} shrink-0`} />
              <div>
                <p className="font-body-md text-sm font-bold text-primary">{n.title}</p>
                <p className="text-on-surface-variant text-xs mt-1">{n.description}</p>
                <p className="text-[10px] text-outline mt-2">{n.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-6 py-3 text-center border-t border-outline-variant/50 text-secondary font-label-sm text-label-sm hover:underline">
        View All Notifications
      </button>
    </div>
  );
}
