import { Link, useLocation } from "react-router-dom";
import { Home, Users, MessageSquare, Calendar, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrainerLevelDisplay } from "@/components/gamification/TrainerLevelDisplay";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TrainerSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { label: 'Today', path: '/today', icon: Home, shortcut: '1' },
  { label: 'Clients', path: '/clients', icon: Users, shortcut: '2' },
  { label: 'Messages', path: '/messages', icon: MessageSquare, shortcut: '3' },
  { label: 'Calendar', path: '/calendar', icon: Calendar, shortcut: '4' },
  { label: 'Settings', path: '/settings', icon: Settings, shortcut: '5' },
];

export function TrainerSidebar({ collapsed, onToggle }: TrainerSidebarProps) {
  const location = useLocation();

  return (
    <TooltipProvider>
      <aside className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-200 z-50",
        collapsed ? "w-14" : "w-60"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            {!collapsed && (
              <h1 className="text-lg font-bold">TrainU Agent</h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className={cn("h-8 w-8", collapsed && "mx-auto")}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              if (collapsed) {
                return (
                  <Tooltip key={item.path} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link to={item.path}>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          size="icon"
                          className={cn(
                            "w-10 h-10 mx-auto",
                            isActive && "border-l-2 border-primary rounded-l-none"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label} ({item.shortcut})</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive && "border-l-2 border-primary rounded-l-none"
                    )}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <span>{item.label}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {item.shortcut}
                    </Badge>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Footer - Trainer Level */}
          <div className="p-3 border-t border-border">
            {collapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold">T</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <TrainerLevelDisplay />
                </TooltipContent>
              </Tooltip>
            ) : (
              <TrainerLevelDisplay />
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
