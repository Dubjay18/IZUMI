const SESSIONS = [
  {
    device: "MacBook Pro (Sonoma)",
    ip: "192.168.1.1",
    icon: "laptop_mac",
    iconColor: "text-primary",
    location: "Zurich, Switzerland",
    status: "Current" as const,
    statusStyle: "bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-500",
    time: "Active Now",
  },
  {
    device: "iPhone 15 Pro Max",
    ip: "45.23.11.89",
    icon: "smartphone",
    iconColor: "text-on-surface-variant",
    location: "London, United Kingdom",
    status: "Trusted" as const,
    statusStyle: "bg-surface-container-highest text-on-surface-variant",
    dot: "bg-on-surface-variant",
    time: "2 hours ago",
  },
  {
    device: "Bloomberg Terminal",
    ip: "82.112.4.5",
    icon: "desktop_windows",
    iconColor: "text-on-surface-variant",
    location: "New York, USA",
    status: "Expired" as const,
    statusStyle: "bg-surface-container-highest text-on-surface-variant",
    dot: "bg-on-surface-variant",
    time: "Jul 1, 2026",
  },
];

export function SessionHistoryTable() {
  return (
    <div className="glass-panel p-8 md:p-12 rounded-3xl">
      <h2 className="font-headline-md text-headline-md text-primary mb-6">Security Access Ledger</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant">
              <th className="pb-4 font-subhead-caps text-subhead-caps text-on-surface-variant uppercase">Device / IP</th>
              <th className="pb-4 font-subhead-caps text-subhead-caps text-on-surface-variant uppercase">Location</th>
              <th className="pb-4 font-subhead-caps text-subhead-caps text-on-surface-variant uppercase">Status</th>
              <th className="pb-4 font-subhead-caps text-subhead-caps text-on-surface-variant uppercase text-right">Last Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {SESSIONS.map((s) => (
              <tr key={s.device} className="group hover:bg-surface-container-low/50 transition-colors">
                <td className="py-6">
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${s.iconColor}`}>{s.icon}</span>
                    <div>
                      <p className="font-body-md font-semibold text-primary">{s.device}</p>
                      <p className="text-label-sm text-on-surface-variant">{s.ip}</p>
                    </div>
                  </div>
                </td>
                <td className="py-6 font-body-md">{s.location}</td>
                <td className="py-6">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.statusStyle}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {s.status}
                  </span>
                </td>
                <td className="py-6 font-body-md text-right text-on-surface-variant">{s.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="mt-8 text-secondary font-body-md font-semibold hover:underline flex items-center gap-2">
        <span>View All Session History</span>
        <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
    </div>
  );
}
