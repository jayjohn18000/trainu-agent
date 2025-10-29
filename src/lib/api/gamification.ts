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
  const { data, error } = await supabase.functions.invoke('gamification');

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
  // Validate inputs before making the request
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new Error('Amount must be a valid number');
  }
  if (typeof reason !== 'string' || !reason.trim()) {
    throw new Error('Reason must be a non-empty string');
  }

  const { data, error } = await supabase.functions.invoke('gamification', {
    body: { amount, reason: reason.trim() },
    method: 'POST',
  });

  if (error) throw error;
  return data;
}

/**
 * Get all achievements
 */
export async function getAchievements(): Promise<{ achievements: Achievement[] }> {
  const { data, error } = await supabase.functions.invoke('gamification');

  if (error) throw error;
  return data;
}
