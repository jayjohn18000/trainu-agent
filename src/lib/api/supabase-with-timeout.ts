import { supabase } from "@/integrations/supabase/client";

const DEFAULT_TIMEOUT = 30000; // 30 seconds

export class TimeoutError extends Error {
  constructor(message = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Invoke a Supabase edge function with timeout support
 */
export async function invokeWithTimeout<T = any>(
  functionName: string,
  options?: {
    body?: any;
    timeout?: number;
    headers?: Record<string, string>;
  }
): Promise<{ data: T | null; error: any }> {
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
  
  return new Promise((resolve) => {
    let resolved = false;
    
    // Set up timeout
    const timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.error(`Request to ${functionName} timed out after ${timeout}ms`);
        resolve({ 
          data: null, 
          error: new TimeoutError(`Request timed out after ${timeout / 1000} seconds`) 
        });
      }
    }, timeout);
    
    // Make the actual request
    supabase.functions.invoke<T>(functionName, {
      body: options?.body,
      headers: options?.headers,
    }).then((result) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutId);
        resolve(result);
      }
    }).catch((error) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutId);
        resolve({ data: null, error });
      }
    });
  });
}

/**
 * Creates a promise that rejects after the specified timeout
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new TimeoutError(errorMessage));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}
