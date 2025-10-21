import { useEffect } from "react";
import { useTrainerGamification } from "@/hooks/useTrainerGamification";
import { Sparkles, TrendingUp } from "lucide-react";

export function TrainerXPNotification() {
  const { xpNotification, levelUpNotification, clearXPNotification, clearLevelUpNotification } = useTrainerGamification();

  useEffect(() => {
    if (xpNotification) {
      const timer = setTimeout(clearXPNotification, 3000);
      return () => clearTimeout(timer);
    }
  }, [xpNotification, clearXPNotification]);

  useEffect(() => {
    if (levelUpNotification) {
      const timer = setTimeout(clearLevelUpNotification, 5000);
      return () => clearTimeout(timer);
    }
  }, [levelUpNotification, clearLevelUpNotification]);

  return (
    <>
      {/* XP Gain Notification */}
      {xpNotification && (
        <div className="fixed bottom-24 right-6 z-50 animate-scale-in">
          <div className="bg-card border border-primary/30 rounded-xl p-4 shadow-glow min-w-[250px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-primary">
                  +{xpNotification.amount} XP
                </p>
                <p className="text-xs text-muted-foreground">
                  {xpNotification.reason}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Level Up Notification */}
      {levelUpNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="animate-scale-in">
            <div className="bg-gradient-to-br from-primary/20 to-warning/20 border-2 border-primary rounded-2xl p-8 shadow-glow-intense text-center min-w-[300px]">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow">
                <TrendingUp className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Level Up!</h3>
              <p className="text-lg text-primary font-semibold mb-1">
                Level {levelUpNotification}
              </p>
              <p className="text-sm text-muted-foreground">
                You're getting better at this!
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
