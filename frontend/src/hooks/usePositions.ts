import { useState, useEffect, useCallback } from "react";
import { saverApi } from "@/lib/api";
import type { DepositPosition, PositionsResponse } from "@/lib/types";

interface UsePositionsResult {
  positions: DepositPosition[];
  matured: DepositPosition[];
  vaultBalanceUSD: number;
  totalPositions: number;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function usePositions(
  userId: string | null | undefined
): UsePositionsResult {
  const [data, setData] = useState<PositionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await saverApi.getPositions(userId);
      setData(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    positions: data?.positions ?? [],
    matured: data?.matured ?? [],
    vaultBalanceUSD: data?.vaultBalanceUSD ?? 0,
    totalPositions: data?.totalPositions ?? 0,
    loading,
    error,
    refresh: fetch,
  };
}
