// Centralized error handling for edge functions
// SECURITY: Prevents information leakage via verbose error messages

import { corsHeaders } from './responses.ts';

/**
 * Generates a unique error ID for tracking
 */
export function generateErrorId(): string {
  return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sanitizes error message to prevent PII/secret leakage
 */
function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Remove potential sensitive data patterns
    return error.message
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{10,}\b/g, '[PHONE]')
      .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '[UUID]')
      .replace(/sk_[a-zA-Z0-9_]+/g, '[API_KEY]')
      .replace(/Bearer\s+[a-zA-Z0-9\-._~+/]+=*/g, '[TOKEN]');
  }
  return 'Unknown error';
}

/**
 * Logs error with full details server-side
 */
export function logError(
  functionName: string,
  errorId: string,
  error: unknown,
  context?: Record<string, any>
) {
  console.error(JSON.stringify({
    function: functionName,
    errorId,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : String(error),
    context,
    timestamp: new Date().toISOString(),
  }));
}

/**
 * Returns a safe error response to the client
 * Logs full details server-side, returns generic message to client
 */
export function handleError(
  functionName: string,
  error: unknown,
  context?: Record<string, any>
): Response {
  const errorId = generateErrorId();
  
  // Log full details server-side
  logError(functionName, errorId, error, context);
  
  // Return safe message to client
  return new Response(
    JSON.stringify({ 
      error: 'An internal error occurred. Please contact support if the issue persists.',
      errorId 
    }),
    {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Returns a safe validation error response
 */
export function handleValidationError(message: string, field?: string): Response {
  return new Response(
    JSON.stringify({ 
      error: 'Validation failed',
      message,
      field 
    }),
    {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Returns a safe unauthorized error response
 */
export function handleUnauthorizedError(message?: string): Response {
  return new Response(
    JSON.stringify({ 
      error: message || 'Authentication required'
    }),
    {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Returns a safe forbidden error response
 */
export function handleForbiddenError(message?: string): Response {
  return new Response(
    JSON.stringify({ 
      error: message || 'Access denied'
    }),
    {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
