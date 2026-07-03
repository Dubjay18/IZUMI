export function ExposureHero() {
  return (
    <section className="mb-[80px] flex flex-col md:flex-row justify-between items-end">
      <div>
        <p className="text-[14px] font-body font-semibold uppercase tracking-[0.15em] text-secondary mb-2">
          Total Exposure
        </p>
        <h2 className="text-[56px] font-display font-bold text-primary leading-[1.1] tracking-[-0.02em]">
          ₦142,850,000.00
        </h2>
        <div className="flex items-center gap-2 mt-4">
          <span className="px-3 py-1 bg-secondary-container/20 text-on-secondary-container rounded-full text-[12px] font-body font-medium">
            8.4% APR
          </span>
          <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-[12px] font-body font-medium">
            Matures Oct 2026
          </span>
        </div>
      </div>
      <div className="hidden md:block text-right mt-6 md:mt-0">
        <p className="text-[12px] font-body text-on-surface-variant italic mb-1">
          Next Sweep Scheduled
        </p>
        <p className="text-[18px] font-body font-bold text-primary">
          In 4 hours, 12 minutes
        </p>
      </div>
    </section>
  );
}
