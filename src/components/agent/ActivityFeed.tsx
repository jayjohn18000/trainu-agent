import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Send, Edit, CheckCircle, XCircle } from "lucide-react";
import type { FeedItem } from "@/types/agent";

interface ActivityFeedProps {
  items: FeedItem[];
  className?: string;
}

export function ActivityFeed({ items, className }: ActivityFeedProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case "sent":
        return <Send className="h-4 w-4" />;
      case "edited":
        return <Edit className="h-4 w-4" />;
      case "drafted":
        return <CheckCircle className="h-4 w-4" />;
      case "undone":
        return <XCircle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "review":
        return "text-amber-600";
      case "undone":
        return "text-gray-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activity
          </p>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 pb-4 border-b last:border-0 last:pb-0"
                >
                  <div
                    className={`mt-0.5 ${getStatusColor(item.status)}`}
                    aria-hidden="true"
                  >
                    {getActionIcon(item.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-medium text-sm">{item.client}</span>
                      <Badge
                        variant="outline"
                        className="text-xs shrink-0"
                      >
                        {item.action}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {item.why}
                    </p>
                    <time className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.ts), {
                        addSuffix: true,
                      })}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
