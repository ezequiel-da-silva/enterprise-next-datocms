import { searchSite } from "@/infra/datocms/search";
import Link from "next/link";

const kindLabel: Record<string, string> = {
  page: "Página",
  post: "Artigo",
  author: "Autor",
};

export async function SearchResults({ query }: { query: string }) {
  const { hits, error } = await searchSite(query);

  if (error) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Busca indisponível: {error}
      </p>
    );
  }

  if (!query.trim()) {
    return <p className="text-sm text-muted-foreground">Digite um termo para buscar páginas, artigos ou autores.</p>;
  }

  if (hits.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum resultado para “{query}”.</p>;
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {hits.map((hit) => (
        <li key={`${hit.kind}-${hit.id}-${hit.href}`} className="px-4 py-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <Link className="font-medium text-foreground hover:underline" href={hit.href}>
              {hit.title}
            </Link>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {kindLabel[hit.kind] ?? hit.kind}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{hit.href}</p>
        </li>
      ))}
    </ul>
  );
}
