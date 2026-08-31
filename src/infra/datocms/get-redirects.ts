import { datocmsFetch, type DatocmsResponse } from "@/infra/datocms/client";
import { GET_ALL_REDIRECTS } from "@/infra/datocms/redirects-query";
import type { AllRedirectsQuery } from "@/infra/datocms/generated/operations.types";
import { DATOCMS_CACHE_TAGS } from "@/lib/datocms/revalidate-tags";

export type { AllRedirectsQuery };

export const REDIRECTS_TAG = DATOCMS_CACHE_TAGS.redirects;

/**
 * Redirects publicados. Sem draft: só records publicados devem afectar o proxy.
 * Sem `cache()` do React — o proxy não corre numa árvore RSC.
 */
export async function getRedirects(): Promise<DatocmsResponse<AllRedirectsQuery>> {
  const devPublishedNoStore = process.env.NODE_ENV === "development";

  return datocmsFetch<AllRedirectsQuery>({
    query: GET_ALL_REDIRECTS,
    tags: devPublishedNoStore ? undefined : [REDIRECTS_TAG],
    revalidate: devPublishedNoStore ? false : 300,
    includeDrafts: false,
    cache: devPublishedNoStore ? "no-store" : undefined,
  });
}

export function pickRedirectRecords(result: DatocmsResponse<AllRedirectsQuery>): AllRedirectsQuery["allRedirects"] {
  if ("errors" in result) {
    return [];
  }
  return result.data.allRedirects ?? [];
}
