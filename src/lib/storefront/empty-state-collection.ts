import type { StorefrontProductImage } from "@/infra/shopify/storefront";

/** Serializable suggestion card for empty cart / wishlist. */
export type EmptyStateCollection = {
  handle: string;
  title: string;
  href: string;
  image: StorefrontProductImage | null;
};
