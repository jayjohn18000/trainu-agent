// Feature flags for controlling UI visibility of future/beta features
// Infrastructure for these features is preserved but hidden from UI

export const FEATURES = {
  CREATORS_MODULE: false,      // Creator briefs & proposals system
  WORKOUT_LOGGER: false,        // Detailed workout tracking
  PROGRAMS_MODULE: false,       // Program templates library
  AFFILIATE_ADVANCED: false,    // CSV import, admin purchase management
} as const;

export type FeatureKey = keyof typeof FEATURES;

export function isFeatureEnabled(feature: FeatureKey): boolean {
  return FEATURES[feature];
}
