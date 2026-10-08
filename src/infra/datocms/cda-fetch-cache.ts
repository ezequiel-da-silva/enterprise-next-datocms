import type { DatocmsRequestOptions } from "@/infra/datocms/client";

const DEV_REVALIDATE_SECONDS = 60;

export type CdaFetchCacheInput = {
  includeDrafts: boolean;
  tags: string[];
  /** ISR em produção (segundos). Em `next dev` publicado desce para 60s. */
  revalidate: number;
  /**
   * Páginas/records cujo `null` em cache bloqueava publicações locais
   * (`page: null` após publish). Chrome, redirects e singletons NÃO devem
   * passar isto — o `no-store` global em dev esgota o CDA.
   */
  bypassPublishedCacheInDev?: boolean;
};

/**
 * Draft: sempre `no-store` (Content Link + rascunhos).
 * Publicado: tags + ISR. Em desenvolvimento usa revalidate curto em vez de
 * `no-store`, excepto quando `bypassPublishedCacheInDev` está ligado.
 */
export function cdaFetchCache(
  options: CdaFetchCacheInput,
): Pick<DatocmsRequestOptions, "tags" | "revalidate" | "cache"> {
  if (options.includeDrafts) {
    return { tags: undefined, revalidate: false, cache: "no-store" };
  }

  const bypassDev =
    Boolean(options.bypassPublishedCacheInDev) && process.env.NODE_ENV === "development";
  if (bypassDev) {
    return { tags: undefined, revalidate: false, cache: "no-store" };
  }

  const revalidate =
    process.env.NODE_ENV === "development"
      ? Math.min(options.revalidate, DEV_REVALIDATE_SECONDS)
      : options.revalidate;

  return { tags: options.tags, revalidate, cache: undefined };
}
