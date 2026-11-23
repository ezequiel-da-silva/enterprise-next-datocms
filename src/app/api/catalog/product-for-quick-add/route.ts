import { clientIpKey } from "@/app/api/account/account-route-utils";
import { isAppLocale, type AppLocale } from "@/constants/i18n";
import { checkRateLimit } from "@/infra/security/rate-limit";
import { getStorefrontProductByHandle } from "@/infra/shopify/storefront";
import { isCartEnabled } from "@/lib/shopify/cart-cookie";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const RATE_LIMIT = { limit: 40, windowMs: 60_000 };
const MAX_HANDLE_LEN = 200;

function parseLocale(raw: string | null): AppLocale | null {
  if (!raw || !isAppLocale(raw)) return null;
  return raw;
}

/**
 * Minimal product + variants for listing quick-add.
 * `GET /api/catalog/product-for-quick-add?locale=&handle=`
 */
export async function GET(request: NextRequest) {
  if (!isCartEnabled()) {
    return NextResponse.json({ error: "Cart disabled" }, { status: 404 });
  }

  const locale = parseLocale(request.nextUrl.searchParams.get("locale"));
  const handle = request.nextUrl.searchParams.get("handle")?.trim() ?? "";
  if (!locale || !handle || handle.length > MAX_HANDLE_LEN) {
    return NextResponse.json({ error: "Invalid locale or handle" }, { status: 400 });
  }

  const rate = await checkRateLimit(clientIpKey(request, "catalog-quick-add"), RATE_LIMIT);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec ?? 60) } },
    );
  }

  const product = await getStorefrontProductByHandle(handle, locale);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      handle: product.handle,
      title: product.title,
      availableForSale: product.availableForSale,
      variants: product.variants.map((variant) => ({
        id: variant.id,
        availableForSale: variant.availableForSale,
        selectedOptions: variant.selectedOptions,
        price: variant.price,
      })),
    },
    { headers: { "Cache-Control": "private, max-age=30" } },
  );
}
