export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type AchievementCategory = 'efficiency' | 'client-success' | 'consistency' | 'quality';

export interface TrainerAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: AchievementTier;
  category: AchievementCategory;
  xpReward: number;
  requirement: {
    type: string;
    value: number;
  };
}

export const TRAINER_ACHIEVEMENTS: TrainerAchievement[] = [
  // Efficiency
  {
    id: 'ach_time_saver_bronze',
    name: 'Time Saver',
    description: 'Save 10 hours total with agent assistance',
    icon: '⏱️',
    tier: 'bronze',
    category: 'efficiency',
    xpReward: 100,
    requirement: { type: 'time_saved_hours', value: 10 },
  },
  {
    id: 'ach_time_saver_silver',
    name: 'Time Saver Pro',
    description: 'Save 50 hours total with agent assistance',
    icon: '⏱️',
    tier: 'silver',
    category: 'efficiency',
    xpReward: 250,
    requirement: { type: 'time_saved_hours', value: 50 },
  },
  {
    id: 'ach_time_saver_gold',
    name: 'Time Saver Master',
    description: 'Save 100 hours total with agent assistance',
    icon: '⏱️',
    tier: 'gold',
    category: 'efficiency',
    xpReward: 500,
    requirement: { type: 'time_saved_hours', value: 100 },
  },
  {
    id: 'ach_speed_demon',
    name: 'Speed Demon',
    description: 'Approve 50 messages in one day',
    icon: '⚡',
    tier: 'silver',
    category: 'efficiency',
    xpReward: 200,
    requirement: { type: 'messages_per_day', value: 50 },
  },
  {
    id: 'ach_automation_master',
    name: 'Automation Master',
    description: 'Maintain a 30-day streak of daily approvals',
    icon: '🤖',
    tier: 'gold',
    category: 'efficiency',
    xpReward: 400,
    requirement: { type: 'approval_streak_days', value: 30 },
  },

  // Client Success
  {
    id: 'ach_engagement_pro_bronze',
    name: 'Engagement Pro',
    description: 'Get 10 at-risk clients to respond',
    icon: '💬',
    tier: 'bronze',
    category: 'client-success',
    xpReward: 150,
    requirement: { type: 'at_risk_engaged', value: 10 },
  },
  {
    id: 'ach_engagement_pro_silver',
    name: 'Engagement Expert',
    description: 'Get 50 at-risk clients to respond',
    icon: '💬',
    tier: 'silver',
    category: 'client-success',
    xpReward: 300,
    requirement: { type: 'at_risk_engaged', value: 50 },
  },
  {
    id: 'ach_conversion_king',
    name: 'Conversion King',
    description: 'Generate 25 bookings from nudges',
    icon: '👑',
    tier: 'silver',
    category: 'client-success',
    xpReward: 350,
    requirement: { type: 'bookings_from_nudges', value: 25 },
  },
  {
    id: 'ach_retention_champion',
    name: 'Retention Champion',
    description: 'Maintain 90% retention for 3 months',
    icon: '🏆',
    tier: 'gold',
    category: 'client-success',
    xpReward: 500,
    requirement: { type: 'retention_rate_90days', value: 90 },
  },

  // Consistency
  {
    id: 'ach_week_warrior',
    name: 'Week Warrior',
    description: 'Approve messages for 7 days straight',
    icon: '🔥',
    tier: 'bronze',
    category: 'consistency',
    xpReward: 100,
    requirement: { type: 'streak_days', value: 7 },
  },
  {
    id: 'ach_month_master',
    name: 'Month Master',
    description: 'Approve messages for 30 days straight',
    icon: '📅',
    tier: 'silver',
    category: 'consistency',
    xpReward: 300,
    requirement: { type: 'streak_days', value: 30 },
  },
  {
    id: 'ach_always_on',
    name: 'Always On',
    description: 'Approve messages for 90 days straight',
    icon: '🌟',
    tier: 'gold',
    category: 'consistency',
    xpReward: 600,
    requirement: { type: 'streak_days', value: 90 },
  },

  // Quality
  {
    id: 'ach_editors_choice',
    name: "Editor's Choice",
    description: 'Edit 25 messages to personalize them',
    icon: '✏️',
    tier: 'bronze',
    category: 'quality',
    xpReward: 100,
    requirement: { type: 'messages_edited', value: 25 },
  },
  {
    id: 'ach_wordsmith',
    name: 'Wordsmith',
    description: 'Edit 100 messages with 90%+ confidence',
    icon: '📝',
    tier: 'silver',
    category: 'quality',
    xpReward: 250,
    requirement: { type: 'quality_edits', value: 100 },
  },
  {
    id: 'ach_master_communicator',
    name: 'Master Communicator',
    description: 'Achieve 95% response rate for 30 days',
    icon: '💎',
    tier: 'gold',
    category: 'quality',
    xpReward: 500,
    requirement: { type: 'response_rate_30days', value: 95 },
  },
];

export function getAchievementsByCategory(category: AchievementCategory) {
  return TRAINER_ACHIEVEMENTS.filter(a => a.category === category);
}

export function getAchievementsByTier(tier: AchievementTier) {
  return TRAINER_ACHIEVEMENTS.filter(a => a.tier === tier);
}

export function checkAchievementUnlock(achievementId: string, currentValue: number): boolean {
  const achievement = TRAINER_ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) return false;
  return currentValue >= achievement.requirement.value;
}
