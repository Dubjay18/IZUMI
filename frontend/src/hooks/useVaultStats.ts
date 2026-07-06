import { useState, useEffect, useCallback } from "react";
import { vaultApi } from "@/lib/api";
import type { VaultStatsResponse } from "@/lib/types";

interface UseVaultStatsResult {
  stats: VaultStatsResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useVaultStats(): UseVaultStatsResult {
  const [stats, setStats] = useState<VaultStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await vaultApi.getStats();
      setStats(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { stats, loading, error, refresh: fetch };
}
