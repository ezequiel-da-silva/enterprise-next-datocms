"use client";

import type { ProductShippingEstimateCopy } from "@/components/patterns/product-shipping-estimate";
import dynamic from "next/dynamic";

const ProductShippingEstimate = dynamic(
  () =>
    import("@/components/patterns/product-shipping-estimate").then((mod) => mod.ProductShippingEstimate),
  {
    ssr: true,
    loading: () => (
      <div className="min-h-24 rounded-md border border-transparent" aria-hidden />
    ),
  },
);

type ProductShippingEstimateLazyProps = {
  locale: "pt";
  subtotal: number | null;
  copy: ProductShippingEstimateCopy;
};

/** Client-only chunk for the BR CEP estimate form (below the buy box). */
export function ProductShippingEstimateLazy(props: ProductShippingEstimateLazyProps) {
  return <ProductShippingEstimate {...props} />;
}
