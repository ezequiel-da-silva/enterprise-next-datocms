import { BreadcrumbNav } from "@/components/patterns/breadcrumb-nav";
import { JsonLdScript } from "@/components/patterns/seo-manager";
import { SearchResults } from "@/components/patterns/search-results";
import { SearchSkeleton } from "@/components/patterns/search-skeleton";
import { DEFAULT_APP_LOCALE } from "@/constants/i18n";
import { buildSearchPageJsonLd } from "@/lib/seo/build-search-jsonld";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { Suspense } from "react";

type BuscaPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: BuscaPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const term = q?.trim();
  const hasQuery = Boolean(term);

  return buildMetadata({
    title: hasQuery ? `Busca: ${term}` : "Busca",
    description: hasQuery
      ? `Resultados de busca para «${term}» no site.`
      : "Busca full-text via GraphQL no DatoCMS com tags de revalidação.",
    path: hasQuery ? `/busca?q=${encodeURIComponent(term!)}` : "/busca",
    noIndex: hasQuery,
  });
}

async function SearchShell({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  return <SearchResults query={q} />;
}

export default async function BuscaPage({ searchParams }: BuscaPageProps) {
  const { q } = await searchParams;
  const term = q?.trim();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12">
      <JsonLdScript graph={buildSearchPageJsonLd(term)} />
      <header className="space-y-3">
        <BreadcrumbNav
          locale={DEFAULT_APP_LOCALE}
          items={[{ label: "Início", href: "/" }, { label: term ? `Busca: ${term}` : "Busca" }]}
        />
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Busca</h1>
        <p className="text-sm text-muted-foreground">
          Requisição GraphQL com <code className="rounded bg-muted px-1 py-0.5">next: tags</code> para invalidação
          granular.
        </p>
      </header>

      <form className="flex flex-col gap-3 sm:flex-row" action="/busca" method="get" role="search">
        <label className="sr-only" htmlFor="q">
          Termo de busca
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={term ?? ""}
          placeholder="Buscar páginas, artigos ou autores…"
          autoComplete="off"
          enterKeyHint="search"
          className="h-11 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
        <button
          type="submit"
          className="h-11 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Buscar
        </button>
      </form>

      <Suspense fallback={<SearchSkeleton />}>
        <SearchShell searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
