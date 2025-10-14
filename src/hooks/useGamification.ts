import { useState, useCallback } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { awardXP, getUserAchievements, getClientProgress } from '@/lib/mock/api-extended';

export function useGamification() {
  const { user } = useAuthStore();
  const [xpNotification, setXpNotification] = useState<{ amount: number; reason: string } | null>(null);
  const [levelUpNotification, setLevelUpNotification] = useState<number | null>(null);

  const grantXP = useCallback(async (amount: number, source: string) => {
    if (!user?.id) return;

    try {
      const result = await awardXP(user.id, amount, source);
      
      // Show XP notification
      setXpNotification({ amount, reason: source });
      
      // Show level up notification if leveled up
      if (result.leveledUp) {
        setTimeout(() => {
          setLevelUpNotification(result.newLevel);
        }, 500);
      }

      return result;
    } catch (error) {
      console.error('Failed to award XP:', error);
    }
  }, [user?.id]);

  const clearXPNotification = useCallback(() => {
    setXpNotification(null);
  }, []);

  const clearLevelUpNotification = useCallback(() => {
    setLevelUpNotification(null);
  }, []);

  const checkAchievements = useCallback(async () => {
    if (!user?.id) return [];
    return await getUserAchievements(user.id);
  }, [user?.id]);

  const getProgress = useCallback(async () => {
    if (!user?.id) return null;
    return await getClientProgress(user.id);
  }, [user?.id]);

  return {
    grantXP,
    xpNotification,
    levelUpNotification,
    clearXPNotification,
    clearLevelUpNotification,
    checkAchievements,
    getProgress,
  };
}
