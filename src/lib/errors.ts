/**
 * Centralized Error Handling
 * 
 * Provides custom error classes and utilities for consistent error handling
 * throughout the application.
 */

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends Error {
  constructor(resource?: string) {
    const message = resource ? `${resource} not found` : 'Resource not found';
    super(message);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Gets a user-friendly error message from any error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof APIError) {
    return error.message;
  }
  if (error instanceof ValidationError) {
    return error.message;
  }
  if (error instanceof NotFoundError) {
    return error.message;
  }
  if (error instanceof UnauthorizedError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

/**
 * Checks if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof APIError) {
    // 5xx errors are server errors and can be retried
    // 429 is rate limiting, can be retried
    return error.statusCode >= 500 || error.statusCode === 429;
  }
  if (error instanceof NotFoundError) {
    return false;
  }
  if (error instanceof UnauthorizedError) {
    return false;
  }
  if (error instanceof ValidationError) {
    return false;
  }
  // Network errors might be retryable
  return error instanceof Error && error.name === 'NetworkError';
}

