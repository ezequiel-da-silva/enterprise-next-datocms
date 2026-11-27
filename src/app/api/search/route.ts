import { clientIpKey } from "@/app/api/account/account-route-utils";
import { isAppLocale, type AppLocale } from "@/constants/i18n";
import { searchEditorialSite } from "@/infra/datocms/search";
import { checkRateLimit } from "@/infra/security/rate-limit";
import {
  predictiveProductsToHits,
  predictiveSearchProducts,
} from "@/infra/shopify/predictive-search";
import { buildPreviewSearchPayload } from "@/lib/datocms/hybrid-search";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const RATE_LIMIT = { limit: 40, windowMs: 60_000 };
const MAX_Q_LEN = 120;

function parseLocale(raw: string | null): AppLocale | null {
  if (!raw || !isAppLocale(raw)) return null;
  return raw;
}

/**
 * Live search preview for the header strip.
 * Hybrid: Shopify `predictiveSearch` products + DatoCMS editorial pages.
 * `GET /api/search?locale=&q=`
 */
export async function GET(request: NextRequest) {
  const locale = parseLocale(request.nextUrl.searchParams.get("locale"));
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!locale || q.length > MAX_Q_LEN) {
    return NextResponse.json({ error: "Invalid locale or query" }, { status: 400 });
  }

  const rate = await checkRateLimit(clientIpKey(request, "site-search"), RATE_LIMIT);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec ?? 60) } },
    );
  }

  if (q.length < 2) {
    return NextResponse.json({ hits: [] }, { headers: { "Cache-Control": "private, max-age=15" } });
  }

  const [shopifySettled, editorialSettled] = await Promise.allSettled([
    predictiveSearchProducts(q, locale),
    searchEditorialSite(q, locale),
  ]);

  const productsFailed = shopifySettled.status === "rejected";
  const editorialFailed = editorialSettled.status === "rejected";

  const products =
    shopifySettled.status === "fulfilled"
      ? predictiveProductsToHits(shopifySettled.value, locale)
      : [];
  const editorial =
    editorialSettled.status === "fulfilled" ? (editorialSettled.value.hits ?? []) : [];
  const editorialError =
    editorialSettled.status === "fulfilled"
      ? editorialSettled.value.error
      : editorialSettled.reason instanceof Error
        ? editorialSettled.reason.message
        : "editorial unavailable";
  const productsError =
    shopifySettled.status === "rejected"
      ? shopifySettled.reason instanceof Error
        ? shopifySettled.reason.message
        : "shopify unavailable"
      : undefined;

  const payload = buildPreviewSearchPayload({
    products,
    editorial,
    productsFailed: productsFailed || undefined,
    editorialFailed: editorialFailed || Boolean(editorialSettled.status === "fulfilled" && editorialSettled.value.error),
    productsError,
    editorialError,
  });

  return NextResponse.json(payload, {
    headers: { "Cache-Control": "private, max-age=30" },
  });
}
