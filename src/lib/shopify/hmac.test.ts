import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { isShopifyHmacValid } from "@/lib/shopify/hmac";

const SECRET = "shopify-webhook-secret";
const BODY = '{"id":42,"handle":"example","title":"Example"}';

function sign(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body, "utf8").digest("base64");
}

describe("isShopifyHmacValid", () => {
  it("accepts a matching Base64 HMAC of the raw body", () => {
    expect(isShopifyHmacValid(BODY, sign(BODY, SECRET), SECRET)).toBe(true);
  });

  it("rejects a wrong secret, truncated header, or empty values", () => {
    expect(isShopifyHmacValid(BODY, sign(BODY, "other"), SECRET)).toBe(false);
    expect(isShopifyHmacValid(BODY, sign(BODY, SECRET).slice(0, 8), SECRET)).toBe(false);
    expect(isShopifyHmacValid(BODY, null, SECRET)).toBe(false);
    expect(isShopifyHmacValid(BODY, sign(BODY, SECRET), "")).toBe(false);
  });
});
