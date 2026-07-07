import { useUser } from "@/context/UserContext";
import { useLoans } from "@/hooks/useLoans";

export function InventoryTips() {
  const { session } = useUser();
  const { activeLoan, loading } = useLoans(session?.borrowerId);

  const rawTips = (activeLoan?.aiAnalysis as any)?.businessTips;
  const hasTips = Array.isArray(rawTips) && rawTips.length > 0;

  const tipsList = hasTips
    ? rawTips.slice(0, 3).map((tip: string, index: number) => ({
        title: index === 0 ? "AI Advisor Recommendation" : `Strategy Option #${index + 1}`,
        desc: tip,
        icon: index % 2 === 0 ? "trending_up" : "payments",
        iconClass: index % 2 === 0 ? "bg-secondary/10 text-secondary" : "bg-on-primary-container/10 text-on-primary-container"
      }))
    : [
        {
          title: "Buy Ahead Signal",
          desc: "Cashflow patterns suggest a 15% increase in demand for Q4. Restock inventory by Sept 15.",
          icon: "trending_up",
          iconClass: "bg-secondary/10 text-secondary"
        },
        {
          title: "Optimize Terms",
          desc: "Maintain your healthy POS transaction logs to unlock lower interest tier rates next cycle.",
          icon: "payments",
          iconClass: "bg-on-primary-container/10 text-on-primary-container"
        }
      ];

  return (
    <div className="glass-panel p-6 rounded-xl shadow-sm flex-1">
      <h3 className="font-subhead-caps text-xs text-on-surface-variant uppercase tracking-widest mb-6">
        Inventory Planning
      </h3>

      {loading ? (
        <div className="py-4 text-center text-xs text-on-surface-variant animate-pulse font-body-md">
          Decrypting AI assessments...
        </div>
      ) : (
        <div className="space-y-6">
          {tipsList.map((tip, idx) => (
            <div key={idx} className="flex gap-4">
              <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${tip.iconClass}`}>
                <span className="material-symbols-outlined">{tip.icon}</span>
              </div>
              <div>
                <h4 className="font-body-md font-bold text-sm text-primary">{tip.title}</h4>
                <p className="text-xs text-on-surface-variant font-body-md mt-1 leading-relaxed">
                  {tip.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
