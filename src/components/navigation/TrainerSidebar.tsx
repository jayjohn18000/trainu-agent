import { Link, useLocation } from "react-router-dom";
import { Home, Users, MessageSquare, Calendar, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrainerLevelDisplay } from "@/components/gamification/TrainerLevelDisplay";
import { AgentStatusBar } from "@/components/agent/AgentStatusBar";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { CalendarModal } from "@/components/modals/CalendarModal";
import { MessagesModal } from "@/components/modals/MessagesModal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface TrainerSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { label: 'Today', path: '/today', icon: Home, shortcut: '1', isModal: false },
  { label: 'Clients', path: '/clients', icon: Users, shortcut: '2', isModal: false },
  { label: 'Messages', icon: MessageSquare, shortcut: '3', isModal: true },
  { label: 'Calendar', icon: Calendar, shortcut: '4', isModal: true },
  { label: 'Settings', icon: Settings, shortcut: '5', isModal: true },
];

export function TrainerSidebar({ collapsed, onToggle }: TrainerSidebarProps) {
  const location = useLocation();
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [agentState, setAgentState] = useState<"active" | "paused" | "processing">("active");

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.isModal) {
      if (item.label === 'Messages') setMessagesOpen(true);
      if (item.label === 'Calendar') setCalendarOpen(true);
      if (item.label === 'Settings') setSettingsOpen(true);
    }
  };

  const handleToggleAgent = () => {
    setAgentState(prev => prev === "paused" ? "active" : "paused");
  };

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

          {/* Agent Status */}
          <div className={cn("px-3 py-2 border-b border-border", collapsed && "px-2")}>
            {collapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div className="flex justify-center">
                    <AgentStatusBar 
                      state={agentState}
                      onToggle={handleToggleAgent}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Agent Status: {agentState}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <AgentStatusBar 
                state={agentState}
                currentAction="Reviewing messages"
                lastUpdate={new Date()}
                onToggle={handleToggleAgent}
              />
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1">
            {navItems.map((item) => {
              const isActive = item.path && location.pathname === item.path;
              const Icon = item.icon;

              if (collapsed) {
                return (
                  <Tooltip key={item.label} delayDuration={0}>
                    <TooltipTrigger asChild>
                      {item.isModal ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-10 h-10 mx-auto"
                          onClick={() => handleNavClick(item)}
                        >
                          <Icon className="h-5 w-5" />
                        </Button>
                      ) : (
                        <Link to={item.path!}>
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
                      )}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label} ({item.shortcut})</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              if (item.isModal) {
                return (
                  <Button
                    key={item.label}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleNavClick(item)}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <span>{item.label}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {item.shortcut}
                    </Badge>
                  </Button>
                );
              }

              return (
                <Link key={item.label} to={item.path!}>
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
          <div className="p-3 border-t border-border" data-tour="level">
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

      {/* Modals */}
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <CalendarModal open={calendarOpen} onOpenChange={setCalendarOpen} />
      <MessagesModal open={messagesOpen} onOpenChange={setMessagesOpen} />
    </TooltipProvider>
  );
}
