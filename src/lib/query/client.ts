import { QueryClient } from '@tanstack/react-query';
import { handleQueryError } from '@/lib/query/error-handler';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});


