/**
 * Stripe Configuration and Plan Mapping
 */

export const STRIPE_PLANS = {
  STARTER: {
    priceId: 'price_starter',
    checkoutUrl: 'https://buy.stripe.com/28E4gB5M31lP4eP8I2frW00',
    amount: 79,
    tier: 'starter' as const,
    name: 'Starter',
    description: 'Essential CRM powered by GHL',
  },
  PROFESSIONAL: {
    priceId: 'price_professional',
    checkoutUrl: 'https://buy.stripe.com/9B600lcarfcF8v5gaufrW01',
    amount: 99,
    tier: 'professional' as const,
    name: 'Professional',
    description: 'Unlimited scale with advanced automation',
  },
  GROWTH: {
    priceId: 'price_growth',
    checkoutUrl: 'https://buy.stripe.com/00waEZ3DV0hL6mX2jEfrW02',
    amount: 497,
    tier: 'growth' as const,
    name: 'Growth',
    description: 'Full GHL suite for teams',
  },
} as const;

export type StripePlanKey = keyof typeof STRIPE_PLANS;
export type PlanTier = typeof STRIPE_PLANS[StripePlanKey]['tier'];

/**
 * Get plan configuration by tier
 */
export function getPlanByTier(tier: string) {
  return Object.values(STRIPE_PLANS).find(plan => plan.tier === tier);
}

/**
 * Get plan configuration by price ID
 */
export function getPlanByPriceId(priceId: string) {
  return Object.values(STRIPE_PLANS).find(plan => plan.priceId === priceId);
}

/**
 * Get Stripe checkout URL with success/cancel redirects
 * Success URL should point to /onboarding?tier={tier} for OAuth flow
 */
export function getStripeCheckoutUrl(
  tier: PlanTier,
  baseUrl: string = window.location.origin
): string {
  const plan = getPlanByTier(tier);
  if (!plan) {
    throw new Error(`Unknown plan tier: ${tier}`);
  }

  // Stripe checkout URLs have success_url and cancel_url as query params
  const successUrl = `${baseUrl}/onboarding?tier=${tier}&payment=success`;
  const cancelUrl = `${baseUrl}/pricing?payment=cancelled`;
  
  // Note: Stripe checkout link format may vary
  // You may need to configure these URLs in your Stripe Dashboard
  // For now, returning the base checkout URL
  return plan.checkoutUrl;
}

