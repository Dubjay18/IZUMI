interface AccountHealthCardProps {
  score?: number;
  description?: string;
}

export function AccountHealthCard({ score = 99.8, description }: AccountHealthCardProps) {
  return (
    <div className="bg-primary p-8 shadow-2xl relative overflow-hidden rounded-xl">
      <div className="absolute -right-10 -bottom-10 w-40 h-40 border border-secondary/20 rounded-full" />
      <p className="font-subhead-caps text-[12px] text-secondary-fixed-dim uppercase tracking-[0.2em] mb-4">
        Account Health
      </p>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-surface text-3xl font-display-lg font-bold">{score}</span>
        <span className="text-secondary-fixed text-lg font-body-md">%</span>
      </div>
      <p className="text-surface-container-highest/60 text-xs">
        {description ?? "Verification trust score is optimized for high-velocity liquidity Split repayments."}
      </p>
    </div>
  );
}
