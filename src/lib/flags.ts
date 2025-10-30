const FLAGS_KEY = 'trainu-feature-flags';

export interface FeatureFlags {
  COMMUNITY_ENABLED: boolean;
  AFFILIATE_ENABLED: boolean;
  CREATORS_ENABLED: boolean;
  GOALS_ENABLED: boolean;
  INBOX_ENABLED: boolean;
  ANALYTICS_ENABLED: boolean;
}

const defaultFlags: FeatureFlags = {
  COMMUNITY_ENABLED: true,
  AFFILIATE_ENABLED: true,
  CREATORS_ENABLED: true,
  GOALS_ENABLED: true,
  INBOX_ENABLED: true,
  ANALYTICS_ENABLED: true,
};

export function getFlags(): FeatureFlags {
  try {
    const stored = localStorage.getItem(FLAGS_KEY);
    if (stored) {
      return { ...defaultFlags, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to load feature flags:', e);
  }
  return defaultFlags;
}

export function setFlag(key: keyof FeatureFlags, value: boolean): void {
  const flags = getFlags();
  flags[key] = value;
  localStorage.setItem(FLAGS_KEY, JSON.stringify(flags));
  window.dispatchEvent(new CustomEvent('flags-changed'));
}

export function resetFlags(): void {
  localStorage.setItem(FLAGS_KEY, JSON.stringify(defaultFlags));
  window.dispatchEvent(new CustomEvent('flags-changed'));
}

// DB-backed flags (demo: per-trainer)
import { supabase } from "@/integrations/supabase/client";

export async function getDbFlag(flagName: string): Promise<boolean | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('feature_flags')
      .select('enabled')
      .eq('trainer_id', user.id)
      .eq('flag_name', flagName)
      .single();
    if (error) return null;
    return !!data?.enabled;
  } catch {
    return null;
  }
}

export async function setDbFlag(flagName: string, enabled: boolean): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('feature_flags').upsert({ trainer_id: user.id, flag_name: flagName, enabled });
  window.dispatchEvent(new CustomEvent('flags-changed'));
}