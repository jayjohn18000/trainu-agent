import { useEffect, useState } from "react";
import { Trophy, Star } from "lucide-react";
import type { Achievement } from "@/lib/mock/types";

interface AchievementUnlockNotificationProps {
  achievement: Achievement | null;
  show: boolean;
  onComplete?: () => void;
}

export function AchievementUnlockNotification({ 
  achievement, 
  show, 
  onComplete 
}: AchievementUnlockNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show && achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, achievement, onComplete]);

  if (!isVisible || !achievement) return null;

  const tierColors = {
    bronze: "from-amber-600 to-amber-800",
    silver: "from-slate-400 to-slate-600",
    gold: "from-yellow-400 to-yellow-600",
    platinum: "from-purple-400 to-purple-600"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="animate-scale-in pointer-events-auto">
        <div className={`bg-gradient-to-br ${tierColors[achievement.tier]} rounded-2xl p-8 shadow-xl text-center max-w-sm`}>
          <div className="text-6xl mb-4">{achievement.icon}</div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="h-6 w-6 text-white" />
            <h2 className="text-2xl font-bold text-white">
              Achievement Unlocked!
            </h2>
          </div>
          <p className="text-xl font-semibold text-white/95 mb-2">
            {achievement.name}
          </p>
          <p className="text-sm text-white/80 mb-4">
            {achievement.description}
          </p>
          <div className="flex items-center justify-center gap-2 text-white/90 text-sm uppercase tracking-wide">
            <Star className="h-4 w-4 text-yellow-300" />
            <span className="font-semibold">
              {achievement.tier} Tier
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
