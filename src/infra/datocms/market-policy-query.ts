import { MARKET_POLICY_FIELDS } from "@/lib/seo/merchant-policy";

/**
 * All `market_policy` records (one per country, so at most a handful). Fetched whole and picked
 * in code: one cached request serves every market and avoids filter-type surprises on the enum field.
 * The selection is generated from `MARKET_POLICY_FIELDS`, so query and field map cannot drift.
 */
export const GET_MARKET_POLICIES = /* GraphQL */ `
  query GetMarketPolicies {
    allMarketPolicies(first: 20) {
      ${MARKET_POLICY_FIELDS.join("\n      ")}
    }
  }
`;
