import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "@/lib/errors";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const navigate = useNavigate();
  const message = getErrorMessage(error);

  return (
    <div className="flex items-center justify-center min-h-screen p-4" role="alert">
      <Card className="max-w-md w-full p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>

        {process.env.NODE_ENV === 'development' && error.stack && (
          <details className="mt-4">
            <summary className="text-sm cursor-pointer text-muted-foreground hover:text-foreground">
              Error details
            </summary>
            <pre className="mt-2 text-xs overflow-auto p-3 bg-muted rounded-md">
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex gap-2 pt-4">
          <Button onClick={resetErrorBoundary} variant="default" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="flex-1"
          >
            <Home className="h-4 w-4 mr-2" />
            Go home
          </Button>
        </div>
      </Card>
    </div>
  );
}

