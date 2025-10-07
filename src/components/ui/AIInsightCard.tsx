import { Card } from "./card";
import { Sparkles } from "lucide-react";

interface AIInsightCardProps {
  insight: string;
  className?: string;
}

export function AIInsightCard({ insight, className }: AIInsightCardProps) {
  return (
    <Card className={`p-4 bg-gradient-to-r from-purple-500/5 to-blue-500/5 border-purple-500/20 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-purple-500/10">
          <Sparkles className="h-4 w-4 text-purple-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
            AI Insight
          </p>
          <p className="text-sm text-foreground">
            {insight}
          </p>
        </div>
      </div>
    </Card>
  );
}
