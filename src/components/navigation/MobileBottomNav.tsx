import { Link, useLocation } from "react-router-dom";
import { Home, Users, MessageSquare, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: 'Today', path: '/today', icon: Home },
  { label: 'Clients', path: '/clients', icon: Users },
  { label: 'Messages', path: '/messages', icon: MessageSquare },
  { label: 'Calendar', path: '/calendar', icon: Calendar },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-2 py-2 safe-bottom">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link 
              key={item.path} 
              to={item.path}
              className="flex-1"
            >
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full flex flex-col items-center gap-1 h-auto py-2 px-1",
                  isActive && "text-primary"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  isActive && "fill-primary/20"
                )} />
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
