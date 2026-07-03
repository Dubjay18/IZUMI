const ACTIVITIES = [
  {
    title: "Proof #4122 Verified",
    meta: "2 mins ago • Private Yield Pool",
    active: true,
  },
  {
    title: "Shield Refresh",
    meta: "14 hours ago • Daily Re-val",
    active: false,
  },
  {
    title: "New Attestation",
    meta: "Yesterday • ID Module",
    active: false,
  },
] as const;

export function ShieldActivity() {
  return (
    <div className="glass-panel p-8 rounded-xl space-y-6">
      <h2 className="text-[12px] font-body font-semibold uppercase tracking-[0.15em] text-primary">
        SHIELD ACTIVITY
      </h2>
      <div className="space-y-6">
        {ACTIVITIES.map((activity) => (
          <div
            key={activity.title}
            className="relative pl-6 border-l border-outline-variant/30"
          >
            <div
              className={`absolute -left-1 top-1 w-2 h-2 rounded-full ${
                activity.active ? "bg-surface-tint" : "bg-outline"
              }`}
            />
            <p className="text-[12px] font-body text-primary font-bold">
              {activity.title}
            </p>
            <p className="text-[12px] font-body text-on-surface-variant">
              {activity.meta}
            </p>
          </div>
        ))}
      </div>
      <button className="w-full py-2 text-[10px] font-body font-semibold uppercase tracking-[0.15em] text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/30 rounded-full">
        View Explorer
      </button>
    </div>
  );
}
