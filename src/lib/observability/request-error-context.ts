import type { LogContextValue } from "@/lib/observability/format-error-log";

/** Structural subset of Next's `onRequestError` arguments, so `lib/` stays free of Next imports. */
export type RequestErrorRequest = { path: string; method: string };
export type RequestErrorRouteContext = {
  routePath: string;
  renderSource?: string;
  revalidateReason?: string;
};

function digestOf(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("digest" in error)) return undefined;
  return typeof error.digest === "string" ? error.digest : undefined;
}

/**
 * Log context for an unhandled request error. The query string is dropped (the OAuth callback carries
 * `code`/`state` there) and headers are never read (cookies, authorization).
 */
export function requestErrorContext(
  error: unknown,
  request: RequestErrorRequest,
  context: RequestErrorRouteContext,
): Record<string, LogContextValue> {
  return {
    path: request.path.split("?")[0],
    method: request.method,
    routePath: context.routePath,
    renderSource: context.renderSource,
    revalidateReason: context.revalidateReason,
    digest: digestOf(error),
  };
}
