import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface InsightCardProps {
  insight: {
    id: string;
    contact_id: string;
    contact_name: string;
    event_type: string;
    risk_score: number;
    updated_at: string;
    draft_id?: string | null;
  };
  onViewDraft?: (draftId: string) => void;
}

const getEventLabel = (eventType: string): string => {
  const labels: Record<string, string> = {
    check_in: "Check-in",
    confirm_session: "Confirm Session",
    recover_no_show: "Recover No-Show",
  };
  return labels[eventType] || eventType;
};

export function InsightCard({ insight, onViewDraft }: InsightCardProps) {
  const riskColor =
    insight.risk_score <= 33
      ? "text-green-600"
      : insight.risk_score <= 66
      ? "text-amber-600"
      : "text-red-600";

  const riskTrend = insight.risk_score <= 50 ? "improved" : "needs attention";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{insight.contact_name}</h3>
              <Badge variant="secondary" className="text-xs">
                {getEventLabel(insight.event_type)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(insight.updated_at), { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {riskTrend === "improved" ? (
              <TrendingDown className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingUp className="h-4 w-4 text-amber-600" />
            )}
            <span className={`text-sm font-semibold ${riskColor}`}>
              {insight.risk_score}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {insight.draft_id && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              if (onViewDraft && insight.draft_id) {
                onViewDraft(insight.draft_id);
              } else {
                window.location.href = `/queue#${insight.draft_id}`;
              }
            }}
          >
            <ExternalLink className="h-3 w-3 mr-2" />
            Open draft in Queue
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

