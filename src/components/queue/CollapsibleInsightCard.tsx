import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sparkles, TrendingDown, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { EditableActionList } from "./EditableActionList";

interface CollapsibleInsightCardProps {
  title: string;
  clientCount: number;
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
  rootCause?: string;
  dataSource?: string;
  actions: string[];
  onActionsChange: (actions: string[]) => void;
  defaultOpen?: boolean;
}

const riskConfig = {
  low: { 
    color: 'bg-success/10 text-success border-success/20', 
    icon: Sparkles,
    label: 'Positive',
  },
  medium: { 
    color: 'bg-warning/10 text-warning border-warning/20', 
    icon: AlertCircle,
    label: 'Attention',
  },
  high: { 
    color: 'bg-danger/10 text-danger border-danger/20', 
    icon: TrendingDown,
    label: 'At Risk',
  },
};

export function CollapsibleInsightCard({
  title,
  clientCount,
  riskLevel,
  description,
  rootCause,
  dataSource,
  actions,
  onActionsChange,
  defaultOpen = false,
}: CollapsibleInsightCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const config = riskConfig[riskLevel];
  const RiskIcon = config.icon;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={`border ${config.color.split(' ')[2]} overflow-hidden`}>
        <CollapsibleTrigger className="w-full">
          <div className="p-4 flex items-center justify-between hover:bg-accent/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${config.color}`}>
                <RiskIcon className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <Badge variant="outline" className={config.color}>
                    {config.label}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3 border-t border-border/50">
            <div className="pt-3">
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
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
