export function InventoryTips() {
  return (
    <div className="glass-panel p-6 rounded-xl shadow-sm flex-1">
      <h3 className="font-subhead-caps text-xs text-on-surface-variant uppercase tracking-widest mb-6">
        Inventory Planning
      </h3>

      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="w-10 h-10 shrink-0 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined">trending_up</span>
          </div>
          <div>
            <h4 className="font-body-md font-bold text-sm text-primary">Buy Ahead Signal</h4>
            <p className="text-xs text-on-surface-variant font-body-md mt-1">
              Cashflow patterns suggest a 15% increase in demand for Q4. Consider restocking by Sept 15.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-10 h-10 shrink-0 rounded-lg bg-on-primary-container/10 flex items-center justify-center text-on-primary-container">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <div>
            <h4 className="font-body-md font-bold text-sm text-primary">Optimize Terms</h4>
            <p className="text-xs text-on-surface-variant font-body-md mt-1">
              Your high credit score qualifies you for 'Pay Later' extensions with major suppliers.
            </p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-primary text-on-primary rounded-lg text-center cursor-pointer hover:bg-primary-container hover:text-on-primary-container transition-all">
          <span className="font-subhead-caps text-xs uppercase tracking-[0.2em]">View Full Report</span>
        </div>
      </div>
    </div>
  );
}
