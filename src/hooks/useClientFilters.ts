import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ClientFiltersState } from '@/components/clients/ClientFilters';

/**
 * Hook for managing client filters with URL synchronization
 * Keeps filters in sync with URL search params for shareable links
 */
export function useClientFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<ClientFiltersState>(() => ({
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
    status: searchParams.get('status') || undefined,
    riskMin: searchParams.get('riskMin') ? Number(searchParams.get('riskMin')) : undefined,
    riskMax: searchParams.get('riskMax') ? Number(searchParams.get('riskMax')) : undefined,
    hasNext: searchParams.get('hasNext') === 'true' ? true : undefined,
  }), [searchParams]);

  const updateFilters = useCallback((newFilters: Partial<ClientFiltersState>) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (newFilters.tags !== undefined) {
      if (newFilters.tags.length > 0) {
        newParams.set('tags', newFilters.tags.join(','));
      } else {
        newParams.delete('tags');
      }
    }
    
    if (newFilters.status !== undefined) {
      if (newFilters.status) {
        newParams.set('status', newFilters.status);
      } else {
        newParams.delete('status');
      }
    }
    
    if (newFilters.riskMin !== undefined) {
      if (newFilters.riskMin !== null) {
        newParams.set('riskMin', String(newFilters.riskMin));
      } else {
        newParams.delete('riskMin');
      }
    }
    
    if (newFilters.riskMax !== undefined) {
      if (newFilters.riskMax !== null) {
        newParams.set('riskMax', String(newFilters.riskMax));
      } else {
        newParams.delete('riskMax');
      }
    }
    
    if (newFilters.hasNext !== undefined) {
      if (newFilters.hasNext === true) {
        newParams.set('hasNext', 'true');
      } else {
        newParams.delete('hasNext');
      }
    }
    
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const clearFilters = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('tags');
    newParams.delete('status');
    newParams.delete('riskMin');
    newParams.delete('riskMax');
    newParams.delete('hasNext');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  return { filters, updateFilters, clearFilters };
}

