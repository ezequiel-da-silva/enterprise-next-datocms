"use client";

import { IconButton } from "@/components/atoms/icon-button";
import type { AppLocale } from "@/constants/i18n";
import type { StorefrontProductImage } from "@/infra/shopify/storefront";
import { cn } from "@/lib/cn";
import Image from "next/image";
import { useState, type MouseEvent } from "react";

type CatalogProductMediaProps = {
  locale: AppLocale;
  title: string;
  image: StorefrontProductImage | null;
  hoverImage: StorefrontProductImage | null;
  sizes: string;
  soldOut: boolean;
};

function viewBaseLabel(locale: AppLocale): string {
  if (locale === "pt") return "Ver base";
  if (locale === "es") return "Ver base";
  return "Show base";
}

function viewDeckLabel(locale: AppLocale): string {
  if (locale === "pt") return "Ver deck";
  if (locale === "es") return "Ver deck";
  return "Show deck";
}

/**
 * Featured image with optional base/hover alternate.
 * Fine pointers get CSS group-hover; coarse/touch get an explicit toggle.
 */
export function CatalogProductMedia({
  locale,
  title,
  image,
  hoverImage,
  sizes,
  soldOut,
}: CatalogProductMediaProps) {
  const [showBase, setShowBase] = useState(false);
  const hasHover = Boolean(hoverImage?.url);

  function onToggle(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setShowBase((open) => !open);
  }

  if (!image?.url) {
    return <div className={cn("relative aspect-square w-full shrink-0 overflow-hidden bg-muted", soldOut && "opacity-75")} />;
  }

  return (
    <div className={cn("relative aspect-square w-full shrink-0 overflow-hidden bg-muted", soldOut && "opacity-75")}>
      <Image
        src={image.url}
        alt={image.altText?.trim() || title}
        width={image.width && image.width > 0 ? image.width : 600}
        height={image.height && image.height > 0 ? image.height : 600}
        sizes={sizes}
        loading="lazy"
        className={cn(
          "h-full w-full object-cover",
          hasHover &&
            "motion-safe:[@media(hover:hover)_and_(pointer:fine)]:transition-opacity motion-safe:[@media(hover:hover)_and_(pointer:fine)]:duration-300 motion-safe:[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-0",
          hasHover && showBase && "opacity-0",
        )}
      />
      {hoverImage?.url ? (
        <Image
          src={hoverImage.url}
          alt=""
          width={hoverImage.width && hoverImage.width > 0 ? hoverImage.width : 600}
          height={hoverImage.height && hoverImage.height > 0 ? hoverImage.height : 600}
          sizes={sizes}
          loading="lazy"
          aria-hidden
          className={cn(
            "absolute inset-0 h-full w-full object-cover opacity-0",
            "motion-safe:[@media(hover:hover)_and_(pointer:fine)]:transition-opacity motion-safe:[@media(hover:hover)_and_(pointer:fine)]:duration-300 motion-safe:[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100",
            showBase && "opacity-100",
          )}
        />
      ) : null}
      {hasHover ? (
        <IconButton
          type="button"
          className="absolute bottom-3 right-3 z-10 border-border/80 bg-background/95 shadow-sm [@media(hover:hover)_and_(pointer:fine)]:hidden"
          aria-label={showBase ? viewDeckLabel(locale) : viewBaseLabel(locale)}
          aria-pressed={showBase}
          onClick={onToggle}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wide" aria-hidden>
            {showBase ? "Deck" : "Base"}
          </span>
        </IconButton>
      ) : null}
    </div>
  );
}
