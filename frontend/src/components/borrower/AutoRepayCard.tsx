import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useLoans } from "@/hooks/useLoans";

function formatUSD(n: number): string {
  return "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function nextInstallment(loans: { amountApproved: string | null; interestRate: string | null; termDays: number }[]) {
  const active = loans.find(
    (l) => l.amountApproved && l.interestRate
  );
  if (!active) return null;
  const principal = Number(active.amountApproved);
  const rate = Number(active.interestRate) / 100;
  const months = Math.max(Math.ceil(active.termDays / 30), 1);
  const monthly = (principal * (1 + rate)) / months;
  return { amount: monthly, months };
}

export function AutoRepayCard() {
  const { session } = useUser();
  const { loans } = useLoans(session?.borrowerId);
  const [enabled, setEnabled] = useState(true);
  const install = nextInstallment(loans);

  return (
    <div className="glass-panel rounded-xl p-8 bg-primary text-white border-none shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <span className="material-symbols-outlined text-secondary text-4xl">repeat</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            checked={enabled}
            onChange={() => setEnabled(!enabled)}
            className="sr-only custom-toggle"
            type="checkbox"
          />
          <div className="w-11 h-6 bg-surface-container-highest rounded-full transition-colors toggle-bg" />
          <div className="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform toggle-dot shadow-sm" />
        </label>
      </div>
      <h3 className="font-headline-md text-headline-md mb-2">Auto-Debit Repayment</h3>
      <p className="text-primary-fixed-dim text-body-md opacity-80 leading-relaxed">
        Automatic deduction of monthly installments from your registered business account.
      </p>
      {install && (
        <div className="mt-6 pt-6 border-t border-primary-fixed-dim/20">
          <p className="text-label-sm text-primary-fixed-dim opacity-70">NEXT INSTALLMENT</p>
          <p className="text-2xl font-display font-bold text-secondary-fixed mt-1">
            {formatUSD(install.amount)}
          </p>
          <p className="text-label-sm text-primary-fixed-dim opacity-60 mt-1">
            {install.months} monthly payments remaining
          </p>
        </div>
      )}
    </div>
  );
}
