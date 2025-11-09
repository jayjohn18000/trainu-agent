import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDistanceToNow, differenceInMinutes } from "date-fns";
import { Send, Edit, CheckCircle, XCircle, Undo, Clock, MessageCircle } from "lucide-react";
import type { FeedItem } from "@/types/agent";

interface ActivityFeedProps {
  items: FeedItem[];
  onUndo?: (feedItemId: string) => void;
  className?: string;
}

export function ActivityFeed({ items, onUndo, className }: ActivityFeedProps) {
  const canUndo = (item: any) => {
    if (!item.approvedAt || item.action !== "sent") return false;
    try {
      const approvedDate = new Date(item.approvedAt);
      if (isNaN(approvedDate.getTime())) return false;
      const minutesSince = differenceInMinutes(new Date(), approvedDate);
      return minutesSince < 60;
    } catch {
      return false;
    }
  };

  const getUndoTimeLeft = (item: any) => {
    if (!item.approvedAt) return null;
    try {
      const approvedDate = new Date(item.approvedAt);
      if (isNaN(approvedDate.getTime())) return null;
      const minutesSince = differenceInMinutes(new Date(), approvedDate);
      const minutesLeft = 60 - minutesSince;
      return minutesLeft > 0 ? minutesLeft : null;
    } catch {
      return null;
    }
  };
  const getActionIcon = (action: string) => {
    switch (action) {
      case "sent":
        return <Send className="h-4 w-4" />;
      case "received":
        return <MessageCircle className="h-4 w-4" />;
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
          <EmptyState
            icon={Clock}
            title="No Activity Yet"
            description="Your recent actions and messages will appear here once you start approving items."
          />
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 pb-4 border-b last:border-0 last:pb-0 animate-slide-in-from-left"
                  style={{ animationDelay: `${idx * 30}ms` }}
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
                    <div className="flex items-center justify-between gap-2">
                      <time className="text-xs text-muted-foreground">
                        {item.ts && new Date(item.ts).getTime() > 0 
                          ? formatDistanceToNow(new Date(item.ts), { addSuffix: true })
                          : 'Just now'}
                      </time>
                      {canUndo(item) && onUndo && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onUndo(item.id)}
                          className="h-6 px-2 text-xs"
                        >
                          <Undo className="h-3 w-3 mr-1" />
                          Undo ({getUndoTimeLeft(item)}m)
                        </Button>
                      )}
                    </div>
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
