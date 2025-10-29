import { useQuery } from '@tanstack/react-query';
import { clientProvider } from '@/lib/data/clients/provider';
import type { ClientListParams } from '@/lib/data/clients/types';
import { queryKeys } from '@/lib/query/keys';

export function useClients(params: ClientListParams) {
  return useQuery({
    queryKey: queryKeys.clients.list(params),
    queryFn: () => clientProvider.list(params),
    keepPreviousData: true,
  });
}


