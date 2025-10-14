import { useEffect, useState } from "react";
import { Zap, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface XPNotificationProps {
  amount: number;
  reason?: string;
  show: boolean;
  onComplete?: () => void;
}

export function XPNotification({ amount, reason, show, onComplete }: XPNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-fade-in">
      <div className="bg-card border border-primary/50 rounded-lg shadow-glow-intense p-4 min-w-[200px]">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 rounded-full p-2">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="font-bold text-lg text-primary">+{amount} XP</span>
            </div>
            {reason && (
              <p className="text-xs text-muted-foreground mt-1">{reason}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface LevelUpNotificationProps {
  level: number;
  show: boolean;
  onComplete?: () => void;
}

export function LevelUpNotification({ level, show, onComplete }: LevelUpNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="animate-scale-in pointer-events-auto">
        <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-8 shadow-xl text-center max-w-sm">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-primary-foreground mb-2">
            Level Up!
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-4">
            You reached Level {level}
          </p>
          <div className="text-sm text-primary-foreground/70">
            Keep up the great work!
          </div>
        </div>
      </div>
    </div>
  );
}