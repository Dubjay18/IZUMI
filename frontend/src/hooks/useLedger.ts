import { useState, useEffect, useCallback } from "react";
import { saverApi } from "@/lib/api";
import type { LedgerEntry } from "@/lib/types";

interface UseLedgerResult {
  entries: LedgerEntry[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useLedger(userId: string | null | undefined): UseLedgerResult {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await saverApi.getLedger(userId);
      setEntries(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { entries, loading, error, refresh: fetch };
}
