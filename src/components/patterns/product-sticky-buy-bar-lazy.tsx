"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const ProductStickyBuyBar = dynamic(
  () => import("@/components/patterns/product-sticky-buy-bar").then((mod) => mod.ProductStickyBuyBar),
  {
    ssr: true,
    loading: () => <div className="hidden min-h-14 lg:hidden" aria-hidden />,
  },
);

type ProductStickyBuyBarLazyProps = {
  title: string;
  priceLabel: string;
  visible: boolean;
  children: ReactNode;
};

/** Deferred mobile sticky ATC strip — loaded after the primary buy box hydrates. */
export function ProductStickyBuyBarLazy(props: ProductStickyBuyBarLazyProps) {
  return <ProductStickyBuyBar {...props} />;
}
