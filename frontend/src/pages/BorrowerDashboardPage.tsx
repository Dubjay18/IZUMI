import { AppLayout } from "@/components/layout/AppLayout";
import { LoanSummaryCard } from "@/components/borrower/LoanSummaryCard";
import { RepaymentChart } from "@/components/borrower/RepaymentChart";
import { AutoRepayCard } from "@/components/borrower/AutoRepayCard";
import { CreditAvailableCard } from "@/components/borrower/CreditAvailableCard";
import { RepaymentSchedule } from "@/components/borrower/RepaymentSchedule";
import { ActiveLoansTable } from "@/components/borrower/ActiveLoansTable";

export function BorrowerDashboardPage() {
  return (
    <AppLayout>
      <main className="py-8 px-gutter md:px-container-padding max-w-[1440px] mx-auto">
        <LoanSummaryCard />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          <RepaymentChart />

          <aside className="md:col-span-4 flex flex-col gap-gutter">
            <AutoRepayCard />
            <CreditAvailableCard />
          </aside>

          <RepaymentSchedule />

          <ActiveLoansTable />
        </div>
      </main>
    </AppLayout>
  );
}
