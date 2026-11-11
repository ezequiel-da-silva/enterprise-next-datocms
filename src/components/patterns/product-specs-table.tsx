import type { AppLocale } from "@/constants/i18n";
import { snowboardEnumLabel } from "@/lib/i18n/pdp-copy";

export type ProductSpecLabels = {
  profile: string;
  flex: string;
  terrain: string;
  riderLevel: string;
  core: string;
};

export type ProductSpecValues = {
  profile: string | null;
  flex: number | null;
  terrain: string | null;
  riderLevel: string | null;
  coreMaterial: string | null;
};

type ProductSpecsTableProps = {
  locale: AppLocale;
  labels: ProductSpecLabels;
  values: ProductSpecValues;
};

function row(term: string, value: string) {
  return (
    <div key={term} className="grid gap-1 border-b border-border py-3 sm:grid-cols-[minmax(9rem,14rem)_1fr] sm:gap-4">
      <dt className="text-muted-foreground">{term}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

/**
 * Server-rendered definition list. Empty specs are omitted so crawlers only see real facts.
 */
export function ProductSpecsTable({ locale, labels, values }: ProductSpecsTableProps) {
  const profile = snowboardEnumLabel(locale, "profile", values.profile);
  const terrain = snowboardEnumLabel(locale, "terrain", values.terrain);
  const rider = snowboardEnumLabel(locale, "rider", values.riderLevel);
  const core = values.coreMaterial?.trim() || null;
  const flex = values.flex !== null && Number.isInteger(values.flex) ? values.flex : null;

  const items = [
    profile ? row(labels.profile, profile) : null,
    flex !== null ? (
      <div key="flex" className="grid gap-1 border-b border-border py-3 sm:grid-cols-[minmax(9rem,14rem)_1fr] sm:gap-4">
        <dt className="text-muted-foreground">{labels.flex}</dt>
        <dd className="flex items-center gap-3 font-medium text-foreground">
          <span>{flex}/10</span>
          {flex >= 1 && flex <= 10 ? (
            <meter min={1} max={10} value={flex} aria-label={`${labels.flex} ${flex}/10`} className="h-2 w-24" />
          ) : null}
        </dd>
      </div>
    ) : null,
    terrain ? row(labels.terrain, terrain) : null,
    rider ? row(labels.riderLevel, rider) : null,
    core ? row(labels.core, core) : null,
  ].filter(Boolean);

  if (items.length === 0) return null;

  return <dl className="mt-10 border-t border-border text-sm">{items}</dl>;
}
