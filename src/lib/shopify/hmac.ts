import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Shopify envia `X-Shopify-Hmac-Sha256` em Base64 do HMAC-SHA256 do **corpo cru**.
 * Comparar buffers UTF-8 do Base64 (não `isSecretEqual`, que assume secrets de texto).
 */
export function isShopifyHmacValid(
  rawBody: string,
  header: string | null | undefined,
  secret: string,
): boolean {
  const received = header?.trim();
  const key = secret.trim();
  if (!received || !key) return false;

  const digest = createHmac("sha256", key).update(rawBody, "utf8").digest("base64");
  const a = Buffer.from(digest, "utf8");
  const b = Buffer.from(received, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
