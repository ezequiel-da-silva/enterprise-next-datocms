import Link from "next/link";

/** Serializable facet row for RSC → client drawer (and desktop aside). */
export type CatalogFacetOption = {
  href: string;
  label: string;
  count: number;
  active: boolean;
};

export type CatalogStockOption = {
  href: string;
  label: string;
  active: boolean;
};

type FacetCheckRowProps = {
  href: string;
  label: string;
  active: boolean;
  count?: number;
  onNavigate?: () => void;
};

function FacetCheckRow({ href, label, active, count, onNavigate }: FacetCheckRowProps) {
  return (
    <Link
      href={href}
      scroll={false}
      className="touch-target-text flex min-h-10 items-center gap-2.5 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      aria-current={active ? "true" : undefined}
      onClick={onNavigate}
    >
      <span
        className={[
          "inline-flex size-4 shrink-0 items-center justify-center rounded-sm border-2",
          active
            ? "border-foreground bg-foreground text-background"
            : "border-foreground/50 bg-background",
        ].join(" ")}
        aria-hidden
      >
        {active ? (
          <svg className="size-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2.5 6.5 4.5 8.5 9.5 3.5" />
          </svg>
        ) : null}
      </span>
      <span className="min-w-0">
        {label}
        {typeof count === "number" ? (
          <span className="text-muted-foreground">{` (${count})`}</span>
        ) : null}
      </span>
    </Link>
  );
}

type FacetPanelProps = {
  terrainLabel: string;
  profileLabel: string;
  terrainOptions: readonly CatalogFacetOption[];
  profileOptions: readonly CatalogFacetOption[];
  stock: CatalogStockOption;
  /** Called when a facet Link is activated (e.g. close mobile drawer — Peak-End). */
  onNavigate?: () => void;
};

export function FacetPanel({
  terrainLabel,
  profileLabel,
  terrainOptions,
  profileOptions,
  stock,
  onNavigate,
}: FacetPanelProps) {
  return (
    <div className="flex flex-col">
      <details open className="group border-b border-border py-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
          <span>{terrainLabel}</span>
          <span
            className="inline-flex size-5 shrink-0 items-center justify-center text-muted-foreground transition-transform duration-200 group-open:rotate-180"
            aria-hidden="true"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </summary>
        <div className="mt-3 flex flex-col gap-1">
          {terrainOptions.map((option) => (
            <FacetCheckRow
              key={option.href + option.label}
              href={option.href}
              label={option.label}
              count={option.count}
              active={option.active}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </details>

      <details open className="group border-b border-border py-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
          <span>{profileLabel}</span>
          <span
            className="inline-flex size-5 shrink-0 items-center justify-center text-muted-foreground transition-transform duration-200 group-open:rotate-180"
            aria-hidden="true"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </summary>
        <div className="mt-3 flex flex-col gap-1">
          {profileOptions.map((option) => (
            <FacetCheckRow
              key={option.href + option.label}
              href={option.href}
              label={option.label}
              count={option.count}
              active={option.active}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </details>

      <div className="py-4">
        <FacetCheckRow
          href={stock.href}
          label={stock.label}
          active={stock.active}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}
