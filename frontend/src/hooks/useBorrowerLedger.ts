import { useState, useEffect, useCallback } from "react";
import { borrowerApi } from "@/lib/api";
import type { BorrowerLedgerEntry, PaginationInfo } from "@/lib/types";

interface UseBorrowerLedgerResult {
  entries: BorrowerLedgerEntry[];
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
  setPage: (page: number) => void;
  setFilter: (type: string | undefined) => void;
  setSearch: (search: string) => void;
  refresh: () => void;
  page: number;
  filter: string | undefined;
  search: string;
}

export function useBorrowerLedger(
  borrowerId: string | null | undefined,
  pageSize = 20
): UseBorrowerLedgerResult {
  const [entries, setEntries] = useState<BorrowerLedgerEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");

  const fetch = useCallback(async () => {
    if (!borrowerId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await borrowerApi.getLedger(borrowerId, { page, limit: pageSize, type: filter, search: search || undefined });
      setEntries(result.entries);
      setPagination(result.pagination);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [borrowerId, page, pageSize, filter, search]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleSetFilter = useCallback((type: string | undefined) => {
    setFilter(type);
    setPage(1);
  }, []);

  const handleSetSearch = useCallback((q: string) => {
    setSearch(q);
    setPage(1);
  }, []);

  return {
    entries,
    pagination,
    loading,
    error,
    setPage,
    setFilter: handleSetFilter,
    setSearch: handleSetSearch,
    refresh: fetch,
    page,
    filter,
    search,
  };
}
