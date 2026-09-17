import { pushShopifyCollectionCopy } from "@/infra/shopify/admin-collection-copy";
import { parseCollectionPageTitleSync } from "@/lib/datocms/parse-collection-page-title-sync";
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
 * Webhook Dato `collection_page` (publish/update) → título e descrição Shopify (EN + PT/ES).
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

  const sync = parseCollectionPageTitleSync(parsed);
  if (!sync) {
    return NextResponse.json({ success: true, skipped: true });
  }

  const result = await pushShopifyCollectionCopy(sync.shopifyCollectionId, {
    en: sync.titleEn,
    ptBR: sync.titlePt,
    es: sync.titleEs,
    descriptionEn: sync.descriptionEn,
    descriptionPt: sync.descriptionPt,
    descriptionEs: sync.descriptionEs,
  });
  if (!result.ok) {
    if (result.reason === "not_configured") {
      return NextResponse.json({ error: "Webhook not configured", missing: result.missing }, { status: 500 });
    }
    return NextResponse.json({ error: "Sync failed", detail: result.detail }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    skipped: result.skipped,
    ...(result.warnings.length > 0 ? { warnings: result.warnings } : {}),
  });
}
