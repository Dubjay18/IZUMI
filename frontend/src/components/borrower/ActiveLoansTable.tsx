import { useUser } from "@/context/UserContext";
import { useLoans } from "@/hooks/useLoans";
import type { LoanApplication } from "@/lib/types";

function formatUSD(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-secondary/10 text-secondary",
  DISBURSED: "bg-secondary/10 text-secondary",
  AI_ASSESSED: "bg-primary-fixed/30 text-on-primary-fixed-variant",
  APPROVED: "bg-primary-fixed/30 text-on-primary-fixed-variant",
  PENDING: "bg-surface-container-highest text-on-surface-variant",
  REPAID: "bg-green-50 text-green-700",
  DEFAULTED: "bg-error-container text-error",
  REJECTED: "bg-error-container text-error",
};

const ASSET_ICONS: Record<string, string> = {
  "PE": "account_balance",
  "RE": "apartment",
  "COMM": "water_drop",
  "DEBT": "energy_savings_leaf",
  default: "request_quote",
};

function loanIcon(loan: LoanApplication): string {
  const sector = loan.borrowerId.slice(0, 2).toUpperCase();
  return ASSET_ICONS[sector] ?? ASSET_ICONS.default;
}

function repaymentProgress(loan: LoanApplication): string {
  const total = Number(loan.amountApproved ?? loan.amountRequested);
  if (total === 0) return "0%";
  const repaid = Number(loan.amountRepaid);
  return Math.round((repaid / total) * 100) + "%";
}

export function ActiveLoansTable() {
  const { session } = useUser();
  const { loans } = useLoans(session?.borrowerId);

  const activeLoans = loans.filter(
    (l) => l.status !== "REJECTED" && l.status !== "PENDING"
  );

  return (
    <section className="glass-panel rounded-xl p-8 overflow-x-auto">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-headline-md text-headline-md text-primary">Active Loans</h3>
        <button className="text-secondary font-bold font-subhead-caps text-label-sm tracking-widest hover:underline">
          VIEW FULL LEDGER
        </button>
      </div>

      {activeLoans.length === 0 ? (
        <p className="text-on-surface-variant font-body-md text-center py-12">
          No loan applications yet. Apply for your first credit facility.
        </p>
      ) : (
        <table className="w-full border-separate border-spacing-y-4">
          <thead>
            <tr className="text-left text-on-surface-variant font-subhead-caps text-subhead-caps tracking-widest uppercase border-b border-outline-variant">
              <th className="pb-4 font-semibold">Loan</th>
              <th className="pb-4 font-semibold">Amount</th>
              <th className="pb-4 font-semibold">Rate</th>
              <th className="pb-4 font-semibold">Term</th>
              <th className="pb-4 font-semibold">Progress</th>
              <th className="pb-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {activeLoans.map((loan) => {
              const total = Number(loan.amountApproved ?? loan.amountRequested);
              const rate = Number(loan.interestRate ?? 0);
              return (
                <tr key={loan.id} className="group cursor-pointer">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary-fixed-dim text-[18px]">
                          {loanIcon(loan)}
                        </span>
                      </div>
                      <span className="font-bold text-primary text-[14px]">
                        {loan.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-bold text-primary">{formatUSD(total)}</td>
                  <td className="py-4 px-4 text-on-surface-variant">{rate}%</td>
                  <td className="py-4 px-4 text-on-surface-variant">{loan.termDays}d</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full"
                          style={{ width: repaymentProgress(loan) }}
                        />
                      </div>
                      <span className="text-label-sm font-bold text-on-surface-variant">
                        {repaymentProgress(loan)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 pl-4 text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-label-sm font-bold ${
                        STATUS_STYLES[loan.status] ?? "bg-surface-container-highest text-on-surface-variant"
                      }`}
                    >
                      {loan.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
