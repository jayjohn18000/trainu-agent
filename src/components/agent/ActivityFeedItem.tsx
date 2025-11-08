import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityFeedItemProps {
  activity: {
    id: string;
    type: "draft_approved" | "draft_rejected" | "draft_sent" | "client_added" | "message_received";
    timestamp: Date;
    content: string;
    metadata?: {
      contactName?: string;
      reason?: string;
    };
  };
}

export function ActivityFeedItem({ activity }: ActivityFeedItemProps) {
  const getIcon = () => {
    switch (activity.type) {
      case "draft_approved":
      case "draft_sent":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "draft_rejected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "message_received":
        return <MessageSquare className="h-4 w-4 text-primary" />;
      case "client_added":
        return <User className="h-4 w-4 text-accent" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getColor = () => {
    switch (activity.type) {
      case "draft_approved":
      case "draft_sent":
        return "border-success/20";
      case "draft_rejected":
        return "border-destructive/20";
      case "message_received":
        return "border-primary/20";
      default:
        return "border-border";
    }
  };

  return (
    <div className={cn("flex gap-3 p-3 rounded-lg border bg-card", getColor())}>
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{activity.content}</p>
        {activity.metadata?.contactName && (
          <p className="text-xs text-muted-foreground mt-1">
            Contact: {activity.metadata.contactName}
          </p>
        )}
        {activity.metadata?.reason && (
          <p className="text-xs text-muted-foreground mt-1">
            {activity.metadata.reason}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {format(activity.timestamp, "PPp")}
        </p>
      </div>
    </div>
  );
}
