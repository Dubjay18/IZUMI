interface DurationCardProps {
  label: string;
  duration: string;
  apy: string;
  maturityDate: string;
  active: boolean;
  onClick: () => void;
}

export function DurationCard({
  label,
  duration,
  apy,
  maturityDate,
  active,
  onClick,
}: DurationCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-8 rounded-xl glass-panel transition-all duration-300 hover:shadow-lg group ${
        active
          ? "active-card border-secondary bg-white shadow-[0_10px_30px_-10px_rgba(115,92,0,0.1)]"
          : "ghost-border"
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[14px] font-body font-semibold tracking-[0.15em] text-on-surface-variant block mb-1 uppercase">
            {label}
          </span>
          <h4 className="text-[32px] font-display font-semibold text-primary leading-[1.3]">
            {duration}
          </h4>
        </div>
        <div className="text-right">
          <span className="text-[32px] font-display font-semibold text-secondary leading-[1.3]">
            {apy}
          </span>
          <span className="text-[12px] font-body font-medium text-on-surface-variant block">
            ANNUALIZED APY
          </span>
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-outline-variant/30 flex justify-between items-center">
        <span className="text-[16px] font-body text-on-surface-variant leading-[1.6]">
          Maturity: {maturityDate}
        </span>
        <span
          className={`material-symbols-outlined text-secondary transition-opacity duration-300 ${
            active ? "opacity-100" : "opacity-0"
          }`}
        >
          check_circle
        </span>
      </div>
    </button>
  );
}
