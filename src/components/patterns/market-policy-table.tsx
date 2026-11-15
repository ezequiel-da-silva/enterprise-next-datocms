import type { AppLocale } from "@/constants/i18n";
import {
  MARKET_POLICY_TABLE_COPY,
  type MarketPolicyTableRow,
} from "@/lib/seo/market-policy-table";

type MarketPolicyTableProps = {
  locale: AppLocale;
  rows: readonly MarketPolicyTableRow[];
  /** Highlights the visitor's market (locale → country). */
  currentCountry?: string;
};

/**
 * Semantic comparison table of `market_policy` (shipping, preparation, delivery, returns).
 * Values come only from the CMS; empty cells render a dash. Returns null without rows.
 */
export function MarketPolicyTable({ locale, rows, currentCountry }: MarketPolicyTableProps) {
  if (rows.length === 0) return null;
  const copy = MARKET_POLICY_TABLE_COPY[locale];

  return (
    <div className="not-prose my-12 w-full overflow-x-auto" data-testid="market-policy-table">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="type-heading pb-4 text-left">{copy.caption}</caption>
        <thead>
          <tr className="text-muted-foreground">
            <th scope="col" className="py-2 pr-4 font-medium">
              {copy.market}
            </th>
            <th scope="col" className="py-2 pr-4 font-medium">
              {copy.shipping}
            </th>
            <th scope="col" className="py-2 pr-4 font-medium">
              {copy.handling}
            </th>
            <th scope="col" className="py-2 pr-4 font-medium">
              {copy.transit}
            </th>
            <th scope="col" className="py-2 font-medium">
              {copy.returns}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.country}
              className="border-t border-border align-top"
              data-market={row.country}
              aria-current={row.country === currentCountry ? "true" : undefined}
            >
              <th scope="row" className="py-3 pr-4 font-medium text-foreground">
                {row.marketLabel}
              </th>
              <td className="py-3 pr-4 text-foreground">{row.shipping}</td>
              <td className="py-3 pr-4 text-foreground">{row.handling}</td>
              <td className="py-3 pr-4 text-foreground">{row.transit}</td>
              <td className="py-3 text-foreground">{row.returns}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
