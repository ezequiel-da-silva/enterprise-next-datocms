"use client";

import { AddToCartButton, type AddToCartAction, type AddToCartCopy } from "@/components/patterns/add-to-cart-button";
import { LowStockBadge } from "@/components/patterns/low-stock-badge";
import { WishlistToggleButton } from "@/components/patterns/wishlist-toggle-button";
import type { AppLocale } from "@/constants/i18n";
import { trackViewItem } from "@/lib/analytics/ecommerce";
import { resolveLowStockMessage } from "@/lib/i18n/pdp-copy";
import type { WishlistItem } from "@/lib/wishlist/types";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

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
};

export type ProductPickerWishlist = {
  locale: AppLocale;
  item: Omit<WishlistItem, "savedAt">;
};

type ProductVariantPickerProps = {
  variants: ProductPickerVariant[];
  images: ProductPickerImage[];
  copy: ProductPickerCopy;
  /** Only set when the cart is enabled and every variant id is a Shopify ProductVariant gid. */
  cart?: ProductPickerCart;
  /** Product snapshot for localStorage wishlist (handle-level, not per variant). */
  wishlist?: ProductPickerWishlist;
  lowStockTemplate: string;
  /** Already resolved on the server (`ui_string` or the built-in PDP copy). */
  checkoutTrust: string;
};

const MAIN_SIZES = "(max-width: 768px) 100vw, 720px";

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
  copy,
  cart,
  wishlist,
  lowStockTemplate,
  checkoutTrust,
}: ProductVariantPickerProps) {
  const initial = variants.find((variant) => variant.available) ?? variants[0];
  const [selection, setSelection] = useState<Record<string, string>>(() => selectionOf(initial));
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(
    initial?.image?.url ?? images[0]?.url ?? null,
  );

  const groups = useMemo(() => optionGroups(variants), [variants]);
  const showOptions = variants.length > 1 && groups.length > 0;
  const selected = variants.find((variant) => matchesAll(variant, selection)) ?? initial;

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

  const gallery = useMemo(() => {
    const out = [...images];
    for (const variant of variants) {
      if (variant.image && !out.some((image) => image.url === variant.image?.url)) out.push(variant.image);
    }
    return out;
  }, [images, variants]);
  const mainImage = gallery.find((image) => image.url === activeImageUrl) ?? gallery[0] ?? null;

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
      {mainImage ? (
        <div className="space-y-3">
          <figure className="overflow-hidden rounded-xl border border-border bg-muted/20">
            <Image
              key={mainImage.url}
              src={mainImage.url}
              alt={mainImage.alt}
              width={mainImage.width}
              height={mainImage.height}
              sizes={MAIN_SIZES}
              priority
              fetchPriority="high"
              className="h-auto w-full object-cover"
            />
          </figure>
          {gallery.length > 1 ? (
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {gallery.map((image, index) => {
                const pressed = image.url === mainImage.url;
                return (
                  <li key={image.url}>
                    <button
                      type="button"
                      aria-pressed={pressed}
                      aria-label={`${copy.thumbnailLabel} ${index + 1}`}
                      onClick={() => setActiveImageUrl(image.url)}
                      className={[
                        "touch-target cursor-pointer overflow-hidden rounded-xl border border-border bg-muted/20 p-0",
                        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        pressed ? "border-foreground" : "hover:border-foreground/40",
                      ].join(" ")}
                    >
                      <Image
                        src={image.url}
                        alt=""
                        width={64}
                        height={64}
                        sizes="64px"
                        loading="lazy"
                        className="h-16 w-16 object-cover"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ) : (
        <div />
      )}

      <div className="space-y-6">
        {selected ? (
          <div className="flex items-start justify-between gap-3">
            <div aria-live="polite" className="min-w-0 flex-1 space-y-1">
              <p className="type-heading">{selected.priceLabel}</p>
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
        ) : null}
        {checkoutTrust ? <p className="text-sm text-muted-foreground">{checkoutTrust}</p> : null}
      </div>
    </div>
  );
}
