import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface GHLConnectionProps {
  onSuccess: () => void;
  onSkip: () => void;
}

export function GHLConnection({ onSuccess, onSkip }: GHLConnectionProps) {
  const [locationId, setLocationId] = useState("");
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!locationId.trim()) {
      setError("Please enter a Location ID");
      return;
    }

    setValidating(true);
    setError(null);

    try {
      const { data, error: validateError } = await supabase.functions.invoke("ghl-validate", {
        body: { locationId: locationId.trim() },
      });

      if (validateError) throw validateError;

      if (data.valid) {
        setValidated(true);
        toast({
          title: "GHL Connected!",
          description: `Location: ${data.locationName || locationId}`,
        });
        setTimeout(() => onSuccess(), 1500);
      } else {
        setError(data.error || "Invalid Location ID");
      }
    } catch (err) {
      console.error("GHL validation error:", err);
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ExternalLink className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Connect GoHighLevel</h3>
              <p className="text-sm text-muted-foreground">
                Sync contacts and automate messaging
              </p>
            </div>
          </div>

          {validated ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/30">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-success">Connection Successful!</p>
                <p className="text-xs text-success/80 mt-1">
                  Your GHL contacts will sync automatically
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="locationId">GHL Location ID</Label>
                <Input
                  id="locationId"
                  placeholder="e.g., abc123def456"
                  value={locationId}
                  onChange={(e) => {
                    setLocationId(e.target.value);
                    setError(null);
                  }}
                  disabled={validating}
                />
                <p className="text-xs text-muted-foreground">
                  Find this in your GHL Settings → Business Profile → Location ID
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleValidate}
                  disabled={!locationId.trim() || validating}
                  className="flex-1"
                >
                  {validating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    "Connect GHL"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>

      <div className="text-center">
        <Button variant="ghost" onClick={onSkip} disabled={validating}>
          Skip for now (use CSV import)
        </Button>
      </div>
    </div>
  );
}
