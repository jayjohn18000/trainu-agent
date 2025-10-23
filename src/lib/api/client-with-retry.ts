import { supabase } from "@/integrations/supabase/client";

/**
 * Rate limiting configuration
 */
const RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 1000, // 1 second
};

/**
 * Retry configuration
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 5000,
  backoffMultiplier: 2,
};

/**
 * Rate limiter using token bucket algorithm
 */
class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxTokens = maxRequests;
    this.tokens = maxRequests;
    this.lastRefill = Date.now();
    this.refillRate = maxRequests / windowMs;
  }

  private refill() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = timePassed * this.refillRate;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  async acquire(): Promise<void> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    // Wait until token available
    const waitTime = (1 - this.tokens) / this.refillRate;
    await new Promise(resolve => setTimeout(resolve, waitTime));
    this.tokens = 0;
  }
}

const rateLimiter = new RateLimiter(RATE_LIMIT.maxRequests, RATE_LIMIT.windowMs);

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function getBackoffDelay(attempt: number): number {
  const delay = RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any): boolean {
  // Network errors
  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return true;
  }

  // Rate limit errors
  if (error.status === 429) {
    return true;
  }

  // Server errors (5xx)
  if (error.status >= 500 && error.status < 600) {
    return true;
  }

  return false;
}

/**
 * Enhanced Supabase client with retry logic and rate limiting
 */
export async function supabaseFunctionWithRetry<T>(
  functionName: string,
  options?: {
    body?: any;
    method?: 'POST' | 'GET' | 'PUT' | 'DELETE';
  }
): Promise<{ data: T | null; error: any }> {
  let lastError: any = null;

  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      // Apply rate limiting
      await rateLimiter.acquire();

      // Make the request
      const { data, error } = await supabase.functions.invoke(functionName, options);

      // Success
      if (!error) {
        return { data: data as T, error: null };
      }

      // Check if error is retryable
      if (!isRetryableError(error)) {
        return { data: null, error };
      }

      lastError = error;

      // Wait before retry (except on last attempt)
      if (attempt < RETRY_CONFIG.maxRetries - 1) {
        const delay = getBackoffDelay(attempt);
        console.log(`Retrying ${functionName} in ${delay}ms (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries})`);
        await sleep(delay);
      }
    } catch (error) {
      lastError = error;
      
      // Check if error is retryable
      if (!isRetryableError(error)) {
        return { data: null, error };
      }

      // Wait before retry (except on last attempt)
      if (attempt < RETRY_CONFIG.maxRetries - 1) {
        const delay = getBackoffDelay(attempt);
        console.log(`Retrying ${functionName} in ${delay}ms (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries})`);
        await sleep(delay);
      }
    }
  }

  return { data: null, error: lastError };
}

/**
 * Enhanced auth check with retry
 */
export async function getAuthenticatedUser() {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (!error && data.user) {
        return { user: data.user, error: null };
      }

      if (error && !isRetryableError(error)) {
        return { user: null, error };
      }

      if (attempt < 2) {
        await sleep(getBackoffDelay(attempt));
      }
    } catch (error) {
      if (attempt === 2) {
        return { user: null, error };
      }
      await sleep(getBackoffDelay(attempt));
    }
  }

  return { user: null, error: new Error('Failed to authenticate after retries') };
}
