import { useUser } from "@/context/UserContext";
import { useLoans } from "@/hooks/useLoans";
import type { LoanApplication } from "@/lib/types";

function totalOutstanding(loans: LoanApplication[]): number {
  return loans
    .filter((l) => l.status === "ACTIVE" || l.status === "DISBURSED")
    .reduce((sum, l) => sum + Number(l.amountApproved ?? l.amountRequested), 0);
}

function totalRepaid(loans: LoanApplication[]): number {
  return loans
    .filter((l) => l.status === "ACTIVE" || l.status === "DISBURSED" || l.status === "REPAID")
    .reduce((sum, l) => sum + Number(l.amountRepaid), 0);
}

function formatUSD(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const GRADE_COLORS: Record<string, string> = {
  A: "text-green-600 bg-green-50 border-green-200",
  B: "text-yellow-600 bg-yellow-50 border-yellow-200",
  C: "text-red-500 bg-red-50 border-red-200",
};

export function LoanSummaryCard() {
  const { session } = useUser();
  const { loans, activeLoan, loading } = useLoans(session?.borrowerId);
  const outstanding = totalOutstanding(loans);
  const repaid = totalRepaid(loans);
  const grade = activeLoan?.creditGrade ?? "B";
  const gradeColors = GRADE_COLORS[grade] ?? GRADE_COLORS.B;

  return (
    <header className="relative mb-section-gap">
      <div className="absolute -top-12 -left-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10" />
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <span className="font-subhead-caps text-subhead-caps text-secondary tracking-[0.2em] mb-2 block uppercase">
            Business Credit Facility
          </span>
          <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary leading-none">
            Credit Portfolio &amp; Repayments
          </h2>
        </div>
        <div className="flex flex-col items-end gap-2">
          {loading ? (
            <div className="h-14 w-56 bg-surface-container-high rounded-xl animate-pulse" />
          ) : (
            <>
              <p className="font-subhead-caps text-label-sm text-on-surface-variant mb-1">
                OUTSTANDING BALANCE
              </p>
              <p className="font-headline-md text-headline-md text-primary">
                {formatUSD(outstanding)}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-secondary font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  {formatUSD(repaid)} repaid
                </span>
                {activeLoan && (
                  <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-label-sm font-bold border ${gradeColors}`}>
                    Grade {grade}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
