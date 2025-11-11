import { createLogger, Logger } from './logger.ts';

export interface FetchRetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  retryOnStatuses?: number[];
  logger?: Logger;
  correlationId?: string;
  functionName?: string;
}

const DEFAULT_RETRY_STATUSES = [408, 425, 429, 500, 502, 503, 504];

function isRetryableStatus(status: number, retryOnStatuses: number[]): boolean {
  return retryOnStatuses.includes(status);
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  url: string,
  init: RequestInit = {},
  options: FetchRetryOptions = {},
): Promise<Response> {
  const {
    maxRetries = 3,
    baseDelayMs = 300,
    maxDelayMs = 5_000,
    retryOnStatuses = DEFAULT_RETRY_STATUSES,
    logger = createLogger(options.functionName ?? 'fetchWithRetry', options.correlationId),
  } = options;

  let attempt = 0;

  while (true) {
    attempt += 1;
    try {
      const response = await fetch(url, init);

      if (!isRetryableStatus(response.status, retryOnStatuses) || attempt > maxRetries) {
        if (!response.ok) {
          logger.warn('HTTP request completed with non-OK status', {
            status: response.status,
            attempt,
            url,
          });
        }
        return response;
      }

      const delay = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1)) + Math.random() * 100;
      logger.warn('Retrying HTTP request due to retryable status', {
        status: response.status,
        attempt,
        delay,
        url,
      });
      await sleep(delay);
      continue;
    } catch (error) {
      if (attempt > maxRetries) {
        logger.error('HTTP request failed after max retries', {
          attempt,
          url,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }

      const delay = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1)) + Math.random() * 100;
      logger.warn('Retrying HTTP request due to network error', {
        attempt,
        delay,
        url,
        error: error instanceof Error ? error.message : String(error),
      });
      await sleep(delay);
    }
  }
}
