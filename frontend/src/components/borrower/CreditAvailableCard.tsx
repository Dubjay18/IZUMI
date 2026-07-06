import { useUser } from "@/context/UserContext";
import { useLoans } from "@/hooks/useLoans";
import { useNavigate } from "react-router-dom";
import type { LoanApplication } from "@/lib/types";

function totalApproved(loans: LoanApplication[]): number {
  return loans
    .filter((l) => l.status === "ACTIVE" || l.status === "DISBURSED" || l.status === "AI_ASSESSED")
    .reduce((sum, l) => sum + Number(l.amountApproved ?? l.amountRequested), 0);
}

function formatUSD(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const DEFAULT_CREDIT_LIMIT = 5_000_000;

export function CreditAvailableCard() {
  const { session } = useUser();
  const { loans } = useLoans(session?.borrowerId);
  const navigate = useNavigate();

  const used = totalApproved(loans);
  const limit = DEFAULT_CREDIT_LIMIT;
  const available = Math.max(limit - used, 0);
  const pctUsed = Math.round((used / limit) * 100);

  return (
    <div className="glass-panel rounded-xl p-8 flex-1 border-dashed border-2 border-outline-variant hover:border-secondary transition-colors cursor-pointer group">
      <div className="flex flex-col h-full justify-between">
        <p className="font-subhead-caps text-subhead-caps text-on-surface-variant tracking-[0.1em]">
          AVAILABLE CREDIT
        </p>
        <div className="my-4">
          <h4 className="text-3xl font-display-lg text-primary">
            {formatUSD(available)}
          </h4>
          <p className="text-secondary text-label-sm font-bold">READY FOR DRAWDOWN</p>
          {/* Usage bar */}
          <div className="mt-4 w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full transition-all"
              style={{ width: `${Math.min(pctUsed, 100)}%` }}
            />
          </div>
          <p className="text-label-sm text-on-surface-variant mt-2">
            {pctUsed}% of ${formatUSD(limit)} limit utilized
          </p>
        </div>
        <button
          onClick={() => navigate("/borrow/apply")}
          className="w-full py-4 border border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 rounded-xl"
        >
          Apply for New Loan <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
