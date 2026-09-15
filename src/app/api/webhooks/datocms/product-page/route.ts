import { pushShopifyProductTitle } from "@/infra/shopify/admin-product-title";
import { parseProductPageTitleSync } from "@/lib/datocms/parse-product-page-title-sync";
import { logMissingShopifyAdminEnv, readShopifyAdminEnv } from "@/lib/shopify/admin-env";
import { isSecretEqual } from "@/lib/security/compare-secret";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getExpectedSecret(): string | undefined {
  return process.env.DATOCMS_REVALIDATE_SECRET?.trim();
}

function readProvidedSecret(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (header && /^Bearer\s+/i.test(header)) {
    return header.replace(/^Bearer\s+/i, "").trim();
  }
  return request.nextUrl.searchParams.get("token");
}

function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/**
 * Webhook Dato `product_page` (publish/update) → `productUpdate` do título `en` na Shopify.
 * Auth: mesmo secret que `/api/revalidate` (`DATOCMS_REVALIDATE_SECRET`).
 * Não invalida cache — o webhook Next.js revalidate continua a fazê-lo.
 */
export async function POST(request: NextRequest) {
  const expected = getExpectedSecret();
  if (!expected) {
    return NextResponse.json({ error: "Webhook not configured", missing: ["DATOCMS_REVALIDATE_SECRET"] }, { status: 500 });
  }
  if (!isSecretEqual(readProvidedSecret(request), expected)) {
    return unauthorized();
  }

  let parsed: unknown;
  try {
    const raw = await request.text();
    parsed = raw.trim() ? JSON.parse(raw) : null;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sync = parseProductPageTitleSync(parsed);
  if (!sync) {
    return NextResponse.json({ success: true, skipped: true });
  }

  const adminEnv = readShopifyAdminEnv();
  if (!adminEnv.ok) {
    logMissingShopifyAdminEnv(adminEnv.missing);
    return NextResponse.json({ error: "Webhook not configured", missing: adminEnv.missing }, { status: 500 });
  }

  const result = await pushShopifyProductTitle(sync.shopifyProductId, sync.titleEn);
  if (!result.ok) {
    if (result.reason === "not_configured") {
      return NextResponse.json(
        { error: "Webhook not configured", missing: ["SHOPIFY_ADMIN_ACCESS_TOKEN"] },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true, skipped: result.skipped });
}
