import { z } from "zod";
import { normalizeShopDomain } from "@/lib/shopify/parse-product-webhook";

const requiredString = z.string().trim().min(1);

const shopifyAdminCredentialsSchema = z.object({
  SHOPIFY_STORE_DOMAIN: requiredString.transform(normalizeShopDomain),
  SHOPIFY_CLIENT_ID: requiredString,
  SHOPIFY_API_SECRET_KEY: requiredString,
});

export type ShopifyAdminCredentials = z.infer<typeof shopifyAdminCredentialsSchema>;

function missingKeys(error: z.ZodError): string[] {
  const keys = new Set<string>();
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string") keys.add(key);
  }
  return [...keys].sort();
}

/** Override de teste. Vazio/ausente → client credentials. */
export function readShopifyAdminTokenOverride(): string | undefined {
  const raw = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim();
  return raw || undefined;
}

/**
 * Credenciais para Admin GraphQL: domínio + app (client credentials).
 * `SHOPIFY_ADMIN_ACCESS_TOKEN` não entra aqui (opcional).
 */
export function readShopifyAdminCredentials():
  | { ok: true; data: ShopifyAdminCredentials }
  | { ok: false; missing: string[] } {
  const parsed = shopifyAdminCredentialsSchema.safeParse({
    SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
    SHOPIFY_CLIENT_ID: process.env.SHOPIFY_CLIENT_ID,
    SHOPIFY_API_SECRET_KEY: process.env.SHOPIFY_API_SECRET_KEY,
  });
  if (parsed.success) return { ok: true, data: parsed.data };
  return { ok: false, missing: missingKeys(parsed.error) };
}

export function logMissingShopifyAdminEnv(missing: string[]): void {
  console.error(
    `[shopify admin] Missing environment variable${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}`,
  );
}
