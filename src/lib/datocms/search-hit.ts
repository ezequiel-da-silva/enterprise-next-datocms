import type { StorefrontCollectionProduct } from "@/infra/shopify/storefront";

export type SearchHit = {
  id: string;
  title: string;
  href: string;
  kind: "page" | "post" | "author" | "product" | "collection";
  /** Enriched Storefront card when `kind === "product"`. */
  product?: StorefrontCollectionProduct;
};

export type SearchResultsPayload = { hits: SearchHit[]; error?: string };
