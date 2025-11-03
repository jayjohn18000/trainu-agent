import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";

const features = [
  { name: "AI-Powered Client Retention", trainu: true, exercise: false, trainerize: false },
  { name: "Predictive At-Risk Detection", trainu: true, exercise: false, trainerize: false },
  { name: "Gamified Client Experience", trainu: true, exercise: false, trainerize: true },
  { name: "GoHighLevel Integration", trainu: true, exercise: false, trainerize: false },
  { name: "Automated Message Drafting", trainu: true, exercise: false, trainerize: false },
  { name: "5-Stage AI Approval Workflow", trainu: true, exercise: false, trainerize: false },
  { name: "Workout Programming", trainu: true, exercise: true, trainerize: true },
  { name: "Client Portal", trainu: true, exercise: true, trainerize: true },
  { name: "Starting Price", trainu: "$99/mo", exercise: "$199/mo", trainerize: "$150/mo" },
];

export function CompetitorTable() {
  return (
    <Card className="overflow-hidden border-primary/20">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-card border-b border-border">
            <tr>
              <th className="text-left p-4 font-semibold text-foreground">Feature</th>
              <th className="p-4 font-semibold text-primary">TrainU</th>
              <th className="p-4 font-semibold text-muted-foreground">Exercise.com</th>
              <th className="p-4 font-semibold text-muted-foreground">Trainerize</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr key={index} className="border-b border-border last:border-0 hover:bg-card/50">
                <td className="p-4 text-muted-foreground">{feature.name}</td>
                <td className="p-4 text-center">
                  {typeof feature.trainu === 'boolean' ? (
                    feature.trainu ? (
                      <Check className="h-5 w-5 text-success mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-muted mx-auto" />
                    )
                  ) : (
                    <span className="font-semibold text-primary">{feature.trainu}</span>
                  )}
                </td>
                <td className="p-4 text-center">
                  {typeof feature.exercise === 'boolean' ? (
                    feature.exercise ? (
                      <Check className="h-5 w-5 text-muted mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-muted mx-auto" />
                    )
                  ) : (
                    <span className="text-muted-foreground">{feature.exercise}</span>
                  )}
                </td>
                <td className="p-4 text-center">
                  {typeof feature.trainerize === 'boolean' ? (
                    feature.trainerize ? (
                      <Check className="h-5 w-5 text-muted mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-muted mx-auto" />
                    )
                  ) : (
                    <span className="text-muted-foreground">{feature.trainerize}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
