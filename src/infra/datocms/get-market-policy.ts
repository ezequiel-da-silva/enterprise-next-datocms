import { cdaFetchCache } from "@/infra/datocms/cda-fetch-cache";
import { datocmsFetch } from "@/infra/datocms/client";
import { GET_MARKET_POLICIES } from "@/infra/datocms/market-policy-query";
import { logWarnThrottled } from "@/infra/observability/log-error";
import { DATOCMS_CACHE_TAGS } from "@/lib/datocms/revalidate-tags";
import {
  normalizeMarketPolicy,
  type MarketPolicy,
  type MarketPolicyRecord,
} from "@/lib/seo/merchant-policy";
import { cache } from "react";

type MarketPoliciesQueryResult = { allMarketPolicies: MarketPolicyRecord[] | null };

/** Published records only: the JSON-LD must never advertise an unreviewed draft. */
const loadMarketPolicies = cache(async (): Promise<MarketPolicyRecord[]> => {
  const result = await datocmsFetch<MarketPoliciesQueryResult>({
    query: GET_MARKET_POLICIES,
    ...cdaFetchCache({ includeDrafts: false, tags: [DATOCMS_CACHE_TAGS.marketPolicy], revalidate: 300 }),
  });
  if ("errors" in result) {
    logWarnThrottled(
      "market-policy",
      "datocms.market-policy",
      "market_policy unavailable; omitting shipping and return JSON-LD",
      { detail: result.errors[0]?.message?.slice(0, 200) },
    );
    return [];
  }
  return result.data.allMarketPolicies ?? [];
});

/** Validated policy for a Shopify market country (`US`, `BR`, `ES`); `null` when there is no record. */
export async function getMarketPolicy(country: string): Promise<MarketPolicy | null> {
  const records = await loadMarketPolicies();
  const wanted = country.toUpperCase();
  const record = records.find((entry) => String(entry.country ?? "").trim().toUpperCase() === wanted);
  return normalizeMarketPolicy(record);
}
