export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogMeta {
  correlationId?: string;
  [key: string]: unknown;
}

export interface Logger {
  debug: (message: string, meta?: LogMeta) => void;
  info: (message: string, meta?: LogMeta) => void;
  warn: (message: string, meta?: LogMeta) => void;
  error: (message: string, meta?: LogMeta) => void;
  child: (meta: LogMeta) => Logger;
  correlationId: string;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const DEFAULT_LEVEL = (Deno.env.get('LOG_LEVEL') as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[DEFAULT_LEVEL];
}

function randomId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function getRequestCorrelationId(req: Request): string {
  return (
    req.headers.get('x-correlation-id') ||
    req.headers.get('x-request-id') ||
    req.headers.get('x-amzn-trace-id') ||
    `corr-${randomId()}`
  );
}

export function createLogger(functionName: string, correlationId?: string, baseMeta: LogMeta = {}): Logger {
  const resolvedCorrelationId = correlationId || baseMeta.correlationId || `corr-${randomId()}`;

  const log = (level: LogLevel, message: string, meta: LogMeta = {}) => {
    if (!shouldLog(level)) return;

    const payload = {
      ts: new Date().toISOString(),
      level,
      function: functionName,
      correlationId: resolvedCorrelationId,
      message,
      ...baseMeta,
      ...meta,
    };

    if (level === 'error') {
      console.error(JSON.stringify(payload));
    } else if (level === 'warn') {
      console.warn(JSON.stringify(payload));
    } else {
      console.log(JSON.stringify(payload));
    }
  };

  const child = (meta: LogMeta): Logger => createLogger(functionName, resolvedCorrelationId, { ...baseMeta, ...meta });

  return {
    debug: (message, meta) => log('debug', message, meta),
    info: (message, meta) => log('info', message, meta),
    warn: (message, meta) => log('warn', message, meta),
    error: (message, meta) => log('error', message, meta),
    child,
    correlationId: resolvedCorrelationId,
  };
}
