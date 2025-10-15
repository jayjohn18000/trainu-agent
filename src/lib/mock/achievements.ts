import type { Achievement } from './types';

export const achievementDefinitions: Omit<Achievement, 'userId' | 'unlockedAt'>[] = [
  // Streak Achievements
  {
    id: 'ach_streak_2',
    name: '2 Week Warrior',
    description: 'Maintain a 2-week training streak',
    icon: '🔥',
    tier: 'bronze',
    xpReward: 50,
  },
  {
    id: 'ach_streak_4',
    name: 'Month Master',
    description: 'Maintain a 4-week training streak',
    icon: '🔥',
    tier: 'silver',
    xpReward: 100,
  },
  {
    id: 'ach_streak_8',
    name: 'Consistency King',
    description: 'Maintain an 8-week training streak',
    icon: '👑',
    tier: 'gold',
    xpReward: 250,
  },
  {
    id: 'ach_streak_12',
    name: 'Unstoppable',
    description: 'Maintain a 12-week training streak',
    icon: '💎',
    tier: 'platinum',
    xpReward: 500,
  },

  // Level Achievements
  {
    id: 'ach_level_5',
    name: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    tier: 'bronze',
    xpReward: 100,
  },
  {
    id: 'ach_level_10',
    name: 'Elite Athlete',
    description: 'Reach level 10',
    icon: '💪',
    tier: 'silver',
    xpReward: 200,
  },
  {
    id: 'ach_level_20',
    name: 'Legendary',
    description: 'Reach level 20',
    icon: '🏆',
    tier: 'gold',
    xpReward: 500,
  },
  {
    id: 'ach_level_50',
    name: 'Fitness God',
    description: 'Reach level 50',
    icon: '⚡',
    tier: 'platinum',
    xpReward: 1000,
  },

  // Session Achievements
  {
    id: 'ach_sessions_10',
    name: 'Getting Started',
    description: 'Complete 10 training sessions',
    icon: '✅',
    tier: 'bronze',
    xpReward: 50,
  },
  {
    id: 'ach_sessions_25',
    name: 'Dedicated',
    description: 'Complete 25 training sessions',
    icon: '💯',
    tier: 'silver',
    xpReward: 100,
  },
  {
    id: 'ach_sessions_50',
    name: 'Committed',
    description: 'Complete 50 training sessions',
    icon: '🎯',
    tier: 'gold',
    xpReward: 200,
  },
  {
    id: 'ach_sessions_100',
    name: 'Century Club',
    description: 'Complete 100 training sessions',
    icon: '💎',
    tier: 'platinum',
    xpReward: 500,
  },

  // Workout Logger Achievements
  {
    id: 'ach_workout_first',
    name: 'First Steps',
    description: 'Log your first workout',
    icon: '🏋️',
    tier: 'bronze',
    xpReward: 25,
  },
  {
    id: 'ach_sets_100',
    name: 'Volume King',
    description: 'Complete 100 sets',
    icon: '📊',
    tier: 'silver',
    xpReward: 150,
  },
  {
    id: 'ach_pr_first',
    name: 'Personal Best',
    description: 'Set your first personal record',
    icon: '🎖️',
    tier: 'bronze',
    xpReward: 75,
  },

  // Progress Tracking Achievements
  {
    id: 'ach_photo_first',
    name: 'Picture Perfect',
    description: 'Upload your first progress photo',
    icon: '📸',
    tier: 'bronze',
    xpReward: 40,
  },
  {
    id: 'ach_measurements_10',
    name: 'Data Driven',
    description: 'Log measurements 10 times',
    icon: '📏',
    tier: 'silver',
    xpReward: 100,
  },

  // Social Achievements
  {
    id: 'ach_community_join',
    name: 'Welcome!',
    description: 'Join the community',
    icon: '🤝',
    tier: 'bronze',
    xpReward: 25,
  },
  {
    id: 'ach_messages_25',
    name: 'Social Butterfly',
    description: 'Send 25 messages',
    icon: '💬',
    tier: 'silver',
    xpReward: 75,
  },

  // Challenge Achievements
  {
    id: 'ach_challenge_first',
    name: 'Challenge Accepted',
    description: 'Complete your first challenge',
    icon: '🎯',
    tier: 'bronze',
    xpReward: 50,
  },
  {
    id: 'ach_challenge_5',
    name: 'Challenge Master',
    description: 'Complete 5 challenges',
    icon: '🏅',
    tier: 'silver',
    xpReward: 150,
  },
];

export function getAchievementById(id: string) {
  return achievementDefinitions.find(a => a.id === id);
}
