import { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * Creates a lazy-loaded component with retry logic for chunk load failures
 * Useful when network issues cause chunk loading to fail
 * 
 * @param factory - Function that returns a promise resolving to the component
 * @param retries - Number of retry attempts (default: 2)
 * @returns Lazy-loaded component
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retries = 2
): LazyExoticComponent<T> {
  const attempt = async (): Promise<{ default: T }> => {
    try {
      return await factory();
    } catch (error) {
      if (retries > 0) {
        console.warn(`Chunk load failed, retrying... (${retries} attempts remaining)`, error);
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Retry by calling factory again
        retries--;
        return attempt();
      }
      throw error;
    }
  };
  
  return lazy(attempt);
}

