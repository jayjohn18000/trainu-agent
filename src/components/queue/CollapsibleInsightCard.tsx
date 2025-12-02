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
  evidence?: string[];
  diagnosticQuestions?: string[];
  strategies?: Array<{ strategy: string; successProbability: number }>;
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
  evidence,
  diagnosticQuestions,
  strategies,
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

            {evidence && evidence.length > 0 && (
              <div className="text-sm space-y-1">
                <span className="font-medium text-foreground">Supporting Evidence: </span>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {evidence.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {diagnosticQuestions && diagnosticQuestions.length > 0 && (
              <div className="text-sm space-y-1 pt-2 border-t border-border/50">
                <span className="font-medium text-foreground">Diagnostic Questions: </span>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {diagnosticQuestions.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            {strategies && strategies.length > 0 && (
              <div className="text-sm space-y-2 pt-2 border-t border-border/50">
                <span className="font-medium text-foreground">Recommended Strategies: </span>
                <div className="space-y-2">
                  {strategies.map((strategy, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground">{strategy.strategy}</span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(strategy.successProbability * 100)}% success
                      </span>
                    </div>
                  ))}
                </div>
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
