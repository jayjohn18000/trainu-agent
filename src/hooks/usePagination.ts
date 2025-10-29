import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationResult extends PaginationParams {
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  reset: () => void;
}

/**
 * Hook for managing pagination state with URL synchronization
 * 
 * @param defaultLimit - Default items per page (default: 20)
 * @param defaultPage - Default page number (default: 1)
 * @returns Pagination state and control functions
 */
export function usePagination(
  defaultLimit = 20,
  defaultPage = 1
): PaginationResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = useMemo(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? Math.max(1, Number(pageParam)) : defaultPage;
  }, [searchParams, defaultPage]);

  const limit = useMemo(() => {
    const limitParam = searchParams.get('limit');
    return limitParam ? Math.max(1, Number(limitParam)) : defaultLimit;
  }, [searchParams, defaultLimit]);

  const offset = useMemo(() => (page - 1) * limit, [page, limit]);

  const setPage = useCallback((newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    if (newPage > 1) {
      newParams.set('page', String(newPage));
    } else {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const setLimit = useCallback((newLimit: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('limit', String(newLimit));
    // Reset to page 1 when changing limit
    newParams.delete('page');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const nextPage = useCallback(() => {
    setPage(page + 1);
  }, [page, setPage]);

  const previousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page, setPage]);

  const reset = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('page');
    newParams.delete('limit');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  return {
    page,
    limit,
    offset,
    setPage,
    setLimit,
    nextPage,
    previousPage,
    reset,
  };
}

