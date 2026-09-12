import type { AppLocale } from "@/constants/i18n";
import type { SearchHit } from "@/lib/datocms/search-hit";
import Link from "next/link";

const kindLabel: Record<AppLocale, Record<string, string>> = {
  en: { page: "Page", post: "Article", author: "Author" },
  pt: { page: "Página", post: "Artigo", author: "Autor" },
  es: { page: "Página", post: "Artículo", author: "Autor" },
};

const FALLBACK_ERROR: Record<AppLocale, string> = {
  en: "Search unavailable",
  pt: "Busca indisponível",
  es: "Búsqueda no disponible",
};

const FALLBACK_EMPTY: Record<AppLocale, string> = {
  en: "Type a term to search pages, articles or authors.",
  pt: "Digite um termo para buscar páginas, artigos ou autores.",
  es: "Escribe un término para buscar páginas, artículos o autores.",
};

const FALLBACK_NO_RESULTS: Record<AppLocale, string> = {
  en: "No results for “{query}”.",
  pt: "Nenhum resultado para “{query}”.",
  es: "Ningún resultado para “{query}”.",
};

type SearchResultsProps = {
  query: string;
  hits: SearchHit[];
  locale: AppLocale;
  error?: string;
  emptyHint?: string;
  noResults?: string;
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
}: SearchResultsProps) {
  if (error) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        {FALLBACK_ERROR[locale]}: {error}
      </p>
    );
  }

  if (!query.trim()) {
    return (
      <p className="text-sm text-muted-foreground">{emptyHint || FALLBACK_EMPTY[locale]}</p>
    );
  }

  if (hits.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {interpolateQuery(noResults || FALLBACK_NO_RESULTS[locale], query)}
      </p>
    );
  }

  const labels = kindLabel[locale];

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {hits.map((hit) => (
        <li key={`${hit.kind}-${hit.id}-${hit.href}`} className="px-4 py-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <Link className="font-medium text-foreground hover:underline" href={hit.href}>
              {hit.title}
            </Link>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {labels[hit.kind] ?? hit.kind}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{hit.href}</p>
        </li>
      ))}
    </ul>
  );
}
