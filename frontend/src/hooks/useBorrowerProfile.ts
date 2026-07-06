import { useState, useEffect, useCallback } from "react";
import { borrowerApi } from "@/lib/api";
import type { BorrowerProfile } from "@/lib/types";

interface UseBorrowerProfileResult {
  profile: BorrowerProfile | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useBorrowerProfile(borrowerId: string | null | undefined): UseBorrowerProfileResult {
  const [profile, setProfile] = useState<BorrowerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!borrowerId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await borrowerApi.getProfile(borrowerId);
      setProfile(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [borrowerId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { profile, loading, error, refresh: fetch };
}
