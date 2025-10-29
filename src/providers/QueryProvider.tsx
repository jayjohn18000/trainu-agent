import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query/client';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient} contextSharing={true}>
      {children}
    </QueryClientProvider>
  );
}


