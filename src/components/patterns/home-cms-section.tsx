import { datocmsFetch } from "@/infra/datocms/client";
import { HOME_HIGHLIGHT } from "@/infra/datocms/queries";

type HomeHighlightData = {
  _site: { locales: string[] };
};

/**
 * Conteúdo Dato (publicado): `datocmsFetch` com `includeDrafts` omisso/false usa
 * `DATOCMS_API_TOKEN` e `Authorization: Bearer …` em `src/infra/datocms/client.ts`.
 */
export async function HomeCmsSection() {
  const result = await datocmsFetch<HomeHighlightData>({
    query: HOME_HIGHLIGHT,
    tags: ["datocms:site"],
    revalidate: 600,
  });

  if ("errors" in result) {
    return (
      <section aria-labelledby="cms-heading" className="rounded-lg border border-border p-6">
        <h2 id="cms-heading" className="text-lg font-semibold text-foreground">
          DatoCMS
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure <code className="rounded bg-muted px-1 py-0.5">DATOCMS_API_TOKEN</code> para
          ativar o conteúdo dinâmico. Detalhe: {result.errors[0]?.message}
        </p>
      </section>
    );
  }

  const locales = result.data._site.locales ?? [];

  return (
    <section aria-labelledby="cms-heading" className="rounded-lg border border-border p-6">
      <h2 id="cms-heading" className="text-lg font-semibold text-foreground">
        Conteúdo via DatoCMS
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Locales publicados no projeto:{" "}
        <span className="font-medium text-foreground">{locales.join(", ") || "—"}</span>
      </p>
    </section>
  );
}
