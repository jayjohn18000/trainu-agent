import { Card } from "@/components/ui/card";
import { ArrowLeftRight } from "lucide-react";

interface CRMIntegrationFlowProps {
  features: string[];
  showVisual?: boolean;
}

export function CRMIntegrationFlow({ features, showVisual = true }: CRMIntegrationFlowProps) {
  return (
    <Card className="p-8">
      {showVisual && (
        <div className="mb-8">
          <div className="flex items-center justify-center gap-8 mb-4">
            <div className="text-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg mb-2">
                <span className="text-3xl font-black text-white">GHL</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">GoHighLevel</p>
            </div>
            
            <ArrowLeftRight className="h-12 w-12 text-primary animate-pulse" />
            
            <div className="text-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-glow mb-2">
                <span className="text-3xl font-black text-primary-foreground">TU</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">TrainU</p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-full inline-block">
              Bi-directional sync: Contacts, Messages, Tags, Engagement Data
            </p>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
            <p className="text-sm text-foreground">{feature}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
