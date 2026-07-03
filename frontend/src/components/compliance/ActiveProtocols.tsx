const PROTOCOLS = [
  {
    icon: "verified_user",
    name: "ZK-ID Shield v2.4",
    description: "Validated by Izumi Oracle",
  },
  {
    icon: "lock",
    name: "AML Silence Engine",
    description: "Non-custodial screening",
  },
] as const;

export function ActiveProtocols() {
  return (
    <div className="glass-panel p-8 rounded-xl space-y-6">
      <h2 className="text-[12px] font-body font-semibold uppercase tracking-[0.15em] text-primary">
        ACTIVE PROTOCOLS
      </h2>
      <ul className="space-y-4">
        {PROTOCOLS.map((protocol) => (
          <li key={protocol.name} className="flex items-start gap-3">
            <span className="material-symbols-outlined text-surface-tint mt-0.5">
              {protocol.icon}
            </span>
            <div>
              <p className="text-[12px] font-body font-bold text-primary">
                {protocol.name}
              </p>
              <p className="text-[12px] font-body text-on-surface-variant">
                {protocol.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
