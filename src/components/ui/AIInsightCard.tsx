import { Card } from "./card";
import { Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import { Skeleton } from "./skeleton";
import type { ClientInsight } from "@/hooks/queries/useClientInsights";

interface AIInsightCardProps {
  insight: ClientInsight | string; // Support both new and legacy format
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  className?: string;
}

export function AIInsightCard({
  insight,
  loading,
  error,
  onRetry,
  className,
}: AIInsightCardProps) {
  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-4 border-destructive/20 ${className}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Failed to load insight</span>
          {onRetry && (
            <Button variant="ghost" size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-1" /> Retry
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // Handle both string (legacy) and object formats
  const isLegacy = typeof insight === 'string';
  const title = isLegacy ? 'AI Insight' : insight.title;
  const description = isLegacy ? insight : insight.description;
  const impact = isLegacy ? undefined : insight.impact;
  const actionable = isLegacy ? undefined : insight.actionable;

  return (
    <Card className={`p-4 bg-gradient-to-r from-purple-500/5 to-blue-500/5 border-purple-500/20 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-purple-500/10">
          <Sparkles className="h-4 w-4 text-purple-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
              {title}
            </p>
            {impact && (
              <Badge
                variant={impact === 'high' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {impact}
              </Badge>
            )}
          </div>
          <p className="text-sm text-foreground">{description}</p>
          {actionable && (
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto mt-2 text-purple-600 dark:text-purple-400"
            >
              {actionable} <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
