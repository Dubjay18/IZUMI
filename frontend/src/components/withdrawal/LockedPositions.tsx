const POSITIONS = [
  {
    type: "Fixed Yield",
    name: "Horizon Alpha",
    status: "Active",
    statusStyle: "bg-secondary-container text-on-secondary-container",
    fields: [
      { label: "Principal", value: "$45,000.00", valueStyle: "" },
      { label: "Maturity Date", value: "Oct 24, 2024", valueStyle: "" },
    ],
    progress: 65,
    progressColor: "bg-secondary",
    buttonLabel: "Liquidate",
    buttonIcon: "bolt",
    dark: false,
  },
  {
    type: "Private Equity",
    name: "Nippon Tech IV",
    status: "Locked",
    statusStyle: "bg-tertiary-container text-tertiary-fixed",
    fields: [
      { label: "Committed", value: "$120,000.00", valueStyle: "" },
      { label: "Penalty Fee", value: "2.5% Premium", valueStyle: "text-error" },
    ],
    progress: 20,
    progressColor: "bg-secondary-fixed",
    buttonLabel: "Liquidate with Penalty",
    buttonIcon: null,
    dark: true,
  },
  {
    type: "Sovereign Bonds",
    name: "Emerald Reserve",
    status: "Active",
    statusStyle: "bg-secondary-container text-on-secondary-container",
    fields: [
      { label: "Principal", value: "$28,500.00", valueStyle: "" },
      { label: "Maturity Date", value: "Jan 12, 2025", valueStyle: "" },
    ],
    progress: 88,
    progressColor: "bg-secondary",
    buttonLabel: "Liquidate",
    buttonIcon: "bolt",
    dark: false,
  },
] as const;

function PositionCard({
  position,
}: {
  position: (typeof POSITIONS)[number];
}) {
  if (position.dark) {
    return (
      <div className="bg-tertiary text-on-tertiary p-8 rounded-xl border border-tertiary-container shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <span className="text-[14px] font-body font-semibold uppercase tracking-[0.15em] text-secondary-fixed block mb-1">
                {position.type}
              </span>
              <h4 className="text-[24px] font-display font-bold text-surface-container-lowest">
                {position.name}
              </h4>
            </div>
            <div className={`${position.statusStyle} px-3 py-1 rounded-full text-xs font-bold`}>
              {position.status}
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {position.fields.map((field) => (
              <div key={field.label} className="flex justify-between">
                <span className="text-on-tertiary-container text-[12px] font-body font-medium">
                  {field.label}
                </span>
                <span className={`font-bold text-white ${field.valueStyle ?? ""}`}>
                  {field.value}
                </span>
              </div>
            ))}
            <div className="w-full bg-tertiary-container h-1 rounded-full overflow-hidden">
              <div
                className={`${position.progressColor} h-full`}
                style={{ width: `${position.progress}%` }}
              />
            </div>
          </div>

          <button className="w-full py-3 bg-secondary text-white text-[12px] font-body font-medium rounded-lg hover:shadow-[0_0_15px_rgba(254,214,91,0.3)] transition-all flex items-center justify-center gap-2 active:scale-95">
            {position.buttonLabel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-8 rounded-xl border border-outline-variant hover:border-secondary transition-all group">
      <div className="flex justify-between items-start mb-8">
        <div>
          <span className="text-[14px] font-body font-semibold uppercase tracking-[0.15em] text-secondary block mb-1">
            {position.type}
          </span>
          <h4 className="text-[24px] font-display font-bold">{position.name}</h4>
        </div>
        <div className={`${position.statusStyle} px-3 py-1 rounded-full text-xs font-bold`}>
          {position.status}
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {position.fields.map((field) => (
          <div key={field.label} className="flex justify-between">
            <span className="text-on-surface-variant text-[12px] font-body font-medium">
              {field.label}
            </span>
            <span className={`font-bold ${field.valueStyle ?? ""}`}>
              {field.value}
            </span>
          </div>
        ))}
        <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
          <div
            className={`${position.progressColor} h-full`}
            style={{ width: `${position.progress}%` }}
          />
        </div>
      </div>

      <button className="w-full py-3 bg-primary text-on-primary text-[12px] font-body font-medium rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-95">
        {position.buttonLabel}
        {position.buttonIcon && (
          <span className="material-symbols-outlined text-sm">
            {position.buttonIcon}
          </span>
        )}
      </button>
    </div>
  );
}

export function LockedPositions() {
  return (
    <section className="mb-[80px]">
      <div className="flex items-center justify-between mb-[24px]">
        <h3 className="text-[32px] font-display font-semibold text-primary">
          Locked Positions
        </h3>
        <button className="flex items-center gap-2 text-secondary text-[12px] font-body font-medium hover:underline">
          View Maturity Schedule
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
        {POSITIONS.map((position) => (
          <PositionCard key={position.name} position={position} />
        ))}
      </div>
    </section>
  );
}
