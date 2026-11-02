import { logError } from "@/infra/observability/log-error";
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
  if (!header || !/^Bearer\s+/i.test(header)) return null;
  return header.replace(/^Bearer\s+/i, "").trim();
}

function notConfigured(missing: string[]): NextResponse {
  logError("webhook.datocms.product-page", "Missing environment variables", {
    context: { missing: missing.join(",") },
  });
  return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
}

function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/**
 * Webhook Dato `product_page` (publish/update) → título e descrição Shopify (EN + PT/ES).
 * Auth: mesmo secret que `/api/revalidate` (`Authorization: Bearer`).
 * Token Admin: client credentials (cache) ou `SHOPIFY_ADMIN_ACCESS_TOKEN` opcional.
 */
export async function POST(request: NextRequest) {
  const expected = getExpectedSecret();
  if (!expected) {
    return notConfigured(["DATOCMS_REVALIDATE_SECRET"]);
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
    descriptionEn: sync.descriptionEn,
    descriptionPt: sync.descriptionPt,
    descriptionEs: sync.descriptionEs,
  });
  if (!result.ok) {
    if (result.reason === "not_configured") {
      return notConfigured(result.missing);
    }
    logError("webhook.datocms.product-page", "Sync failed", {
      detail: result.detail,
      context: { reason: result.reason },
    });
    return NextResponse.json({ error: "Sync failed", detail: result.detail }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    skipped: result.skipped,
    ...(result.warnings.length > 0 ? { warnings: result.warnings } : {}),
  });
}
