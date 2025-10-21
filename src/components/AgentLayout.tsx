import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Search } from "lucide-react";

interface AgentLayoutProps {
  children: ReactNode;
}

export function AgentLayout({ children }: AgentLayoutProps) {
  const navigate = useNavigate();

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
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search (Cmd+K)"
                className="pl-8 pr-4"
                onClick={() => {
                  // TODO: Open command palette
                }}
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Agent Status Pill */}
            <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
              Active
            </Badge>

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
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <span className="text-xs font-medium">Today</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/clients")}
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <span className="text-xs font-medium">Clients</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/settings")}
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <span className="text-xs font-medium">Settings</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}
