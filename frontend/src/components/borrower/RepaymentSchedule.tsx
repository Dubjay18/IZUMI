import { useUser } from "@/context/UserContext";
import { useLoans } from "@/hooks/useLoans";
import type { LoanApplication } from "@/lib/types";

function formatUSD(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buildSchedule(loans: LoanApplication[]) {
  return loans
    .filter((l) => l.status === "ACTIVE" || l.status === "DISBURSED")
    .flatMap((loan) => {
      const principal = Number(loan.amountApproved ?? loan.amountRequested);
      const rate = Number(loan.interestRate ?? 0) / 100;
      const months = Math.max(Math.ceil(loan.termDays / 30), 1);
      const installment = (principal * (1 + rate)) / months;
      const repaid = Number(loan.amountRepaid);
      const paidMonths = Math.min(Math.floor(repaid / installment), months);

      return Array.from({ length: months }, (_, i) => {
        const dueDate = new Date(loan.createdAt);
        dueDate.setMonth(dueDate.getMonth() + i + 1);
        const isPaid = i < paidMonths;
        const isOverdue = !isPaid && dueDate.getTime() < Date.now();
        return {
          id: `${loan.id}-${i}`,
          loanLabel: `Loan #${loan.id.slice(0, 8)}`,
          installment: i + 1,
          total: months,
          amount: installment,
          dueDate,
          isPaid,
          isOverdue,
        };
      });
    })
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 8);
}

export function RepaymentSchedule() {
  const { session } = useUser();
  const { loans } = useLoans(session?.borrowerId);
  const schedule = buildSchedule(loans);

  return (
    <section className="glass-panel rounded-xl p-8 overflow-hidden min-h-[400px]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-headline-md text-headline-md text-primary">Repayment Schedule</h3>
          <p className="text-on-surface-variant font-body-md">Upcoming installment milestones</p>
        </div>
        <span className="material-symbols-outlined text-primary text-3xl">event_note</span>
      </div>

      <div className="space-y-4">
        {schedule.length === 0 && (
          <p className="text-on-surface-variant font-body-md text-center py-12">
            No active loans with scheduled repayments yet.
          </p>
        )}
        {schedule.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  item.isPaid ? "bg-green-500" : item.isOverdue ? "bg-error" : "bg-secondary"
                }`}
              />
              <div>
                <p className="text-label-sm font-bold text-primary">
                  Installment {item.installment}/{item.total}
                </p>
                <p className="text-label-sm text-on-surface-variant">
                  {item.loanLabel} &middot; {item.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-label-sm font-bold text-primary">{formatUSD(item.amount)}</p>
              <span
                className={`text-[11px] font-bold ${
                  item.isPaid ? "text-green-600" : item.isOverdue ? "text-error" : "text-secondary"
                }`}
              >
                {item.isPaid ? "Paid" : item.isOverdue ? "Overdue" : "Upcoming"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between">
        <div className="text-center px-4 border-r border-outline-variant">
          <p className="text-label-sm text-outline font-subhead-caps">LOANS</p>
          <p className="font-bold text-primary">{schedule.length > 0 ? new Set(schedule.map((s) => s.loanLabel)).size : 0}</p>
        </div>
        <div className="text-center px-4 border-r border-outline-variant">
          <p className="text-label-sm text-outline font-subhead-caps">OVERDUE</p>
          <p className="font-bold text-error">{schedule.filter((s) => s.isOverdue).length}</p>
        </div>
        <div className="text-center px-4">
          <p className="text-label-sm text-outline font-subhead-caps">ON TRACK</p>
          <p className="font-bold text-green-600">{schedule.filter((s) => !s.isOverdue).length}</p>
        </div>
      </div>
    </section>
  );
}
