export function CreditHealthGauge() {
  return (
    <div className="glass-panel p-6 rounded-xl shadow-sm relative overflow-hidden">
      <div className="relative z-10">
        <h3 className="font-subhead-caps text-xs text-on-surface-variant uppercase tracking-widest mb-6">
          Credit Health Score
        </h3>

        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle
                className="text-surface-container-highest"
                cx="80"
                cy="80"
                fill="transparent"
                r="70"
                stroke="currentColor"
                strokeWidth="8"
              />
              <circle
                className="text-primary transition-all duration-1000 ease-out"
                cx="80"
                cy="80"
                fill="transparent"
                r="70"
                stroke="currentColor"
                strokeDasharray="440"
                strokeDashoffset="88"
                strokeWidth="8"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-display-lg text-primary">824</span>
              <span className="text-[10px] font-subhead-caps text-secondary uppercase tracking-[0.2em] mt-1">
                Excellent
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-on-surface-variant font-body-md">Payment History</span>
            <span className="text-primary font-bold">100%</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-on-surface-variant font-body-md">Credit Utilization</span>
            <span className="text-primary font-bold">14%</span>
          </div>
        </div>
      </div>

      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-primary/5 rounded-full blur-xl" />
    </div>
  );
}
