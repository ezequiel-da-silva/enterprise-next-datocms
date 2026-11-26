import {
  CatalogProductCard,
  type CatalogProductCardQuickAdd,
} from "@/components/patterns/catalog-product-card";
import { CatalogProductRow } from "@/components/patterns/catalog-product-row";
import type { AppLocale } from "@/constants/i18n";
import type { SearchHit } from "@/lib/datocms/search-hit";
import Link from "next/link";

const kindLabel: Record<AppLocale, Record<string, string>> = {
  en: { page: "Page", post: "Article", author: "Author", product: "Product", collection: "Collection" },
  pt: { page: "Página", post: "Artigo", author: "Autor", product: "Produto", collection: "Coleção" },
  es: { page: "Página", post: "Artículo", author: "Autor", product: "Producto", collection: "Colección" },
};

const SECTION_PRODUCTS: Record<AppLocale, string> = {
  en: "Products",
  pt: "Produtos",
  es: "Productos",
};

const SECTION_CONTENT: Record<AppLocale, string> = {
  en: "Pages & articles",
  pt: "Páginas e artigos",
  es: "Páginas y artículos",
};

const FALLBACK_ERROR: Record<AppLocale, string> = {
  en: "Search unavailable",
  pt: "Busca indisponível",
  es: "Búsqueda no disponible",
};

const FALLBACK_EMPTY: Record<AppLocale, string> = {
  en: "Type a term to search products, pages or articles.",
  pt: "Digite um termo para buscar produtos, páginas ou artigos.",
  es: "Escribe un término para buscar productos, páginas o artículos.",
};

const FALLBACK_NO_RESULTS: Record<AppLocale, string> = {
  en: "No results for “{query}”.",
  pt: "Nenhum resultado para “{query}”.",
  es: "Ningún resultado para “{query}”.",
};

const CARD_SIZES = "(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 240px";

type SearchResultsProps = {
  query: string;
  hits: SearchHit[];
  locale: AppLocale;
  error?: string;
  emptyHint?: string;
  noResults?: string;
  quickAdd?: CatalogProductCardQuickAdd | null;
  /** Compact list for header live preview (rows, not cards). */
  compact?: boolean;
  /** Close preview when navigating to a hit. */
  onNavigate?: () => void;
};

function interpolateQuery(template: string, query: string): string {
  return template.replaceAll("{query}", query);
}

export function SearchResults({
  query,
  hits,
  locale,
  error,
  emptyHint,
  noResults,
  quickAdd = null,
  compact = false,
  onNavigate,
}: SearchResultsProps) {
  if (error) {
    return (
      <p className="type-body" role="status">
        {FALLBACK_ERROR[locale]}: {error}
      </p>
    );
  }

  if (!query.trim()) {
    return <p className="type-body">{emptyHint || FALLBACK_EMPTY[locale]}</p>;
  }

  if (hits.length === 0) {
    return (
      <p className="type-body">
        {interpolateQuery(noResults || FALLBACK_NO_RESULTS[locale], query)}
      </p>
    );
  }

  const labels = kindLabel[locale];
  const products = hits.filter((hit) => hit.kind === "product" && hit.product);
  const content = hits.filter((hit) => hit.kind !== "product" || !hit.product);
  const productLimit = compact ? 4 : products.length;
  const contentLimit = compact ? 3 : content.length;
  const shownProducts = products.slice(0, productLimit);
  const shownContent = content.slice(0, contentLimit);

  return (
    <div className={compact ? "space-y-4" : "space-y-8"}>
      {shownProducts.length > 0 ? (
        <section aria-label={SECTION_PRODUCTS[locale]} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {SECTION_PRODUCTS[locale]}
          </h2>
          {compact ? (
            <ul className="m-0 list-none divide-y divide-border p-0">
              {shownProducts.map((hit) =>
                hit.product ? (
                  <li key={`${hit.kind}-${hit.id}`} className="min-w-0">
                    <CatalogProductRow
                      locale={locale}
                      product={hit.product}
                      onNavigate={onNavigate}
                    />
                  </li>
                ) : null,
              )}
            </ul>
          ) : (
            <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3">
              {shownProducts.map((hit) =>
                hit.product ? (
                  <li key={`${hit.kind}-${hit.id}`} className="min-w-0">
                    <CatalogProductCard
                      locale={locale}
                      product={hit.product}
                      sizes={CARD_SIZES}
                      quickAdd={quickAdd}
                    />
                  </li>
                ) : null,
              )}
            </ul>
          )}
        </section>
      ) : null}

      {shownContent.length > 0 ? (
        <section aria-label={SECTION_CONTENT[locale]} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {SECTION_CONTENT[locale]}
          </h2>
          <ul className="m-0 list-none divide-y divide-border p-0">
            {shownContent.map((hit) => (
              <li key={`${hit.kind}-${hit.id}-${hit.href}`} className="py-3">
                <div className="flex flex-wrap items-baseline gap-2">
                  <Link
                    className="font-medium text-foreground hover:underline"
                    href={hit.href}
                    onClick={onNavigate}
                  >
                    {hit.title}
                  </Link>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {labels[hit.kind] ?? hit.kind}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
