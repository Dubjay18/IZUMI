import { useState, useEffect, useCallback } from "react";
import { loanApi } from "@/lib/api";
import type { LoanApplication } from "@/lib/types";

interface UseLoansResult {
  loans: LoanApplication[];
  activeLoan: LoanApplication | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useLoans(borrowerId: string | null | undefined): UseLoansResult {
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLoans = useCallback(async () => {
    if (!borrowerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await loanApi.getByBorrower(borrowerId);
      setLoans(res);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [borrowerId]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  // Find the first active/disbursed/unrepaid loan
  const activeLoan = loans.find(
    (l) =>
      l.status === "ACTIVE" ||
      l.status === "DISBURSED" ||
      l.status === "APPROVED" ||
      l.status === "AI_ASSESSED"
  ) || null;

  return {
    loans,
    activeLoan,
    loading,
    error,
    refresh: fetchLoans,
  };
}
