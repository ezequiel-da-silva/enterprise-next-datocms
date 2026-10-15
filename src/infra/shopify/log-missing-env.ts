import { logError } from "@/infra/observability/log-error";

/** Only variable names reach the log, never their values. */
function logMissingEnv(scope: string, missing: string[]): void {
  logError(scope, "Missing environment variables", { context: { missing: missing.join(",") } });
}

export function logMissingShopifyAdminEnv(missing: string[]): void {
  logMissingEnv("shopify.env.admin", missing);
}

export function logMissingShopifyWebhookEnv(missing: string[]): void {
  logMissingEnv("shopify.env.webhook", missing);
}
