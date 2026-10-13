export type LogLevel = "error" | "warn";

export type LogContextValue = string | number | boolean | null | undefined;

export type ErrorLogInput = {
  level: LogLevel;
  /** Stable dot-separated id (`webhook.shopify.product`) so Vercel log filters and alerts can match it. */
  scope: string;
  message: string;
  error?: unknown;
  /** Kept in production on purpose (e.g. the Shopify message that names a missing scope). */
  detail?: string;
  context?: Record<string, LogContextValue>;
  isProduction: boolean;
};

export type ErrorLogEntry = {
  level: LogLevel;
  scope: string;
  message: string;
  detail?: string;
  context?: Record<string, string | number | boolean | null>;
  error?: { name: string; message?: string; stack?: string };
};

const MAX_DETAIL = 500;
const MAX_CONTEXT_VALUE = 200;
const SENSITIVE_KEY = /token|secret|authorization|password|cookie|email/i;

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

function describeError(error: unknown, isProduction: boolean): ErrorLogEntry["error"] {
  const name = error instanceof Error ? error.name : typeof error;
  // Raw messages and stacks can carry request payloads or tokens; only dev gets them.
  if (isProduction || !(error instanceof Error)) return { name };
  return { name, message: error.message, stack: error.stack };
}

function sanitizeContext(context: ErrorLogInput["context"]): ErrorLogEntry["context"] {
  if (!context) return undefined;
  const entries = Object.entries(context).flatMap(([key, value]) => {
    if (SENSITIVE_KEY.test(key) || value === undefined) return [];
    return [[key, typeof value === "string" ? truncate(value, MAX_CONTEXT_VALUE) : value] as const];
  });
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

/** Pure: shapes one structured log entry. No I/O, so it stays testable and safe for `lib/`. */
export function buildErrorLog(input: ErrorLogInput): ErrorLogEntry {
  const entry: ErrorLogEntry = { level: input.level, scope: input.scope, message: input.message };
  if (input.detail) entry.detail = truncate(input.detail, MAX_DETAIL);
  const context = sanitizeContext(input.context);
  if (context) entry.context = context;
  if (input.error !== undefined) entry.error = describeError(input.error, input.isProduction);
  return entry;
}
