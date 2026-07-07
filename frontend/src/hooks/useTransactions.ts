import { useState, useEffect, useCallback } from "react";
import { saverApi } from "@/lib/api";
import type { LedgerEntry, PaginationInfo, TransactionResponse } from "@/lib/types";

type TransactionApiRow = {
  id?: string;
  userId?: string;
  amount?: string;
  amountRaw?: string;
  amountUSD?: number;
  type?: string;
  status?: string;
  txHash?: string | null;
  createdAt?: string;
  timestamp?: string;
};

function normalizeTransactionEntry(entry: TransactionApiRow): LedgerEntry {
  const amount = entry.amount ?? entry.amountRaw ?? String(Math.round((entry.amountUSD ?? 0) * 1_000_000));
  const type =
    entry.type === "DEPOSIT" || entry.type === "WITHDRAWAL" || entry.type === "YIELD"
      ? entry.type
      : "DEPOSIT";
  const status =
    entry.status === "PENDING" || entry.status === "COMPLETED" || entry.status === "FAILED"
      ? entry.status
      : "COMPLETED";

  return {
    id: entry.id ?? `${entry.userId ?? "tx"}-${entry.createdAt ?? entry.timestamp ?? amount}`,
    userId: entry.userId ?? "",
    amount,
    type,
    status,
    txHash: entry.txHash ?? null,
    createdAt: entry.createdAt ?? entry.timestamp ?? new Date().toISOString(),
  };
}

function normalizeTransactionsResponse(
  response: unknown
): { entries: LedgerEntry[]; pagination: PaginationInfo | null } {
  if (Array.isArray(response)) {
    return {
      entries: response.map((entry) => normalizeTransactionEntry(entry as TransactionApiRow)),
      pagination: {
        page: 1,
        limit: response.length || 20,
        total: response.length,
        totalPages: 1,
      },
    };
  }

  if (response && typeof response === "object") {
    const typedResponse = response as Partial<TransactionResponse>;
    if (Array.isArray(typedResponse.entries)) {
      const entries = typedResponse.entries.map((entry) => normalizeTransactionEntry(entry as TransactionApiRow));
      const pagination = typedResponse.pagination ? {
        page: typedResponse.pagination.page ?? 1,
        limit: typedResponse.pagination.limit ?? 20,
        total: typedResponse.pagination.total ?? entries.length,
        totalPages: typedResponse.pagination.totalPages ?? 1,
      } : {
        page: 1,
        limit: entries.length || 20,
        total: entries.length,
        totalPages: 1,
      };
      return { entries, pagination };
    }
  }

  return { entries: [], pagination: null };
}

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
    if (!userId) {
      setEntries([]);
      setPagination(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await saverApi.getTransactions(userId, { page, limit: pageSize, type: filter });
      const normalized = normalizeTransactionsResponse(result as unknown);
      setEntries(normalized.entries);
      setPagination(normalized.pagination);
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
