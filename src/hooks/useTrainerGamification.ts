import { useState, useCallback, useEffect } from 'react';

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
  const [progress, setProgress] = useState<TrainerProgress>(() => {
    const saved = localStorage.getItem('trainer-progress');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      xp: 0,
      level: 1,
      title: 'Rookie Agent',
      xpToNext: 100,
      totalXpForNextLevel: 100,
    };
  });

  const [xpNotification, setXpNotification] = useState<XPNotification | null>(null);
  const [levelUpNotification, setLevelUpNotification] = useState<number | null>(null);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('trainer-progress', JSON.stringify(progress));
  }, [progress]);

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

  const awardXP = useCallback((amount: number, reason: string) => {
    setProgress(prev => {
      const newXP = prev.xp + amount;
      const newLevel = calculateLevel(newXP);
      const levelInfo = getLevelInfo(newLevel);
      const nextLevelInfo = getLevelInfo(newLevel + 1);
      
      const didLevelUp = newLevel > prev.level;
      
      if (didLevelUp) {
        setTimeout(() => {
          setLevelUpNotification(newLevel);
          setTimeout(() => setLevelUpNotification(null), 5000);
        }, 500);
      }

      return {
        xp: newXP,
        level: newLevel,
        title: levelInfo.title,
        xpToNext: nextLevelInfo ? nextLevelInfo.xpRequired - newXP : 0,
        totalXpForNextLevel: nextLevelInfo ? nextLevelInfo.xpRequired - levelInfo.xpRequired : 0,
      };
    });

    // Show XP notification
    setXpNotification({
      amount,
      reason,
      timestamp: Date.now(),
    });

    // Auto-clear notification after 3 seconds
    setTimeout(() => {
      setXpNotification(null);
    }, 3000);
  }, [calculateLevel, getLevelInfo]);

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
  };
}
