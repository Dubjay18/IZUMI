import { useState, useEffect, useCallback } from "react";
import { saverApi } from "@/lib/api";
import type { BalanceResponse } from "@/lib/types";

interface UseBalanceResult {
  balanceUSD: number;
  balanceRaw: string;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const POLL_INTERVAL_MS = 30_000;

export function useBalance(userId: string | null | undefined): UseBalanceResult {
  const [data, setData] = useState<BalanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await saverApi.getBalance(userId);
      setData(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial fetch + polling
  useEffect(() => {
    fetch();
    if (!userId) return;
    const timer = setInterval(fetch, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetch, userId]);

  return {
    balanceUSD: data?.balanceUSD ?? 0,
    balanceRaw: data?.balanceRaw ?? "0",
    loading,
    error,
    refresh: fetch,
  };
}
