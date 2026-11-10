"use client";

import type { StorefrontCollectionProduct } from "@/infra/shopify/storefront";
import { trackViewItemList } from "@/lib/analytics/ecommerce";
import { useEffect } from "react";

type ViewItemListTrackerProps = {
  itemListId: string;
  itemListName: string;
  products: StorefrontCollectionProduct[];
};

/** Fires GA4 `view_item_list` once per list identity (id + name + product handles). */
export function ViewItemListTracker({ itemListId, itemListName, products }: ViewItemListTrackerProps) {
  const listKey = `${itemListId}\n${itemListName}\n${products.map((product) => product.handle).join("|")}`;

  useEffect(() => {
    if (products.length === 0) return;
    trackViewItemList({
      item_list_id: itemListId,
      item_list_name: itemListName,
      items: products.map((product) => ({
        item_id: product.handle,
        item_name: product.title,
        price: Number(product.priceRange.minVariantPrice.amount) || 0,
        quantity: 1,
      })),
    });
    // listKey is the list identity; products is the render that produced that key.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- do not refire when only the array identity changes
  }, [listKey]);

  return null;
}
