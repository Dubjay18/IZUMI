export function YieldForecast() {
  return (
    <div className="glass-panel rounded-2xl p-8 border border-outline-variant/20">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-display text-[24px] font-semibold text-primary">
            Yield Forecast
          </h3>
          <p className="text-[12px] font-body font-medium text-on-surface-variant">
            Estimated earnings 2024
          </p>
        </div>
        <span className="material-symbols-outlined text-secondary">
          show_chart
        </span>
      </div>

      <div className="h-[200px] w-full relative">
        <svg
          className="w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 200 80"
        >
          <path
            className="text-secondary"
            d="M0,70 C20,65 40,75 60,50 C80,25 100,45 120,30 C140,15 160,20 180,10 L200,5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M0,70 C20,65 40,75 60,50 C80,25 100,45 120,30 C140,15 160,20 180,10 L200,5 L200,80 L0,80 Z"
            fill="url(#gradient-yield)"
            opacity="0.1"
          />
          <defs>
            <linearGradient
              id="gradient-yield"
              x1="0%"
              x2="0%"
              y1="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                style={{ stopColor: "#735c00", stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "transparent", stopOpacity: 0 }}
              />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex justify-between mt-4">
        <span className="text-[12px] font-body font-medium opacity-40">
          Q1
        </span>
        <span className="text-[12px] font-body font-medium opacity-40">
          Q2
        </span>
        <span className="text-[12px] font-body font-medium opacity-40">
          Q3
        </span>
        <span className="text-[12px] font-body font-medium opacity-40 text-secondary font-bold">
          Target
        </span>
      </div>
    </div>
  );
}
