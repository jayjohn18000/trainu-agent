import { Card } from "@/components/ui/card";
import { Check, X, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
    trainu: "$99/mo", 
    exercise: "$199/mo", 
    trainerize: "$150/mo",
    description: "Base monthly subscription price for core platform features. Higher tiers may include additional capabilities, client limits, or white-label options."
  },
];

function FeatureRow({ feature, index }: { feature: typeof features[0], index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <tr 
          className={cn(
            "border-b border-border last:border-0 cursor-pointer transition-all duration-300",
            "hover:bg-primary/5 hover:shadow-sm",
            isOpen && "bg-primary/5"
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <td className="p-4 text-foreground font-medium flex items-center gap-2">
            <ChevronDown 
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-300",
                isOpen && "rotate-180"
              )} 
            />
            {feature.name}
          </td>
          <td className="p-4 text-center">
            {typeof feature.trainu === 'boolean' ? (
              feature.trainu ? (
                <Check className="h-5 w-5 text-success mx-auto animate-scale-in" style={{ animationDelay: `${index * 100}ms` }} />
              ) : (
                <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
              )
            ) : (
              <span className="font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full inline-block">
                {feature.trainu}
              </span>
            )}
          </td>
          <td className="p-4 text-center">
            {typeof feature.exercise === 'boolean' ? (
              feature.exercise ? (
                <Check className="h-5 w-5 text-muted-foreground/60 mx-auto" />
              ) : (
                <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
              )
            ) : (
              <span className="text-muted-foreground font-medium">{feature.exercise}</span>
            )}
          </td>
          <td className="p-4 text-center">
            {typeof feature.trainerize === 'boolean' ? (
              feature.trainerize ? (
                <Check className="h-5 w-5 text-muted-foreground/60 mx-auto" />
              ) : (
                <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
              )
            ) : (
              <span className="text-muted-foreground font-medium">{feature.trainerize}</span>
            )}
          </td>
        </tr>
      </CollapsibleTrigger>
      <CollapsibleContent asChild>
        <tr className="border-b border-border last:border-0">
          <td colSpan={4} className="p-0">
            <div className="px-6 py-4 bg-card/50 backdrop-blur-sm animate-accordion-down">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          </td>
        </tr>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function CompetitorTable() {
  return (
    <Card className="overflow-hidden border-primary/20 shadow-glow backdrop-blur-xl bg-card/90">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-primary/20 sticky top-0 backdrop-blur-xl z-10">
            <tr>
              <th className="text-left p-4 font-bold text-foreground">Feature</th>
              <th className="p-4 font-bold text-primary">
                <div className="flex flex-col items-center gap-1">
                  <span>TrainU Features</span>
                  <span className="text-xs font-normal text-muted-foreground">(You)</span>
                </div>
              </th>
              <th className="p-4 font-semibold text-muted-foreground">
                <div className="flex flex-col items-center gap-1">
                  <span>Exercise.com Features</span>
                </div>
              </th>
              <th className="p-4 font-semibold text-muted-foreground">
                <div className="flex flex-col items-center gap-1">
                  <span>Trainerize Features</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <FeatureRow key={index} feature={feature} index={index} />
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
  );
}
