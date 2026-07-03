export function BentoInfoCards() {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="glass-panel p-6 rounded-xl border-l-4 border-l-secondary-container">
        <h3 className="text-[12px] font-body font-semibold uppercase tracking-[0.15em] text-primary mb-2">
          PRIVACY GUARANTEE
        </h3>
        <p className="font-body text-on-surface-variant leading-relaxed">
          Your documents never leave your local machine. Only the cryptographic
          proof is transmitted.
        </p>
      </div>
      <div className="glass-panel p-6 rounded-xl">
        <h3 className="text-[12px] font-body font-semibold uppercase tracking-[0.15em] text-primary mb-2">
          SYSTEM AUDIT
        </h3>
        <p className="font-body text-on-surface-variant leading-relaxed">
          ZK-Shield protocol has been formally verified and audited by
          Quantstamp &amp; Trail of Bits.
        </p>
      </div>
    </div>
  );
}
