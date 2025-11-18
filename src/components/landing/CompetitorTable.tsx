import { Card } from "@/components/ui/card";
import { Check, X, Info } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const features = [
  { 
    name: "AI-Powered Client Retention", 
    trainu: true, 
    exercise: false, 
    trainerize: false,
    description: "Machine learning algorithms analyze client behavior patterns, engagement metrics, and communication history to predict churn risk and suggest personalized retention strategies."
  },
  { 
    name: "Predictive At-Risk Detection", 
    trainu: true, 
    exercise: false, 
    trainerize: false,
    description: "Real-time risk scoring system that monitors 20+ engagement signals to identify clients showing early warning signs of disengagement before they cancel."
  },
  { 
    name: "Gamified Client Experience", 
    trainu: true, 
    exercise: false, 
    trainerize: true,
    description: "Comprehensive gamification with streaks, XP, leaderboards, achievement badges, and community challenges to keep clients motivated and engaged long-term."
  },
  { 
    name: "GoHighLevel Integration", 
    trainu: true, 
    exercise: false, 
    trainerize: false,
    description: "Native two-way sync with GHL CRM, automatic contact syncing, SMS/email automation triggers, and unified client communication across platforms."
  },
  { 
    name: "Automated Message Drafting", 
    trainu: true, 
    exercise: false, 
    trainerize: false,
    description: "AI writes personalized check-in messages, re-engagement campaigns, and milestone celebrations based on each client's workout history, preferences, and current status."
  },
  { 
    name: "5-Stage AI Approval Workflow", 
    trainu: true, 
    exercise: false, 
    trainerize: false,
    description: "Multi-tier review system (Drafting → Review Queue → Scheduled → Sent → Analytics) ensures you maintain full control while AI handles the heavy lifting."
  },
  { 
    name: "Workout Programming", 
    trainu: true, 
    exercise: true, 
    trainerize: true,
    description: "Build custom workout plans, exercise libraries, progressive overload tracking, and video demonstrations for comprehensive training program management."
  },
  { 
    name: "Client Portal", 
    trainu: true, 
    exercise: true, 
    trainerize: true,
    description: "Branded mobile-friendly client dashboard where members track workouts, view programs, message trainers, and monitor their progress metrics."
  },
  { 
    name: "Starting Price", 
    trainu: "$79/mo", 
    exercise: "$199/mo", 
    trainerize: "$150/mo",
    description: "Base monthly subscription price for core platform features. Higher tiers may include additional capabilities, client limits, or white-label options."
  },
];

function FeatureRow({ 
  feature, 
  index, 
  onClick 
}: { 
  feature: typeof features[0]; 
  index: number;
  onClick: () => void;
}) {
  return (
    <tr 
      className={cn(
        "border-b border-border/50 last:border-0 cursor-pointer transition-all duration-200",
        "hover:bg-primary/5"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onClick}
    >
      <td className="p-4 text-left align-middle">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="font-medium text-foreground truncate" title={feature.name}>
            {feature.name}
          </span>
        </div>
      </td>
      <td className="p-4 text-center align-middle w-[200px]">
        {typeof feature.trainu === 'boolean' ? (
          feature.trainu ? (
            <Check className="h-5 w-5 text-success mx-auto" strokeWidth={2.5} />
          ) : (
            <X className="h-5 w-5 text-muted-foreground/40 mx-auto" strokeWidth={2.5} />
          )
        ) : (
          <span className="font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full inline-block tabular-nums">
            {feature.trainu}
          </span>
        )}
      </td>
      <td className="p-4 text-center align-middle w-[200px]">
        {typeof feature.exercise === 'boolean' ? (
          feature.exercise ? (
            <Check className="h-5 w-5 text-success/60 mx-auto" strokeWidth={2.5} />
          ) : (
            <X className="h-5 w-5 text-danger/60 mx-auto" strokeWidth={2.5} />
          )
        ) : (
          <span className="text-muted-foreground font-medium tabular-nums">{feature.exercise}</span>
        )}
      </td>
      <td className="p-4 text-center align-middle w-[200px]">
        {typeof feature.trainerize === 'boolean' ? (
          feature.trainerize ? (
            <Check className="h-5 w-5 text-success/60 mx-auto" strokeWidth={2.5} />
          ) : (
            <X className="h-5 w-5 text-danger/60 mx-auto" strokeWidth={2.5} />
          )
        ) : (
          <span className="text-muted-foreground font-medium tabular-nums">{feature.trainerize}</span>
        )}
      </td>
    </tr>
  );
}

export function CompetitorTable() {
  const [selectedFeature, setSelectedFeature] = useState<typeof features[0] | null>(null);

  return (
    <>
      <Card className="overflow-hidden border-primary/20 shadow-glow backdrop-blur-xl bg-card/90">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-primary/20 sticky top-0 backdrop-blur-xl z-10">
              <tr>
                <th className="text-left p-5 font-bold text-foreground w-[40%]">
                  Feature
                </th>
                <th className="p-5 font-bold text-primary w-[20%]">
                  <div className="flex flex-col items-center gap-1">
                    <span>TrainU</span>
                    <span className="text-xs font-normal text-muted-foreground">(You)</span>
                  </div>
                </th>
                <th className="p-5 font-semibold text-muted-foreground w-[20%]">
                  Exercise.com
                </th>
                <th className="p-5 font-semibold text-muted-foreground w-[20%]">
                  Trainerize
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <FeatureRow 
                  key={index} 
                  feature={feature} 
                  index={index}
                  onClick={() => setSelectedFeature(feature)}
                />
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gradient-to-r from-primary/5 to-transparent border-t border-primary/10">
          <p className="text-xs text-muted-foreground text-center">
            💡 Click any row to see detailed feature descriptions
          </p>
        </div>
      </Card>

      <Sheet open={!!selectedFeature} onOpenChange={(open) => !open && setSelectedFeature(null)}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="text-xl">{selectedFeature?.name}</SheetTitle>
            <SheetDescription className="text-base leading-relaxed pt-4">
              {selectedFeature?.description}
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
              <span className="font-semibold text-foreground">TrainU</span>
              {typeof selectedFeature?.trainu === 'boolean' ? (
                selectedFeature.trainu ? (
                  <Check className="h-6 w-6 text-success" strokeWidth={2.5} />
                ) : (
                  <X className="h-6 w-6 text-muted-foreground/40" strokeWidth={2.5} />
                )
              ) : (
                <span className="font-semibold text-primary tabular-nums">{selectedFeature?.trainu}</span>
              )}
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
              <span className="font-medium text-muted-foreground">Exercise.com</span>
              {typeof selectedFeature?.exercise === 'boolean' ? (
                selectedFeature.exercise ? (
                  <Check className="h-6 w-6 text-success/60" strokeWidth={2.5} />
                ) : (
                  <X className="h-6 w-6 text-danger/60" strokeWidth={2.5} />
                )
              ) : (
                <span className="font-medium text-muted-foreground tabular-nums">{selectedFeature?.exercise}</span>
              )}
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
              <span className="font-medium text-muted-foreground">Trainerize</span>
              {typeof selectedFeature?.trainerize === 'boolean' ? (
                selectedFeature.trainerize ? (
                  <Check className="h-6 w-6 text-success/60" strokeWidth={2.5} />
                ) : (
                  <X className="h-6 w-6 text-danger/60" strokeWidth={2.5} />
                )
              ) : (
                <span className="font-medium text-muted-foreground tabular-nums">{selectedFeature?.trainerize}</span>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
