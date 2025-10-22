import { useState, useEffect, useCallback } from 'react';
import { TRAINER_ACHIEVEMENTS, type TrainerAchievement } from '@/lib/mock/trainerAchievements';

interface AchievementProgress {
  [key: string]: {
    currentValue: number;
    unlocked: boolean;
    unlockedAt?: string;
  };
}

interface UserStats {
  timeSavedHours: number;
  messagesSentToday: number;
  messagesSentTotal: number;
  messagesEdited: number;
  atRiskEngaged: number;
  bookingsFromNudges: number;
  streakDays: number;
  approvalStreakDays: number;
  responseRate30d: number;
}

export function useAchievementTracker() {
  const [progress, setProgress] = useState<AchievementProgress>(() => {
    const saved = localStorage.getItem('achievement-progress');
    if (saved) {
      return JSON.parse(saved);
    }
    return {};
  });

  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('user-stats');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      timeSavedHours: 0,
      messagesSentToday: 0,
      messagesSentTotal: 0,
      messagesEdited: 0,
      atRiskEngaged: 0,
      bookingsFromNudges: 0,
      streakDays: 0,
      approvalStreakDays: 0,
      responseRate30d: 0,
    };
  });

  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<TrainerAchievement[]>([]);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('achievement-progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('user-stats', JSON.stringify(userStats));
  }, [userStats]);

  const checkAchievements = useCallback((stats: UserStats) => {
    const newUnlocks: TrainerAchievement[] = [];

    TRAINER_ACHIEVEMENTS.forEach((achievement) => {
      const currentProgress = progress[achievement.id] || { currentValue: 0, unlocked: false };
      
      if (currentProgress.unlocked) return; // Already unlocked

      let currentValue = 0;
      
      // Map requirement type to user stats
      switch (achievement.requirement.type) {
        case 'time_saved_hours':
          currentValue = stats.timeSavedHours;
          break;
        case 'messages_per_day':
          currentValue = stats.messagesSentToday;
          break;
        case 'approval_streak_days':
          currentValue = stats.approvalStreakDays;
          break;
        case 'at_risk_engaged':
          currentValue = stats.atRiskEngaged;
          break;
        case 'bookings_from_nudges':
          currentValue = stats.bookingsFromNudges;
          break;
        case 'streak_days':
          currentValue = stats.streakDays;
          break;
        case 'messages_edited':
          currentValue = stats.messagesEdited;
          break;
        case 'response_rate_30days':
          currentValue = stats.responseRate30d;
          break;
      }

      // Check if achievement is unlocked
      if (currentValue >= achievement.requirement.value) {
        newUnlocks.push(achievement);
        
        setProgress((prev) => ({
          ...prev,
          [achievement.id]: {
            currentValue,
            unlocked: true,
            unlockedAt: new Date().toISOString(),
          },
        }));
      } else {
        // Update progress
        setProgress((prev) => ({
          ...prev,
          [achievement.id]: {
            currentValue,
            unlocked: false,
          },
        }));
      }
    });

    if (newUnlocks.length > 0) {
      setNewlyUnlockedAchievements(newUnlocks);
      
      // Auto-clear after showing
      setTimeout(() => {
        setNewlyUnlockedAchievements([]);
      }, 5000);
    }
  }, [progress]);

  // Update stats and check achievements
  const updateStats = useCallback((updates: Partial<UserStats>) => {
    setUserStats((prev) => {
      const newStats = { ...prev, ...updates };
      checkAchievements(newStats);
      return newStats;
    });
  }, [checkAchievements]);

  const getUnlockedAchievements = useCallback(() => {
    return TRAINER_ACHIEVEMENTS.filter(
      (achievement) => progress[achievement.id]?.unlocked
    );
  }, [progress]);

  const getAchievementProgress = useCallback((achievementId: string) => {
    return progress[achievementId] || { currentValue: 0, unlocked: false };
  }, [progress]);

  return {
    progress,
    userStats,
    newlyUnlockedAchievements,
    updateStats,
    getUnlockedAchievements,
    getAchievementProgress,
  };
}
