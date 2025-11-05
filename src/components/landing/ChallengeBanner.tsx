import { useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChallengeBanner() {
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem("challenge-banner-dismissed") === "true";
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("challenge-banner-dismissed", "true");
  };

  if (isDismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-primary via-primary-hover to-primary animate-gradient-shift text-primary-foreground py-3 px-4 shadow-lg" style={{ backgroundSize: '200% auto' }}>
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Trophy className="h-5 w-5 flex-shrink-0 animate-pulse" />
          <p className="text-sm font-semibold truncate">
            🏆 Rate Your Trainer Challenge 2025 - $10k Prize Pool | Ends March 31
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/challenge"
            className={cn(
              "text-sm font-bold px-4 py-1.5 rounded-md whitespace-nowrap",
              "bg-primary-foreground text-primary hover:bg-primary-foreground/90",
              "transition-all duration-200 hover:scale-105 shadow-md"
            )}
          >
            Learn More
          </Link>
          <button
            onClick={handleDismiss}
            className="p-1.5 hover:bg-primary-foreground/20 rounded-md transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
