import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  type: "xp" | "level" | "achievement" | "session" | "message";
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  icon: string;
};

// Mock notifications
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "achievement",
    title: "New Achievement Unlocked! 🏆",
    description: "You've completed a 3-week streak!",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    icon: "🏆"
  },
  {
    id: "2",
    type: "xp",
    title: "+50 XP Earned ⚡",
    description: "Session completed successfully",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: false,
    icon: "⚡"
  },
  {
    id: "3",
    type: "session",
    title: "Upcoming Session 📅",
    description: "Training session tomorrow at 10:00 AM",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
    icon: "📅"
  },
];

export function NotificationCenter() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Open notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-6">
          <div className="space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={cn(
                    "p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50",
                    !notification.read && "bg-primary/5 border-primary/20"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{notification.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
