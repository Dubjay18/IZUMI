const ACTIVITY_ITEMS = [
  {
    title: "Dividend Reinvestment",
    time: "Today, 2:45 PM",
    amount: "+$12,400",
    amountColor: "text-primary font-bold",
    icon: "payments",
    iconBg: "bg-secondary-fixed",
    iconColor: "text-on-secondary-fixed",
  },
  {
    title: "Allocation Transfer",
    time: "Yesterday",
    amount: "-$50,000",
    amountColor: "text-on-surface-variant",
    icon: "swap_horiz",
    iconBg: "bg-primary-fixed",
    iconColor: "text-on-primary-fixed",
  },
] as const;

export function RecentActivity() {
  return (
    <div className="glass-panel rounded-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[14px] font-body font-semibold text-primary uppercase tracking-[0.15em]">
          Recent Activity
        </h3>
        <button className="text-secondary text-xs hover:underline font-body">
          View All
        </button>
      </div>
      <div className="space-y-6">
        {ACTIVITY_ITEMS.map((item) => (
          <div key={item.title} className="flex gap-4">
            <div
              className={`w-10 h-10 rounded-full ${item.iconBg} flex items-center justify-center shrink-0`}
            >
              <span
                className={`material-symbols-outlined ${item.iconColor} text-lg`}
              >
                {item.icon}
              </span>
            </div>
            <div>
              <p className="text-[12px] font-body font-bold text-on-surface">
                {item.title}
              </p>
              <p className="text-[12px] font-body text-on-surface-variant opacity-60">
                {item.time}
              </p>
            </div>
            <p
              className={`ml-auto text-[12px] font-body ${item.amountColor}`}
            >
              {item.amount}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
