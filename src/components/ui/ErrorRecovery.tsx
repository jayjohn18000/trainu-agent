import { AlertCircle, RefreshCw, Calendar, Settings } from "lucide-react";
import { Button } from "./button";
import { Alert, AlertDescription, AlertTitle } from "./alert";

interface ErrorRecoveryProps {
  error: Error | string;
  context?: "csv" | "ghl" | "quiet-hours" | "draft" | "general";
  onRetry?: () => void;
  onAction?: () => void;
}

const ERROR_CONFIGS = {
  csv: {
    title: "CSV Import Failed",
    actionLabel: "Try Again",
    icon: RefreshCw,
  },
  ghl: {
    title: "GHL Connection Error",
    actionLabel: "Reconnect GHL",
    icon: Settings,
  },
  "quiet-hours": {
    title: "Quiet Hours Active",
    actionLabel: "Schedule for Later",
    icon: Calendar,
  },
  draft: {
    title: "Draft Generation Failed",
    actionLabel: "Retry",
    icon: RefreshCw,
  },
  general: {
    title: "Something went wrong",
    actionLabel: "Retry",
    icon: AlertCircle,
  },
};

export function ErrorRecovery({ error, context = "general", onRetry, onAction }: ErrorRecoveryProps) {
  const config = ERROR_CONFIGS[context];
  const Icon = config.icon;
  const errorMessage = typeof error === "string" ? error : error.message;

  const getRecoveryMessage = () => {
    switch (context) {
      case "csv":
        return "Check your CSV format matches the template. Make sure First Name and Phone columns are mapped correctly.";
      case "ghl":
        return "Verify your GHL Location ID is correct in settings. Your GHL account may need to be reconnected.";
      case "quiet-hours":
        return "Messages during quiet hours (9 PM - 8 AM CT) will be automatically queued for delivery.";
      case "draft":
        return "The AI service may be temporarily unavailable. Wait a moment and try again.";
      default:
        return "If the problem persists, please contact support.";
    }
  };

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (onRetry) {
      onRetry();
    }
  };

  return (
    <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
      <Icon className="h-4 w-4" />
      <AlertTitle>{config.title}</AlertTitle>
      <AlertDescription className="space-y-3">
        <p className="text-sm">{errorMessage}</p>
        <p className="text-sm text-muted-foreground">{getRecoveryMessage()}</p>
        {(onRetry || onAction) && (
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={handleAction}>
              <Icon className="h-3 w-3 mr-2" />
              {config.actionLabel}
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
