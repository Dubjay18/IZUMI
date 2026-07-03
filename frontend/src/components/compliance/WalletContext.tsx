export function WalletContext() {
  return (
    <div className="glass-panel p-8 rounded-xl space-y-6">
      <h2 className="text-[12px] font-body font-semibold uppercase tracking-[0.15em] text-primary">
        WALLET CONTEXT
      </h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-on-surface-variant text-[12px] font-body font-medium">
            Network
          </span>
          <span className="font-body text-primary font-semibold">
            Mainnet ZK-EVM
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-on-surface-variant text-[12px] font-body font-medium">
            Status
          </span>
          <span className="flex items-center gap-1.5 text-surface-tint font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-surface-tint" />
            Secured
          </span>
        </div>
        <div className="pt-4 border-t border-outline-variant/30">
          <p className="text-[12px] font-body text-on-surface-variant leading-relaxed">
            Your identity is encrypted using Izumi&apos;s fountain-flow
            protocol, ensuring zero-knowledge leakage during the compliance
            handshake.
          </p>
        </div>
      </div>
    </div>
  );
}
