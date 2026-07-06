import { useUser } from "@/context/UserContext";
import { useLoans } from "@/hooks/useLoans";

export function ExposureHero() {
  const { session } = useUser();
  const { activeLoan, loading } = useLoans(session?.borrowerId);

  const approvedAmount = activeLoan?.amountApproved
    ? Number(activeLoan.amountApproved)
    : 0;
  const repaidAmount = activeLoan?.amountRepaid
    ? Number(activeLoan.amountRepaid)
    : 0;
  const outstanding = Math.max(approvedAmount - repaidAmount, 0);

  const formattedOutstanding = outstanding.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const apr = activeLoan?.interestRate
    ? (Number(activeLoan.interestRate) * 100).toFixed(1)
    : "12.0";

  return (
    <section className="mb-[80px] flex flex-col md:flex-row justify-between items-end">
      <div>
        <p className="text-[14px] font-body font-semibold uppercase tracking-[0.15em] text-secondary mb-2">
          {activeLoan ? "Active Debt Exposure" : "Available Credit Limit"}
        </p>
        {loading ? (
          <div className="h-16 w-64 bg-surface-container-high animate-pulse rounded-xl" />
        ) : (
          <h2 className="text-[56px] font-display font-bold text-primary leading-[1.1] tracking-[-0.02em]">
            ₦{activeLoan ? formattedOutstanding : "5,000,000.00"}
          </h2>
        )}
        <div className="flex items-center gap-2 mt-4">
          <span className="px-3 py-1 bg-secondary-container/20 text-on-secondary-container rounded-full text-[12px] font-body font-medium">
            {apr}% APR
          </span>
          <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-[12px] font-body font-medium">
            {activeLoan ? `Matures in ${activeLoan.termDays} days` : "Term: 30 - 90 Days"}
          </span>
        </div>
      </div>
      <div className="hidden md:block text-right mt-6 md:mt-0">
        <p className="text-[12px] font-body text-on-surface-variant italic mb-1">
          Next Auto-Sweep Scheduled
        </p>
        <p className="text-[18px] font-body font-bold text-primary">
          {activeLoan ? "Daily at 11:59 PM" : "No sweep active"}
        </p>
      </div>
    </section>
  );
}
