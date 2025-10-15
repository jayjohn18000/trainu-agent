import { useState, useCallback } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { awardXP, getUserAchievements, getClientProgress } from '@/lib/mock/api-extended';
import type { Achievement } from '@/lib/mock/types';

export function useGamification() {
  const { user } = useAuthStore();
  const [xpNotification, setXpNotification] = useState<{ amount: number; reason: string } | null>(null);
  const [levelUpNotification, setLevelUpNotification] = useState<number | null>(null);
  const [achievementUnlock, setAchievementUnlock] = useState<Achievement | null>(null);

  const unlockAchievement = useCallback((achievement: Achievement) => {
    // Award XP for the achievement (without triggering notification since we show achievement popup)
    if (user?.id && achievement.xpReward) {
      awardXP(user.id, achievement.xpReward, `Achievement: ${achievement.name}`);
    }
    setAchievementUnlock(achievement);
    
    // Auto-clear after delay
    setTimeout(() => {
      setAchievementUnlock(null);
    }, 5000);
  }, [user?.id]);

  const checkForNewAchievements = useCallback(async () => {
    if (!user?.id) return;

    try {
      const progress = await getClientProgress(user.id);
      const achievements = await getUserAchievements(user.id);
      
      if (!progress) return;

      // Check for streak achievements
      if (progress.streak >= 2 && !achievements.find(a => a.id === 'ach_streak_2')) {
        unlockAchievement({
          id: 'ach_streak_2',
          userId: user.id,
          name: '2 Week Warrior',
          description: 'Maintain a 2-week training streak',
          icon: '🔥',
          tier: 'bronze',
          xpReward: 50,
          unlockedAt: new Date().toISOString(),
        });
      }
      
      if (progress.streak >= 4 && !achievements.find(a => a.id === 'ach_streak_4')) {
        unlockAchievement({
          id: 'ach_streak_4',
          userId: user.id,
          name: 'Month Master',
          description: 'Maintain a 4-week training streak',
          icon: '🔥',
          tier: 'silver',
          xpReward: 100,
          unlockedAt: new Date().toISOString(),
        });
      }

      if (progress.streak >= 8 && !achievements.find(a => a.id === 'ach_streak_8')) {
        unlockAchievement({
          id: 'ach_streak_8',
          userId: user.id,
          name: 'Consistency King',
          description: 'Maintain an 8-week training streak',
          icon: '👑',
          tier: 'gold',
          xpReward: 250,
          unlockedAt: new Date().toISOString(),
        });
      }

      // Check for level achievements
      if (progress.level >= 5 && !achievements.find(a => a.id === 'ach_level_5')) {
        unlockAchievement({
          id: 'ach_level_5',
          userId: user.id,
          name: 'Rising Star',
          description: 'Reach level 5',
          icon: '⭐',
          tier: 'bronze',
          xpReward: 100,
          unlockedAt: new Date().toISOString(),
        });
      }

      if (progress.level >= 10 && !achievements.find(a => a.id === 'ach_level_10')) {
        unlockAchievement({
          id: 'ach_level_10',
          userId: user.id,
          name: 'Elite Athlete',
          description: 'Reach level 10',
          icon: '💪',
          tier: 'silver',
          xpReward: 200,
          unlockedAt: new Date().toISOString(),
        });
      }

      if (progress.level >= 20 && !achievements.find(a => a.id === 'ach_level_20')) {
        unlockAchievement({
          id: 'ach_level_20',
          userId: user.id,
          name: 'Legendary',
          description: 'Reach level 20',
          icon: '🏆',
          tier: 'gold',
          xpReward: 500,
          unlockedAt: new Date().toISOString(),
        });
      }

    } catch (error) {
      console.error('Failed to check achievements:', error);
    }
  }, [user?.id, unlockAchievement]);

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

      // Check for newly unlocked achievements
      await checkForNewAchievements();

      return result;
    } catch (error) {
      console.error('Failed to award XP:', error);
    }
  }, [user?.id, checkForNewAchievements]);

  const clearXPNotification = useCallback(() => {
    setXpNotification(null);
  }, []);

  const clearLevelUpNotification = useCallback(() => {
    setLevelUpNotification(null);
  }, []);

  const clearAchievementUnlock = useCallback(() => {
    setAchievementUnlock(null);
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
    achievementUnlock,
    clearXPNotification,
    clearLevelUpNotification,
    clearAchievementUnlock,
    checkAchievements,
    checkForNewAchievements,
    unlockAchievement,
    getProgress,
  };
}
