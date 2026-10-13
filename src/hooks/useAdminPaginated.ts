import { useCallback, useEffect, useState } from "react";
import { HttpError, getErrorMessage } from "../services/http.client";
import type { AdminListParams, PaginatedResponse } from "../interfaces";

const DEFAULT_LIMIT = 10;

interface PageResult<T> {
  key: string;
  data: PaginatedResponse<T> | null;
  error: string | null;
  forbidden: boolean;
}

/**
 * Lista paginada en servidor para los endpoints /admin. `fetcher` debe ser estable
 * (useCallback) y `filterKey` identificar los filtros que lo modifican.
 */
export function useAdminPaginated<T>(
  fetcher: (params: AdminListParams) => Promise<PaginatedResponse<T>>,
  filterKey: string,
  fallbackError: string,
) {
  const [page, setPage] = useState(0);
  const [limit, setLimitState] = useState(DEFAULT_LIMIT);
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<PageResult<T> | null>(null);

  const key = `${filterKey}|${page}|${limit}|${reloadToken}`;

  useEffect(() => {
    let cancelled = false;
    fetcher({ page: page + 1, limit })
      .then((data) => {
        if (!cancelled) setResult({ key, data, error: null, forbidden: false });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setResult({
          key,
          data: null,
          error: getErrorMessage(error, fallbackError),
          forbidden: error instanceof HttpError && error.status === 403,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [key, fetcher, page, limit, fallbackError]);

  const setLimit = useCallback((value: number) => {
    setLimitState(value);
    setPage(0);
  }, []);

  const resetPage = useCallback(() => setPage(0), []);
  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  const current = result?.key === key ? result : null;
  // Mantiene la última página visible mientras se carga la siguiente.
  const last = result?.data ?? null;

  return {
    data: current?.data ?? last,
    error: current?.error ?? null,
    forbidden: result?.forbidden ?? false,
    loading: current === null,
    page,
    limit,
    setPage,
    setLimit,
    resetPage,
    reload,
  };
}
