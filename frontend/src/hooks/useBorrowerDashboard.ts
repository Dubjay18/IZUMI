import { useState, useEffect, useCallback } from "react";
import { borrowerApi } from "@/lib/api";
import type { BorrowerDashboard } from "@/lib/types";

interface UseBorrowerDashboardResult {
  dashboard: BorrowerDashboard | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useBorrowerDashboard(borrowerId: string | null | undefined): UseBorrowerDashboardResult {
  const [dashboard, setDashboard] = useState<BorrowerDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!borrowerId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await borrowerApi.getDashboard(borrowerId);
      setDashboard(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [borrowerId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { dashboard, loading, error, refresh: fetch };
}
