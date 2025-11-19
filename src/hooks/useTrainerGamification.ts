import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import * as gamificationAPI from '@/lib/api/gamification';
import { useAuthStore } from '@/lib/store/useAuthStore';

export const XP_REWARDS = {
  APPROVE_MESSAGE: 25,
  BATCH_APPROVE: 75, // bonus for 3+
  EDIT_MESSAGE: 50,
  REGENERATE_MESSAGE: 25,
  ENGAGE_AT_RISK: 100, // client responds within 24h
  CLIENT_RESPONDS: 150,
  CLIENT_BOOKS: 200,
  SEVEN_DAY_STREAK: 300, // 7 days of approvals
  UNDO_MESSAGE: -10, // small penalty
} as const;

export const TRAINER_LEVELS = [
  { level: 1, title: 'Rookie Agent', xpRequired: 0 },
  { level: 2, title: 'Rookie Agent', xpRequired: 100 },
  { level: 3, title: 'Rookie Agent', xpRequired: 250 },
  { level: 4, title: 'Rookie Agent', xpRequired: 500 },
  { level: 5, title: 'Rookie Agent', xpRequired: 800 },
  { level: 6, title: 'Agent Apprentice', xpRequired: 1200 },
  { level: 7, title: 'Agent Apprentice', xpRequired: 1600 },
  { level: 8, title: 'Agent Apprentice', xpRequired: 2100 },
  { level: 9, title: 'Agent Apprentice', xpRequired: 2700 },
  { level: 10, title: 'Agent Apprentice', xpRequired: 3400 },
  { level: 11, title: 'Agent Master', xpRequired: 4200 },
  { level: 12, title: 'Agent Master', xpRequired: 5100 },
  { level: 13, title: 'Agent Master', xpRequired: 6100 },
  { level: 14, title: 'Agent Master', xpRequired: 7200 },
  { level: 15, title: 'Agent Master', xpRequired: 8400 },
  { level: 16, title: 'Agent Legend', xpRequired: 9700 },
  { level: 17, title: 'Agent Legend', xpRequired: 11100 },
  { level: 18, title: 'Agent Legend', xpRequired: 12600 },
  { level: 19, title: 'Agent Legend', xpRequired: 14200 },
  { level: 20, title: 'Agent Legend', xpRequired: 16000 },
];

interface TrainerProgress {
  xp: number;
  level: number;
  title: string;
  xpToNext: number;
  totalXpForNextLevel: number;
}

interface XPNotification {
  amount: number;
  reason: string;
  timestamp: number;
}

export function useTrainerGamification() {
  const { user } = useAuthStore();
  const [progress, setProgress] = useState<TrainerProgress>({
    xp: 0,
    level: 1,
    title: 'Rookie Agent',
    xpToNext: 100,
    totalXpForNextLevel: 100,
  });

  const [xpNotification, setXpNotification] = useState<XPNotification | null>(null);
  const [levelUpNotification, setLevelUpNotification] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Load progress from API on mount (only if authenticated)
  useEffect(() => {
    if (user) {
      loadProgress();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Subscribe to realtime updates on trainer profile (only if authenticated)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('trainer-progress')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trainer_profiles',
        },
        () => {
          loadProgress();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadProgress = async () => {
    try {
      const data = await gamificationAPI.getProgress();
      const currentLevel = data.level;
      const levelInfo = getLevelInfo(currentLevel);
      const nextLevelInfo = getLevelInfo(currentLevel + 1);

      setProgress({
        xp: data.xp,
        level: data.level,
        title: levelInfo.title,
        xpToNext: nextLevelInfo ? nextLevelInfo.xpRequired - data.xp : 0,
        totalXpForNextLevel: nextLevelInfo ? nextLevelInfo.xpRequired - levelInfo.xpRequired : 0,
      });
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLevel = useCallback((xp: number) => {
    let currentLevel = 1;
    for (let i = TRAINER_LEVELS.length - 1; i >= 0; i--) {
      if (xp >= TRAINER_LEVELS[i].xpRequired) {
        currentLevel = TRAINER_LEVELS[i].level;
        break;
      }
    }
    return currentLevel;
  }, []);

  const getLevelInfo = useCallback((level: number) => {
    return TRAINER_LEVELS.find(l => l.level === level) || TRAINER_LEVELS[0];
  }, []);

  const awardXP = useCallback(async (amount: number, reason: string) => {
    try {
      const result = await gamificationAPI.awardXP(amount, reason);
      
      // Show XP notification
      setXpNotification({
        amount,
        reason,
        timestamp: Date.now(),
      });

      // Show level up notification if leveled up
      if (result.leveledUp) {
        setTimeout(() => {
          setLevelUpNotification(result.newLevel);
          setTimeout(() => setLevelUpNotification(null), 5000);
        }, 500);
      }

      // Reload progress
      await loadProgress();

      // Auto-clear XP notification after 3 seconds
      setTimeout(() => {
        setXpNotification(null);
      }, 3000);

      return result;
    } catch (error) {
      console.error('Failed to award XP:', error);
      throw error;
    }
  }, []);

  const clearXPNotification = useCallback(() => {
    setXpNotification(null);
  }, []);

  const clearLevelUpNotification = useCallback(() => {
    setLevelUpNotification(null);
  }, []);

  return {
    progress,
    xpNotification,
    levelUpNotification,
    awardXP,
    clearXPNotification,
    clearLevelUpNotification,
    loading,
  };
}
