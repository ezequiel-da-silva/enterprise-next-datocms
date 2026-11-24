"use client";

import { Button } from "@/components/atoms/button";
import { EmptyStateCollectionGrid } from "@/components/patterns/empty-state-collection-grid";
import { useWishlist } from "@/components/patterns/wishlist-provider";
import type { AppLocale } from "@/constants/i18n";
import { productPagePath } from "@/lib/datocms/product-page-path";
import type { WishlistViewCopy } from "@/lib/i18n/wishlist-copy";
import { formatDiscountPill, resolveCompareAtDeal } from "@/lib/shopify/compare-at-price";
import { formatStorefrontMoney } from "@/lib/shopify/format-money";
import type { EmptyStateCollection } from "@/lib/storefront/empty-state-collection";
import Image from "next/image";
import Link from "next/link";

type WishlistViewProps = {
  locale: AppLocale;
  shopPath: string;
  copy: WishlistViewCopy;
  suggestedCollections: EmptyStateCollection[];
};

export function WishlistView({ locale, shopPath, copy, suggestedCollections }: WishlistViewProps) {
  const { items, remove, ready } = useWishlist();

  if (!ready) {
    return <p className="type-lead text-muted-foreground">{copy.lead}</p>;
  }

  if (items.length === 0) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <h2 className="type-heading">{copy.emptyTitle}</h2>
          <p className="type-lead">{copy.emptyDescription}</p>
          <Button asChild variant="primary">
            <Link href={shopPath}>{copy.emptyCta}</Link>
          </Button>
        </div>
        <EmptyStateCollectionGrid collections={suggestedCollections} />
      </div>
    );
  }

  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const href = productPagePath(locale, item.handle);
        const price = { amount: item.priceAmount, currencyCode: item.currencyCode };
        const compareAt = item.compareAtAmount
          ? { amount: item.compareAtAmount, currencyCode: item.currencyCode }
          : null;
        const deal = resolveCompareAtDeal(locale, price, compareAt);
        return (
          <li key={item.handle} className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
            <Link
              href={href}
              className="flex flex-1 flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <div className="relative aspect-square w-full bg-muted">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={600}
                    height={600}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h2 className="text-balance text-lg font-semibold tracking-tight text-foreground">{item.title}</h2>
                <p className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-foreground">
                  <span>{formatStorefrontMoney(locale, item.priceAmount, item.currencyCode)}</span>
                  {deal ? (
                    <>
                      <s className="text-sm font-normal text-muted-foreground">{deal.compareAtPriceLabel}</s>
                      <span
                        data-discount-pill=""
                        className="rounded-md bg-foreground px-1.5 py-0.5 text-xs font-semibold text-background"
                      >
                        {formatDiscountPill(deal.discountPercent)}
                      </span>
                    </>
                  ) : null}
                </p>
              </div>
            </Link>
            <div className="border-t border-border p-4 pt-3">
              <Button type="button" variant="ghost" className="w-full" onClick={() => remove(item.handle)}>
                {copy.remove}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
