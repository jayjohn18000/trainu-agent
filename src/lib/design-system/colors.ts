/**
 * Design System Color Utilities
 * 
 * These utilities enforce semantic color usage throughout the application.
 * NEVER use hardcoded Tailwind colors like bg-green-50, text-gray-500, etc.
 * Always use these semantic variants.
 */

/**
 * Risk level color variants
 */
export const riskVariants = {
  low: 'bg-success/10 text-success border-success/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  high: 'bg-danger/10 text-danger border-danger/20',
} as const;

/**
 * Status color variants
 */
export const statusColors = {
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  danger: 'bg-danger text-danger-foreground',
  info: 'bg-info text-info-foreground',
} as const;

/**
 * Helper to get risk variant based on numeric risk score
 */
export function getRiskVariant(risk: number): keyof typeof riskVariants {
  if (risk <= 33) return 'low';
  if (risk <= 66) return 'medium';
  return 'high';
}

/**
 * Status badge color variants (muted backgrounds)
 */
export const statusBadgeVariants = {
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  info: 'bg-info/10 text-info border-info/20',
  active: 'bg-primary/10 text-primary border-primary/20',
  paused: 'bg-muted text-muted-foreground border-border',
  churnRisk: 'bg-danger/10 text-danger border-danger/20',
} as const;

