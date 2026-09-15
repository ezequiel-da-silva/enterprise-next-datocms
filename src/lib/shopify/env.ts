import { z } from "zod";
import { DEFAULT_DATOCMS_ENVIRONMENT } from "@/lib/datocms/environment";

const requiredString = z.string().trim().min(1);

const shopifyWebhookEnvSchema = z.object({
  SHOPIFY_CLIENT_ID: requiredString,
  SHOPIFY_API_SECRET_KEY: requiredString,
  SHOPIFY_STORE_DOMAIN: requiredString,
  DATOCMS_USER_REVIEWS_CDA_TOKEN: requiredString,
  /** Ausente ou vazio → primary `main`. `develop` escolhe o sandbox. */
  DATOCMS_ENVIRONMENT: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : DEFAULT_DATOCMS_ENVIRONMENT)),
});

export type ShopifyWebhookEnv = z.infer<typeof shopifyWebhookEnvSchema>;

function missingKeys(error: z.ZodError): string[] {
  const keys = new Set<string>();
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string") keys.add(key);
  }
  return [...keys].sort();
}

/**
 * Env do webhook Dev Dashboard. CMA é `DATOCMS_USER_REVIEWS_CDA_TOKEN`
 * (nome histórico; o valor é um token CMA). `DATOCMS_API_TOKEN` é CDA.
 * `DATOCMS_ENVIRONMENT` escolhe o sandbox (`develop`); se faltar, o CMA usa `main`.
 */
export function readShopifyWebhookEnv():
  | { ok: true; data: ShopifyWebhookEnv }
  | { ok: false; missing: string[] } {
  const parsed = shopifyWebhookEnvSchema.safeParse({
    SHOPIFY_CLIENT_ID: process.env.SHOPIFY_CLIENT_ID,
    SHOPIFY_API_SECRET_KEY: process.env.SHOPIFY_API_SECRET_KEY,
    SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
    DATOCMS_USER_REVIEWS_CDA_TOKEN: process.env.DATOCMS_USER_REVIEWS_CDA_TOKEN,
    DATOCMS_ENVIRONMENT: process.env.DATOCMS_ENVIRONMENT,
  });
  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }
  return { ok: false, missing: missingKeys(parsed.error) };
}

export function logMissingShopifyWebhookEnv(missing: string[]): void {
  console.error(
    `[shopify webhook] Missing environment variable${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}`,
  );
}
