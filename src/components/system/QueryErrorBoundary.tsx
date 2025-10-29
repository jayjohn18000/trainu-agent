import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./ErrorFallback";

interface QueryErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Wraps React Query's QueryErrorResetBoundary with a custom ErrorBoundary
 * to provide better error handling and recovery for React Query errors.
 */
export function QueryErrorBoundary({ children }: QueryErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={reset}
          onError={(error) => {
            // Log error for monitoring
            if (import.meta.env.DEV) {
              console.error('QueryErrorBoundary caught an error:', error);
            }
          }}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

