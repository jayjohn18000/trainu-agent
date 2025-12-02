import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingDown, AlertCircle } from "lucide-react";
import { EditableActionList } from "./EditableActionList";

interface EnhancedInsightCardProps {
  title: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  rootCause?: string;
  dataSource?: string;
  actions: string[];
  onActionsChange: (actions: string[]) => void;
}

const riskConfig = {
  low: { color: 'bg-success/10 text-success border-success/20', icon: Sparkles },
  medium: { color: 'bg-warning/10 text-warning border-warning/20', icon: AlertCircle },
  high: { color: 'bg-danger/10 text-danger border-danger/20', icon: TrendingDown },
};

export function EnhancedInsightCard({
  title,
  description,
  riskLevel,
  rootCause,
  dataSource,
  actions,
  onActionsChange,
}: EnhancedInsightCardProps) {
  const config = riskConfig[riskLevel];
  const RiskIcon = config.icon;

  return (
    <Card className={`p-6 border ${config.color.split(' ')[2]}`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg ${config.color}`}>
          <RiskIcon className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{title}</h3>
              <Badge variant="outline" className={config.color}>
                {riskLevel}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {rootCause && (
            <div className="text-sm">
              <span className="font-medium text-foreground">Root Cause: </span>
              <span className="text-muted-foreground">{rootCause}</span>
            </div>
          )}

          <EditableActionList 
            actions={actions}
            onChange={onActionsChange}
          />

          {dataSource && (
            <div className="text-xs text-muted-foreground pt-2 border-t border-border">
              Source: {dataSource}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
