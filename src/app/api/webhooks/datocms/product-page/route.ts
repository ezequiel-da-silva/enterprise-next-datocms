import { pushShopifyProductTitle } from "@/infra/shopify/admin-product-title";
import { parseProductPageTitleSync } from "@/lib/datocms/parse-product-page-title-sync";
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
 * Webhook Dato `product_page` (publish/update) → títulos Shopify (EN + PT/ES).
 * Auth: mesmo secret que `/api/revalidate` (`DATOCMS_REVALIDATE_SECRET`).
 * Token Admin: client credentials (cache) ou `SHOPIFY_ADMIN_ACCESS_TOKEN` opcional.
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

  const result = await pushShopifyProductTitle(sync.shopifyProductId, {
    en: sync.titleEn,
    ptBR: sync.titlePt,
    es: sync.titleEs,
  });
  if (!result.ok) {
    if (result.reason === "not_configured") {
      return NextResponse.json({ error: "Webhook not configured", missing: result.missing }, { status: 500 });
    }
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true, skipped: result.skipped });
}
