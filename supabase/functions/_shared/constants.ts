// Shared constants for Edge Functions

// Rate limiting
export const RATE_LIMIT_PER_HOUR = 50;
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Batch sizes
export const DISPATCHER_BATCH_SIZE = 100;
export const BACKFILL_BATCH_SIZE = 100;

// Allowed tables for DSL queries (prevent SQL injection)
export const ALLOWED_TABLES = [
  'clients',
  'drafts',
  'trainer_profiles',
  'payments_view',
  'saved_queries',
  'segments',
  'segment_rules',
];

// Quiet hours (UTC)
export const QUIET_HOURS_START = 22; // 10 PM
export const QUIET_HOURS_END = 4;    // 4 AM
export const QUIET_HOURS_RESUME = 5; // 4:05 AM (with 5 minute buffer)

