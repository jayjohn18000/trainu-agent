import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRecentMessages } from "@/hooks/queries/useRecentMessages";

interface MessagesWidgetProps {
  onOpenMessages: () => void;
}

export function MessagesWidget({ onOpenMessages }: MessagesWidgetProps) {
  const { data: messages = [], isLoading } = useRecentMessages();
  const unreadCount = messages.reduce((sum, msg) => sum + msg.unread, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3 p-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
          <Skeleton className="h-9 w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (messages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent messages
          </p>
          <Button variant="outline" size="sm" className="w-full" onClick={onOpenMessages}>
            View All Messages
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </CardTitle>
          {unreadCount > 0 && (
            <Badge variant="default" className="h-5 px-2">
              {unreadCount}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={onOpenMessages}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={msg.avatar} />
              <AvatarFallback>{msg.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className="font-medium text-sm truncate">{msg.name}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {msg.timestamp}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {msg.preview}
              </p>
            </div>
            {msg.unread > 0 && (
              <Badge variant="default" className="h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                {msg.unread}
              </Badge>
            )}
          </div>
        ))}
        <Button variant="outline" size="sm" className="w-full" onClick={onOpenMessages}>
          View All Messages
        </Button>
      </CardContent>
    </Card>
  );
}
