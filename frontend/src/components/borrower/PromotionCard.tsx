export function PromotionCard() {
  return (
    <div className="bg-primary-container rounded-xl p-6 relative overflow-hidden group cursor-pointer">
      <div className="relative z-10">
        <span className="inline-block px-2 py-1 bg-secondary text-on-secondary text-[10px] font-subhead-caps rounded-sm mb-4">
          EXCLUSIVE OFFER
        </span>
        <h4 className="font-headline-md text-lg text-primary-fixed leading-tight mb-2">
          Zero-fee working capital up to $1M
        </h4>
        <p className="text-on-primary-container text-xs opacity-80 mb-4 font-body-md">
          Based on your stellar credit health, you've been pre-selected.
        </p>
        <div className="flex items-center text-secondary font-bold text-xs gap-2">
          Claim offer
          <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
            arrow_forward
          </span>
        </div>
      </div>
      <div className="absolute right-[-20px] bottom-[-20px] opacity-10 transform group-hover:scale-110 transition-transform">
        <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" as string }}>
          stars
        </span>
      </div>
    </div>
  );
}
