import { clientIpKey } from "@/app/api/account/account-route-utils";
import { isAppLocale, type AppLocale } from "@/constants/i18n";
import { getProductPageCards } from "@/infra/datocms/get-product-pages";
import { checkRateLimit } from "@/infra/security/rate-limit";
import { getStorefrontProductsByHandles } from "@/infra/shopify/storefront";
import { enrichCatalogProducts } from "@/lib/datocms/resolve-products-section";
import { draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const RATE_LIMIT = { limit: 30, windowMs: 60_000 };
const MAX_HANDLES = 8;
const MAX_HANDLE_LEN = 200;
const MAX_HANDLES_PARAM_LEN = 2000;

function parseHandles(raw: string | null): string[] | null {
  if (!raw || raw.length > MAX_HANDLES_PARAM_LEN) return null;
  const unique: string[] = [];
  for (const part of raw.split(",")) {
    const handle = part.trim();
    if (!handle || handle.length > MAX_HANDLE_LEN) continue;
    if (!unique.includes(handle)) unique.push(handle);
    if (unique.length > MAX_HANDLES) return null;
  }
  return unique;
}

function parseLocale(raw: string | null): AppLocale | null {
  if (!raw || !isAppLocale(raw)) return null;
  return raw;
}

/**
 * Compact catalog cards for client islands (recently viewed).
 * `GET /api/catalog/by-handles?locale=&handles=` (CSV, max 8).
 */
export async function GET(request: NextRequest) {
  const locale = parseLocale(request.nextUrl.searchParams.get("locale"));
  const handles = parseHandles(request.nextUrl.searchParams.get("handles"));
  if (!locale || handles === null) {
    return NextResponse.json({ error: "Invalid locale or handles" }, { status: 400 });
  }

  const rate = await checkRateLimit(clientIpKey(request, "catalog-by-handles"), RATE_LIMIT);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec ?? 60) } },
    );
  }

  if (handles.length === 0) {
    return NextResponse.json({ products: [] }, { headers: { "Cache-Control": "private, max-age=30" } });
  }

  const { isEnabled } = await draftMode();
  const [storefront, pages] = await Promise.all([
    getStorefrontProductsByHandles(handles, locale),
    getProductPageCards(locale, isEnabled),
  ]);
  const products = enrichCatalogProducts(storefront, pages);

  return NextResponse.json(
    { products },
    {
      headers: {
        "Cache-Control": "private, max-age=30",
      },
    },
  );
}
