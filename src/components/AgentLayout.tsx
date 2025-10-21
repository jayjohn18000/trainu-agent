import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { AgentStatusBar } from "./agent/AgentStatusBar";
import { CommandPalette } from "./agent/CommandPalette";
import { fixtures } from "@/lib/fixtures";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { cn } from "@/lib/utils";
import { Home, Users, Settings as SettingsIcon } from "lucide-react";

interface AgentLayoutProps {
  children: ReactNode;
}

export function AgentLayout({ children }: AgentLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [commandOpen, setCommandOpen] = useState(false);
  const [agentState, setAgentState] = useState<"active" | "paused">("active");

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "/",
      callback: () => setCommandOpen(true),
      description: "Open command palette",
    },
    {
      key: "p",
      callback: () => setAgentState((s) => (s === "active" ? "paused" : "active")),
      description: "Pause/Resume agent",
    },
  ]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="text-xl font-bold text-primary"
          >
            TrainU
          </button>

          {/* Search - Cmd/Ctrl+K */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground"
              onClick={() => setCommandOpen(true)}
            >
              <span className="text-sm">Search (Cmd+K)</span>
            </Button>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Agent Status */}
            <AgentStatusBar
              state={agentState}
              currentAction="Monitoring 12 clients"
              lastUpdate={new Date(Date.now() - 5 * 60 * 1000)}
              onToggle={() =>
                setAgentState((s) => (s === "active" ? "paused" : "active"))
              }
            />

            {/* User Menu */}
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>TR</AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex justify-around items-center h-16">
          <Button
            variant="ghost"
            onClick={() => navigate("/today")}
            className={cn(
              "flex flex-col items-center gap-1 h-auto py-2",
              isActive("/today") && "text-primary bg-primary/10"
            )}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium">Today</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/clients")}
            className={cn(
              "flex flex-col items-center gap-1 h-auto py-2",
              isActive("/clients") && "text-primary bg-primary/10"
            )}
          >
            <Users className="h-5 w-5" />
            <span className="text-xs font-medium">Clients</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/settings")}
            className={cn(
              "flex flex-col items-center gap-1 h-auto py-2",
              isActive("/settings") && "text-primary bg-primary/10"
            )}
          >
            <SettingsIcon className="h-5 w-5" />
            <span className="text-xs font-medium">Settings</span>
          </Button>
        </div>
      </nav>

      {/* Command Palette */}
      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        clients={fixtures.clients}
        isPaused={agentState === "paused"}
        onPauseAgent={() =>
          setAgentState((s) => (s === "active" ? "paused" : "active"))
        }
        onApproveAllSafe={() => {
          // TODO: Implement approve all safe
          console.log("Approve all safe");
        }}
      />
    </div>
  );
}
