import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { Confetti } from "@/components/effects/Confetti";

type Props = {
  onClose: () => void;
};

export function OnboardingSuccessStep({ onClose }: Props) {
  return (
    <div className="space-y-6 py-8">
      <Confetti active={true} />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-4 rounded-full bg-primary/10">
          <CheckCircle2 className="h-16 w-16 text-primary" />
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">You're all set!</h3>
          <p className="text-muted-foreground">
            Your GoHighLevel account is ready and integrated with TrainU
          </p>
        </div>
      </div>

      <Card className="p-6 space-y-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold">What's next?</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Your AI agent is now monitoring client engagement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Automated workflows are active for new contacts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Check your dashboard to see AI-suggested messages</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <div className="flex justify-center pt-4">
        <Button onClick={onClose} size="lg" className="gap-2">
          Go to Dashboard
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
