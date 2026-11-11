import type { AppLocale } from "@/constants/i18n";
import { toDatoSiteLocale } from "@/constants/i18n";
import { cdaFetchCache } from "@/infra/datocms/cda-fetch-cache";
import { datocmsFetch } from "@/infra/datocms/client";
import { LIST_COLLECTION_PAGES } from "@/infra/datocms/queries";
import { getStorefrontCollectionMeta } from "@/infra/shopify/storefront";
import { collectionPagePath } from "@/lib/datocms/collection-page-path";
import { DATOCMS_CACHE_TAGS } from "@/lib/datocms/revalidate-tags";
import type { EmptyStateCollection } from "@/lib/storefront/empty-state-collection";
import { cache } from "react";

export type { EmptyStateCollection };

type CollectionPageRow = {
  title: string | null;
  shopifyHandle: string | null;
};

const EMPTY_STATE_COLLECTION_LIMIT = 3;

const loadEmptyStateCollections = cache(
  async (locale: AppLocale, includeDrafts: boolean): Promise<EmptyStateCollection[]> => {
    const result = await datocmsFetch<{ allCollectionPages: CollectionPageRow[] }>({
      query: LIST_COLLECTION_PAGES,
      variables: { locale: toDatoSiteLocale(locale) },
      includeDrafts,
      ...cdaFetchCache({
        includeDrafts,
        tags: [DATOCMS_CACHE_TAGS.collection],
        revalidate: 120,
      }),
    });
    if ("errors" in result) return [];

    const pages = result.data.allCollectionPages.flatMap((row) => {
      const handle = row.shopifyHandle?.trim();
      if (!handle) return [];
      return [{ handle, title: row.title?.trim() || handle }];
    });

    const picked = pages.slice(0, EMPTY_STATE_COLLECTION_LIMIT);
    const metas = await Promise.all(picked.map((page) => getStorefrontCollectionMeta(page.handle, locale)));

    return picked.map((page, index) => {
      const meta = metas[index];
      return {
        handle: page.handle,
        title: page.title || meta?.title || page.handle,
        href: collectionPagePath(locale, page.handle),
        image: meta?.image ?? null,
      };
    });
  },
);

export function getEmptyStateCollections(
  locale: AppLocale,
  includeDrafts: boolean,
): Promise<EmptyStateCollection[]> {
  return loadEmptyStateCollections(locale, includeDrafts);
}
