import { supabase } from '@/integrations/supabase/client';

export interface GameProgress {
  level: number;
  xp: number;
  nextLevelXp: number;
  progress: number;
  currentStreak: number;
  longestStreak: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
}

/**
 * Get current gamification progress
 */
export async function getProgress(): Promise<GameProgress> {
  const { data, error } = await supabase.functions.invoke('gamification', {
    body: {},
    method: 'GET',
  });

  if (error) throw error;
  return data;
}

/**
 * Award XP to the trainer
 */
export async function awardXP(amount: number, reason: string): Promise<{
  success: boolean;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
  newAchievements: Achievement[];
}> {
  const { data, error } = await supabase.functions.invoke('gamification', {
    body: { amount, reason },
    method: 'POST',
  });

  if (error) throw error;
  return data;
}

/**
 * Get all achievements
 */
export async function getAchievements(): Promise<{ achievements: Achievement[] }> {
  const { data, error } = await supabase.functions.invoke('gamification', {
    body: {},
    method: 'GET',
  });

  if (error) throw error;
  return data;
}
