"use client";

import { trackSelectItem, type EcommerceItem } from "@/lib/analytics/ecommerce";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type CatalogSelectItemLinkProps = Omit<ComponentProps<typeof Link>, "onClick"> & {
  children: ReactNode;
  itemListId?: string;
  itemListName?: string;
  item: EcommerceItem;
};

/** Product card link that fires GA4 `select_item` without blocking navigation. */
export function CatalogSelectItemLink({
  itemListId,
  itemListName,
  item,
  children,
  ...linkProps
}: CatalogSelectItemLinkProps) {
  return (
    <Link
      {...linkProps}
      onClick={() => {
        if (!itemListId && !itemListName) return;
        trackSelectItem({
          item_list_id: itemListId,
          item_list_name: itemListName,
          items: [item],
        });
      }}
    >
      {children}
    </Link>
  );
}
