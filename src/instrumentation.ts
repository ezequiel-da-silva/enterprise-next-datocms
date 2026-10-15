import type { Instrumentation } from "next";
import { logError } from "@/infra/observability/log-error";
import { requestErrorContext } from "@/lib/observability/request-error-context";

/** Unhandled server errors (render, route, action, proxy) as one JSON line; `digest` matches the error page. */
export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  logError(`next.${context.routeType}`, "Unhandled request error", {
    error,
    context: requestErrorContext(error, request, context),
  });
};
