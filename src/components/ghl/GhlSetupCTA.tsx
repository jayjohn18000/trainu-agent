import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Settings, AlertCircle } from "lucide-react";

interface GhlSetupCTAProps {
  reason?: string;
  onSetup?: () => void;
}

export function GhlSetupCTA({ reason, onSetup }: GhlSetupCTAProps) {
  return (
    <Alert variant="default" className="border-border">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>GHL Integration Required</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm text-muted-foreground mb-3">
          {reason || 'Missing GoHighLevel configuration. Connect your GHL account to enable this feature.'}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onSetup}
          disabled={!onSetup}
          className="gap-2"
        >
          <Settings className="h-3 w-3" />
          Setup GHL Integration
        </Button>
      </AlertDescription>
    </Alert>
  );
}

