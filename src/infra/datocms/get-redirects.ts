import { datocmsFetch, type DatocmsResponse } from "@/infra/datocms/client";
import { cdaFetchCache } from "@/infra/datocms/cda-fetch-cache";
import { GET_ALL_REDIRECTS } from "@/infra/datocms/redirects-query";
import type { AllRedirectsQuery } from "@/infra/datocms/generated/operations.types";
import { DATOCMS_CACHE_TAGS } from "@/lib/datocms/revalidate-tags";

export type { AllRedirectsQuery };

export const REDIRECTS_TAG = DATOCMS_CACHE_TAGS.redirects;

/**
 * Redirects publicados. Sem draft: só records publicados devem afectar o proxy.
 * Sem `cache()` do React — o proxy não corre numa árvore RSC.
 * ISR + tags: o webhook `redirect` chama `revalidateTag("datocms:redirects")`.
 */
export async function getRedirects(): Promise<DatocmsResponse<AllRedirectsQuery>> {
  return datocmsFetch<AllRedirectsQuery>({
    query: GET_ALL_REDIRECTS,
    includeDrafts: false,
    ...cdaFetchCache({
      includeDrafts: false,
      tags: [REDIRECTS_TAG],
      revalidate: 300,
    }),
  });
}

export function pickRedirectRecords(result: DatocmsResponse<AllRedirectsQuery>): AllRedirectsQuery["allRedirects"] {
  if ("errors" in result) {
    return [];
  }
  return result.data.allRedirects ?? [];
}
