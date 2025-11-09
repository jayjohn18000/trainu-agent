import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, Clock } from "lucide-react";
import { getGHLConfig } from "@/lib/api/ghl";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Props = {
  onComplete: () => void;
  dfyRequest?: any;
};

const PROVISIONING_STEPS = [
  "Creating your GHL location",
  "Setting up automation workflows",
  "Configuring integrations",
  "Testing connections",
  "Finalizing setup",
];

export function ProvisioningWaitStep({ onComplete, dfyRequest }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Simulate provisioning progress
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < PROVISIONING_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 3000);

    // Check for completion every 10 seconds
    const checkInterval = setInterval(async () => {
      try {
        const config = await getGHLConfig();
        if (config?.provisioning_status === "completed") {
          setChecking(false);
          clearInterval(checkInterval);
          clearInterval(stepInterval);
          setTimeout(onComplete, 1500);
        }
      } catch (error) {
        console.error("Failed to check provisioning status:", error);
      }
    }, 10000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(checkInterval);
    };
  }, [onComplete]);

  const progress = ((currentStep + 1) / PROVISIONING_STEPS.length) * 100;

  return (
    <div className="space-y-6 py-8">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-4 rounded-full bg-primary/10 animate-pulse">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Setting up your account...</h3>
          <p className="text-sm text-muted-foreground">
            This usually takes 2-5 minutes. Feel free to close this window.
          </p>
        </div>
      </div>

      <Card className="p-6 space-y-4">
        <Progress value={progress} className="h-2" />
        
        <div className="space-y-3">
          {PROVISIONING_STEPS.map((step, index) => (
            <div 
              key={index}
              className={`flex items-center gap-3 ${
                index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {index < currentStep ? (
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
              ) : index === currentStep ? (
                <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0" />
              ) : (
                <Clock className="h-5 w-5 flex-shrink-0" />
              )}
              <span className="text-sm">{step}</span>
            </div>
          ))}
        </div>
      </Card>

      <Alert>
        <AlertDescription className="text-sm">
          We're configuring your GHL account with:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Client engagement workflows</li>
            <li>SMS and email automation</li>
            <li>TrainU integration</li>
            <li>Best practice templates</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
