export function PrivacyScore() {
  return (
    <div className="glass-panel p-8 rounded-xl space-y-4">
      <div className="flex justify-between items-end">
        <h2 className="text-[12px] font-body font-semibold uppercase tracking-[0.15em] text-primary">
          PRIVACY SCORE
        </h2>
        <span className="text-[32px] font-display font-bold text-primary leading-none">
          98
        </span>
      </div>
      <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
        <div className="h-full bg-surface-tint w-[98%]" />
      </div>
      <p className="text-[12px] font-body text-on-surface-variant">
        Excellent. Your identity remains perfectly decoupled from transaction
        history.
      </p>
    </div>
  );
}
