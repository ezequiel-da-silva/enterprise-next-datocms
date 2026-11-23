"use client";

import { AddToCartButton, type AddToCartAction, type AddToCartCopy } from "@/components/patterns/add-to-cart-button";
import { BuyNowButton, type BuyNowAction, type BuyNowCopy } from "@/components/patterns/buy-now-button";
import { LowStockBadge } from "@/components/patterns/low-stock-badge";
import {
  ProductMediaGallery,
  toGalleryItemsFromImages,
  type ProductGalleryItem,
} from "@/components/patterns/product-media-gallery";
import {
  ProductShippingEstimate,
  SHIPPING_ESTIMATE_COPY_PT,
} from "@/components/patterns/product-shipping-estimate";
import { ProductStickyBuyBar } from "@/components/patterns/product-sticky-buy-bar";
import { WishlistToggleButton } from "@/components/patterns/wishlist-toggle-button";
import type { AppLocale } from "@/constants/i18n";
import { trackViewItem } from "@/lib/analytics/ecommerce";
import type { ProductGalleryCopy } from "@/lib/i18n/product-gallery-copy";
import { resolveLowStockMessage } from "@/lib/i18n/pdp-copy";
import { formatDiscountPill } from "@/lib/shopify/compare-at-price";
import { formatInstallmentHint } from "@/lib/shopify/format-installment-hint";
import type { WishlistItem } from "@/lib/wishlist/types";
import { useEffect, useMemo, useRef, useState } from "react";

export type ProductPickerImage = {
  url: string;
  alt: string;
  width: number;
  height: number;
};

export type ProductPickerVariant = {
  id: string;
  available: boolean;
  priceLabel: string;
  /** Formatted Storefront compare-at when strictly above `price`; otherwise null. */
  compareAtPriceLabel: string | null;
  /** Integer percent off (1–99) matching `compareAtPriceLabel`. */
  discountPercent: number | null;
  availabilityLabel: string;
  options: { name: string; value: string }[];
  image: ProductPickerImage | null;
  quantityAvailable: number | null;
  /** GA4 item_id (product handle). */
  itemId: string;
  itemName: string;
  price: number;
  currency: string;
  itemVariant?: string;
};

export type ProductPickerCopy = {
  thumbnailLabel: string;
  unavailableSuffix: string;
};

export type ProductPickerCart = {
  action: AddToCartAction;
  locale: string;
  cartHref: string;
  copy: AddToCartCopy;
  buyNowAction?: BuyNowAction;
  buyNowCopy?: BuyNowCopy;
};

export type ProductPickerWishlist = {
  locale: AppLocale;
  item: Omit<WishlistItem, "savedAt">;
};

type ProductVariantPickerProps = {
  variants: ProductPickerVariant[];
  images: ProductPickerImage[];
  /** Prefers Storefront `media` (images + videos); falls back to `images` when empty. */
  mediaItems?: ProductGalleryItem[];
  galleryCopy: ProductGalleryCopy;
  copy: ProductPickerCopy;
  /** Only set when the cart is enabled and every variant id is a Shopify ProductVariant gid. */
  cart?: ProductPickerCart;
  /** Product snapshot for localStorage wishlist (handle-level, not per variant). */
  wishlist?: ProductPickerWishlist;
  lowStockTemplate: string;
  /** CMS `product_page.badge` label (localized); omit when absent. */
  badgeLabel?: string | null;
  /** `market_policy` shipping line; omit when incomplete. */
  shippingTrust?: string | null;
  /** Free-returns line when `returnFees=free`. */
  returnsTrust?: string | null;
  /** Already resolved on the server (`ui_string` or the built-in PDP copy). */
  checkoutTrust: string;
  /** PT-only payment microcopy (PIX/parcelas); empty for other locales. */
  paymentHint?: string | null;
  /** PT buy-box locale for installment math + CEP estimate. */
  buyBoxLocale?: AppLocale;
  /** `market_policy.installment_count` (BR). */
  installmentCount?: number | null;
  /** `market_policy.installment_multiplier` (BR). */
  installmentMultiplier?: number | null;
};

function optionGroups(variants: ProductPickerVariant[]): { name: string; values: string[] }[] {
  const groups = new Map<string, string[]>();
  for (const variant of variants) {
    for (const option of variant.options) {
      const values = groups.get(option.name) ?? [];
      if (!values.includes(option.value)) values.push(option.value);
      groups.set(option.name, values);
    }
  }
  return [...groups].map(([name, values]) => ({ name, values }));
}

function matchesAll(variant: ProductPickerVariant, selection: Record<string, string>): boolean {
  return variant.options.every((option) => selection[option.name] === option.value);
}

function selectionOf(variant: ProductPickerVariant | undefined): Record<string, string> {
  return Object.fromEntries((variant?.options ?? []).map((option) => [option.name, option.value]));
}

export function ProductVariantPicker({
  variants,
  images,
  mediaItems,
  galleryCopy,
  copy,
  cart,
  wishlist,
  lowStockTemplate,
  badgeLabel = null,
  shippingTrust = null,
  returnsTrust = null,
  checkoutTrust,
  paymentHint = null,
  buyBoxLocale,
  installmentCount = null,
  installmentMultiplier = null,
}: ProductVariantPickerProps) {
  const initial = variants.find((variant) => variant.available) ?? variants[0];
  const [selection, setSelection] = useState<Record<string, string>>(() => selectionOf(initial));
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(
    initial?.image?.url ?? images[0]?.url ?? null,
  );
  const [stickyVisible, setStickyVisible] = useState(false);
  const primaryAtcRef = useRef<HTMLDivElement>(null);

  const groups = useMemo(() => optionGroups(variants), [variants]);
  const showOptions = variants.length > 1 && groups.length > 0;
  const selected = variants.find((variant) => matchesAll(variant, selection)) ?? initial;

  const galleryItems = useMemo(() => {
    const base = mediaItems && mediaItems.length > 0 ? mediaItems : toGalleryItemsFromImages(images);
    const out = [...base];
    for (const variant of variants) {
      if (
        variant.image &&
        !out.some((item) => item.kind === "image" && item.url === variant.image?.url)
      ) {
        out.push({
          kind: "image",
          id: `img-${variant.image.url}`,
          url: variant.image.url,
          alt: variant.image.alt,
          width: variant.image.width,
          height: variant.image.height,
        });
      }
    }
    return out;
  }, [mediaItems, images, variants]);

  const installmentHint =
    buyBoxLocale === "pt" && selected
      ? formatInstallmentHint(
          buyBoxLocale,
          selected.price,
          selected.currency,
          installmentCount,
          installmentMultiplier,
        )
      : null;

  useEffect(() => {
    if (!selected) return;
    trackViewItem({
      currency: selected.currency,
      value: selected.price,
      items: [
        {
          item_id: selected.itemId,
          item_name: selected.itemName,
          price: selected.price,
          quantity: 1,
          item_variant: selected.itemVariant,
        },
      ],
    });
  }, [
    selected?.id,
    selected?.currency,
    selected?.price,
    selected?.itemId,
    selected?.itemName,
    selected?.itemVariant,
  ]);

  useEffect(() => {
    const node = primaryAtcRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = (entry: IntersectionObserverEntry) => {
      // Only after the primary ATC has scrolled above the viewport (not merely below the fold).
      setStickyVisible(
        !mq.matches && !entry.isIntersecting && entry.boundingClientRect.top < 0,
      );
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) sync(entry);
      },
      { root: null, rootMargin: "0px", threshold: 0 },
    );
    observer.observe(node);

    const onMq = () => {
      if (mq.matches) setStickyVisible(false);
    };
    mq.addEventListener("change", onMq);
    return () => {
      observer.disconnect();
      mq.removeEventListener("change", onMq);
    };
  }, [cart, selected?.id]);

  function choose(name: string, value: string) {
    const next = { ...selection, [name]: value };
    const variant =
      variants.find((candidate) => matchesAll(candidate, next)) ??
      variants.find((candidate) => candidate.options.some((o) => o.name === name && o.value === value));
    if (!variant) return;
    setSelection(selectionOf(variant));
    if (variant.image) setActiveImageUrl(variant.image.url);
  }

  function isValueAvailable(name: string, value: string): boolean {
    const next = { ...selection, [name]: value };
    return variants.some((variant) => variant.available && matchesAll(variant, next));
  }

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-10">
      <ProductMediaGallery
        items={galleryItems}
        activeImageUrl={activeImageUrl}
        onActiveImageUrlChange={setActiveImageUrl}
        thumbnailLabel={copy.thumbnailLabel}
        galleryCopy={galleryCopy}
      />

      <div className="space-y-6">
        {selected ? (
          <div className="flex items-start justify-between gap-3">
            <div aria-live="polite" className="min-w-0 flex-1 space-y-1">
              {badgeLabel ? (
                <p className="inline-flex rounded-md bg-foreground px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-background">
                  {badgeLabel}
                </p>
              ) : null}
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="type-heading">{selected.priceLabel}</p>
                {selected.compareAtPriceLabel && selected.discountPercent != null ? (
                  <>
                    <s className="text-base text-muted-foreground">{selected.compareAtPriceLabel}</s>
                    <span
                      data-discount-pill=""
                      className="rounded-md bg-foreground px-2 py-0.5 text-xs font-semibold text-background"
                    >
                      {formatDiscountPill(selected.discountPercent)}
                    </span>
                  </>
                ) : null}
              </div>
              {installmentHint ? (
                <p className="text-sm font-medium text-foreground">{installmentHint}</p>
              ) : null}
              {paymentHint?.trim() ? (
                <p className="text-sm text-muted-foreground">{paymentHint.trim()}</p>
              ) : null}
              <p className="text-sm text-muted-foreground">{selected.availabilityLabel}</p>
              <LowStockBadge
                quantityAvailable={selected.quantityAvailable}
                message={resolveLowStockMessage(lowStockTemplate, selected.quantityAvailable ?? 0)}
              />
            </div>
            {wishlist ? (
              <WishlistToggleButton locale={wishlist.locale} item={wishlist.item} className="shrink-0" />
            ) : null}
          </div>
        ) : null}

        {showOptions
          ? groups.map((group) => (
              <div key={group.name} role="radiogroup" aria-label={group.name} className="space-y-3">
                <p className="text-sm font-medium text-foreground">{group.name}</p>
                <div className="flex flex-wrap gap-2">
                  {group.values.map((value) => {
                    const checked = selection[group.name] === value;
                    const available = isValueAvailable(group.name, value);
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={checked}
                        onClick={() => choose(group.name, value)}
                        className={[
                          "touch-target-text cursor-pointer rounded-lg border text-sm font-medium transition",
                          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                          checked
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background text-foreground hover:border-foreground/40",
                          available ? "" : "line-through opacity-60",
                        ].join(" ")}
                      >
                        {value}
                        {available ? null : <span className="sr-only"> {copy.unavailableSuffix}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          : null}

        {cart && selected ? (
          <div className="flex flex-col gap-3">
            <div ref={primaryAtcRef}>
              <AddToCartButton
                action={cart.action}
                variantId={selected.id}
                available={selected.available}
                locale={cart.locale}
                cartHref={cart.cartHref}
                copy={cart.copy}
                currency={selected.currency}
                item={{
                  item_id: selected.itemId,
                  item_name: selected.itemName,
                  price: selected.price,
                  quantity: 1,
                  item_variant: selected.itemVariant,
                }}
              />
            </div>
            {cart.buyNowAction && cart.buyNowCopy ? (
              <BuyNowButton
                action={cart.buyNowAction}
                variantId={selected.id}
                available={selected.available}
                locale={cart.locale}
                copy={cart.buyNowCopy}
              />
            ) : null}
          </div>
        ) : null}
        <div className="space-y-1.5 text-sm text-muted-foreground">
          {shippingTrust ? <p>{shippingTrust}</p> : null}
          {buyBoxLocale === "pt" ? (
            <ProductShippingEstimate
              locale="pt"
              subtotal={selected?.price ?? null}
              copy={SHIPPING_ESTIMATE_COPY_PT}
            />
          ) : null}
          {returnsTrust ? <p>{returnsTrust}</p> : null}
          {checkoutTrust ? <p>{checkoutTrust}</p> : null}
        </div>
      </div>

      {cart && selected ? (
        <ProductStickyBuyBar
          title={selected.itemName}
          priceLabel={selected.priceLabel}
          visible={stickyVisible}
        >
          <AddToCartButton
            action={cart.action}
            variantId={selected.id}
            available={selected.available}
            locale={cart.locale}
            cartHref={cart.cartHref}
            copy={cart.copy}
            currency={selected.currency}
            item={{
              item_id: selected.itemId,
              item_name: selected.itemName,
              price: selected.price,
              quantity: 1,
              item_variant: selected.itemVariant,
            }}
          />
        </ProductStickyBuyBar>
      ) : null}
    </div>
  );
}
