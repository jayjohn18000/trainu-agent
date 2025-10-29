import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';

export function handleQueryError(error: unknown): void {
  const message = getErrorMessage(error);
  try {
    toast({ title: 'Error', description: message, variant: 'destructive' });
  } catch (_e) {
    // no-op if toast is unavailable during early app boot
  }
}


