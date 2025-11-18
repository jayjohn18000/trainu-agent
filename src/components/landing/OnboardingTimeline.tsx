import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface OnboardingTimelineProps {
  steps: Array<{
    number: number;
    title: string;
    description: string;
    duration: string;
    icon: LucideIcon;
  }>;
}

export function OnboardingTimeline({ steps }: OnboardingTimelineProps) {
  return (
    <div className="relative">
      {/* Vertical line connector for larger screens */}
      <div className="hidden md:block absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary via-primary-hover to-primary" />
      
      <div className="space-y-8">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={step.number} className="relative flex gap-6 items-start">
              {/* Icon circle */}
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-glow z-10">
                <Icon className="h-8 w-8 text-primary-foreground" />
              </div>
              
              {/* Content */}
              <Card className="flex-1 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    Step {step.number}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                    {step.duration}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
