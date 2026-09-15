import { z } from "zod";
import { normalizeShopDomain } from "@/lib/shopify/parse-product-webhook";

const requiredString = z.string().trim().min(1);

const shopifyAdminEnvSchema = z.object({
  SHOPIFY_STORE_DOMAIN: requiredString.transform(normalizeShopDomain),
  SHOPIFY_ADMIN_ACCESS_TOKEN: requiredString,
});

export type ShopifyAdminEnv = z.infer<typeof shopifyAdminEnvSchema>;

function missingKeys(error: z.ZodError): string[] {
  const keys = new Set<string>();
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string") keys.add(key);
  }
  return [...keys].sort();
}

/** Admin GraphQL no servidor (Dato → título Shopify). Nunca `NEXT_PUBLIC_*`. */
export function readShopifyAdminEnv():
  | { ok: true; data: ShopifyAdminEnv }
  | { ok: false; missing: string[] } {
  const parsed = shopifyAdminEnvSchema.safeParse({
    SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
    SHOPIFY_ADMIN_ACCESS_TOKEN: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
  });
  if (parsed.success) return { ok: true, data: parsed.data };
  return { ok: false, missing: missingKeys(parsed.error) };
}

export function logMissingShopifyAdminEnv(missing: string[]): void {
  console.error(
    `[shopify admin] Missing environment variable${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}`,
  );
}
