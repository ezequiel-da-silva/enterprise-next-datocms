import {
  buildErrorLog,
  type ErrorLogInput,
  type LogContextValue,
  type LogLevel,
} from "@/lib/observability/format-error-log";

export type LogOptions = {
  error?: unknown;
  detail?: string;
  context?: Record<string, LogContextValue>;
};

function emit(level: LogLevel, scope: string, message: string, options: LogOptions = {}): void {
  const input: ErrorLogInput = {
    level,
    scope,
    message,
    ...options,
    isProduction: process.env.NODE_ENV === "production",
  };
  // One JSON line: Vercel Runtime Logs and Log Drains index its fields, so alerts can filter on `scope`.
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    env: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    ...buildErrorLog(input),
  });
  if (level === "warn") console.warn(line);
  else console.error(line);
}

/** Single entry point for critical server errors; never put tokens, codes or emails in `context`. */
export function logError(scope: string, message: string, options?: LogOptions): void {
  emit("error", scope, message, options);
}

/** Expected-but-notable failures (rejected logins, fallbacks) that should not page anyone. */
export function logWarn(scope: string, message: string, options?: LogOptions): void {
  emit("warn", scope, message, options);
}
