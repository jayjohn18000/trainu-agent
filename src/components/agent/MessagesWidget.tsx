import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  name: string;
  avatar: string;
  preview: string;
  timestamp: string;
  unread: number;
}

const mockMessages: Message[] = [
  {
    id: "1",
    name: "John Doe",
    avatar: "https://i.pravatar.cc/150?img=10",
    preview: "Thanks for the great session today!",
    timestamp: "2m ago",
    unread: 2,
  },
  {
    id: "2",
    name: "Sarah Wilson",
    avatar: "https://i.pravatar.cc/150?img=11",
    preview: "Can we reschedule tomorrow's session?",
    timestamp: "1h ago",
    unread: 1,
  },
  {
    id: "3",
    name: "Mike Johnson",
    avatar: "https://i.pravatar.cc/150?img=12",
    preview: "Perfect, see you then!",
    timestamp: "3h ago",
    unread: 0,
  },
];

interface MessagesWidgetProps {
  onOpenMessages: () => void;
}

export function MessagesWidget({ onOpenMessages }: MessagesWidgetProps) {
  const unreadCount = mockMessages.reduce((sum, msg) => sum + msg.unread, 0);

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
        {mockMessages.map((msg) => (
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
