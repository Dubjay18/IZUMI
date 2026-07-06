import { useState, useEffect, useCallback } from "react";
import { saverApi } from "@/lib/api";
import type { LedgerEntry, PaginationInfo } from "@/lib/types";

interface UseTransactionsResult {
  entries: LedgerEntry[];
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
  setPage: (page: number) => void;
  setFilter: (type: string | undefined) => void;
  refresh: () => void;
  page: number;
  filter: string | undefined;
}

export function useTransactions(
  userId: string | null | undefined,
  pageSize = 20
): UseTransactionsResult {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string | undefined>(undefined);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await saverApi.getTransactions(userId, { page, limit: pageSize, type: filter });
      setEntries(result.entries);
      setPagination(result.pagination);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [userId, page, pageSize, filter]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleSetFilter = useCallback((type: string | undefined) => {
    setFilter(type);
    setPage(1);
  }, []);

  return {
    entries,
    pagination,
    loading,
    error,
    setPage,
    setFilter: handleSetFilter,
    refresh: fetch,
    page,
    filter,
  };
}
