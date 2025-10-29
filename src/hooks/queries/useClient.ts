import { useQuery } from '@tanstack/react-query';
import { clientProvider } from '@/lib/data/clients/provider';
import { queryKeys } from '@/lib/query/keys';

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: id ? queryKeys.clients.detail(id) : ['clients','detail','undefined'],
    queryFn: () => clientProvider.get(id as string),
    enabled: Boolean(id),
  });
}


