import { clientIpKey } from "@/app/api/account/account-route-utils";
import { isAppLocale, type AppLocale } from "@/constants/i18n";
import { getMarketPolicy } from "@/infra/datocms/get-market-policy";
import { checkRateLimit } from "@/infra/security/rate-limit";
import {
  currencyForShopifyCountry,
} from "@/lib/seo/format-market-policy-trust";
import {
  estimateShippingFromMarketPolicy,
  normalizeBrCep,
} from "@/lib/shopify/estimate-shipping";
import { shopifyCountryFromLocale } from "@/lib/shopify/locale-map";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const RATE_LIMIT = { limit: 30, windowMs: 60_000 };

function parseLocale(raw: string | null): AppLocale | null {
  if (!raw || !isAppLocale(raw)) return null;
  return raw;
}

function parseSubtotal(raw: string | null): number | null {
  if (raw == null || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

/**
 * Approximate BR shipping estimate from `market_policy` (not live Shopify rates).
 * `GET /api/shipping/estimate?locale=pt&cep=01310100&subtotal=`
 */
export async function GET(request: NextRequest) {
  const locale = parseLocale(request.nextUrl.searchParams.get("locale"));
  const cep = normalizeBrCep(request.nextUrl.searchParams.get("cep") ?? "");
  const subtotal = parseSubtotal(request.nextUrl.searchParams.get("subtotal"));

  if (!locale || locale !== "pt" || !cep) {
    return NextResponse.json({ error: "Invalid locale or CEP" }, { status: 400 });
  }

  const rate = await checkRateLimit(clientIpKey(request, "shipping-estimate"), RATE_LIMIT);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec ?? 60) } },
    );
  }

  const country = shopifyCountryFromLocale(locale);
  if (country !== "BR") {
    return NextResponse.json({ error: "Market unavailable" }, { status: 400 });
  }

  const policy = await getMarketPolicy(country);
  const estimate = estimateShippingFromMarketPolicy(
    locale,
    policy,
    currencyForShopifyCountry(country),
    subtotal,
  );

  if (!estimate) {
    return NextResponse.json({ error: "Estimate unavailable" }, { status: 404 });
  }

  return NextResponse.json(
    {
      cep,
      free: estimate.free,
      rateLabel: estimate.rateLabel,
      etaLabel: estimate.etaLabel,
      disclaimer: estimate.disclaimer,
    },
    { headers: { "Cache-Control": "private, max-age=60" } },
  );
}
