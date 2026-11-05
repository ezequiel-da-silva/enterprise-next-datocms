import { Button } from "@/components/atoms/button";
import { DatoResponsivePicture } from "@/components/patterns/dato-responsive-picture";
import { FeatureGridCardIcon } from "@/components/patterns/feature-grid-card-icon";
import { SmartLink } from "@/components/patterns/smart-link";
import type { AppLocale } from "@/constants/i18n";
import type { CardRecord } from "@/infra/datocms/types-page";
import type { StorefrontProductImage } from "@/infra/shopify/storefront";
import { cmsBlockAttrs } from "@/lib/datocms/cms-block-attrs";
import type { FeatureGridCardContent } from "@/lib/datocms/resolve-feature-grid-card";
import { cn } from "@/lib/cn";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export type FeatureGridCardHeading = "h2" | "h3";

const CARD_IMAGE_SIZES =
  "(max-width: 767px) calc(100vw - 2rem), (max-width: 1023px) calc((min(100vw, 64rem) - 3rem) / 2), 360px";
const FULL_BLEED_SIZES = "(max-width: 1023px) calc(100vw - 2rem), 1024px";

export type CardItemProps = {
  card: CardRecord;
  locale: AppLocale;
  content: FeatureGridCardContent;
  heading?: FeatureGridCardHeading;
  /** Primeiro cartão visível: a imagem entra sem lazy. */
  priority?: boolean;
};

function CatalogImage({
  image,
  alt,
  className,
  sizes,
  decorative = false,
  priority = false,
}: {
  image: StorefrontProductImage;
  alt: string;
  className: string;
  sizes: string;
  decorative?: boolean;
  priority?: boolean;
}) {
  return (
    <Image
      src={image.url}
      alt={decorative ? "" : image.altText?.trim() || alt}
      width={image.width && image.width > 0 ? image.width : 600}
      height={image.height && image.height > 0 ? image.height : 600}
      sizes={sizes}
      className={className}
      priority={priority}
      fetchPriority={priority ? "high" : undefined}
    />
  );
}

function maybeCatalogLink(href: string | null, children: ReactNode, className?: string) {
  if (!href) return children;
  return (
    <Link
      href={href}
      className={cn(
        "flex h-full min-w-0 w-full flex-col rounded-[inherit] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function CardItem({ card, locale, content, heading = "h3", priority = false }: CardItemProps) {
  const TitleTag = heading;
  const hasMedia = Boolean(content.catalogImage?.url || content.image?.url);
  const isInteractive = Boolean(content.href || content.link);

  const body = (
    <>
      {hasMedia ? (
        <div className="relative">
          <figure className="aspect-[16/10] w-full overflow-hidden bg-muted [&>picture]:block [&>picture]:h-full [&>picture]:w-full">
            {content.catalogImage?.url ? (
              <CatalogImage
                image={content.catalogImage}
                alt={content.title}
                sizes={CARD_IMAGE_SIZES}
                priority={priority}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            ) : (
              <DatoResponsivePicture
                mobile={content.image}
                desktop={content.desktopImage}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                sizes={CARD_IMAGE_SIZES}
                fallbackAlt={content.title || undefined}
                priority={priority}
              />
            )}
          </figure>
          {content.icon ? (
            <FeatureGridCardIcon
              icon={content.icon}
              className="absolute bottom-0 left-6 translate-y-1/2 border border-border bg-background"
            />
          ) : null}
        </div>
      ) : null}

      <div className={cn("flex flex-1 flex-col p-6", hasMedia && "pt-10")}>
        {content.icon && !hasMedia ? (
          <FeatureGridCardIcon icon={content.icon} className="mb-4" />
        ) : null}
        {content.title ? (
          <TitleTag className="text-balance text-lg font-semibold tracking-tight text-foreground">
            {content.title}
          </TitleTag>
        ) : null}
        {content.description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{content.description}</p>
        ) : null}
        {content.priceLabel ? (
          <p className="mt-auto pt-3 text-sm text-muted-foreground">{content.priceLabel}</p>
        ) : null}
        {content.link ? (
          <div className="mt-auto pt-6">
            <Button asChild variant="outline" className="min-h-12 w-full sm:w-auto">
              <SmartLink record={content.link} locale={locale} tone="inherit">
                {content.linkLabel}
              </SmartLink>
            </Button>
          </div>
        ) : null}
      </div>
    </>
  );

  return (
    <article
      {...cmsBlockAttrs(card)}
      data-datocms-content-link-boundary=""
      className={cn(
        "group flex h-full w-full min-w-0 flex-col",
        isInteractive
          ? "overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-colors duration-200 hover:border-foreground/20 motion-reduce:transition-none"
          : "text-foreground",
      )}
    >
      {maybeCatalogLink(content.href, body)}
    </article>
  );
}

export type FullBleedCardProps = {
  card: CardRecord;
  locale: AppLocale;
  content: FeatureGridCardContent;
  heading?: FeatureGridCardHeading;
  /** Primeiro cartão visível: a imagem entra sem lazy. */
  priority?: boolean;
};

export function FullBleedCard({ card, locale, content, heading = "h3", priority = false }: FullBleedCardProps) {
  const TitleTag = heading;
  const imageIsDecorative = Boolean(content.title || content.description);
  const hasDatoImage = Boolean(content.image?.url);
  const hasCatalogImage = Boolean(content.catalogImage?.url);

  const body = (
    <>
      {hasCatalogImage && content.catalogImage ? (
        <figure className="absolute inset-0">
          <CatalogImage
            image={content.catalogImage}
            alt={content.title}
            decorative={imageIsDecorative}
            className="h-full w-full object-cover"
            sizes={FULL_BLEED_SIZES}
            priority={priority}
          />
        </figure>
      ) : hasDatoImage ? (
        <figure className="absolute inset-0 [&>picture]:block [&>picture]:h-full [&>picture]:w-full">
          <DatoResponsivePicture
            mobile={content.image}
            desktop={content.desktopImage}
            decorative={imageIsDecorative}
            className="h-full w-full object-cover"
            sizes={FULL_BLEED_SIZES}
            priority={priority}
          />
        </figure>
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/20" aria-hidden />
      <div className="relative z-10 mt-auto p-6 text-left text-white sm:p-10 lg:p-14">
        {content.title ? (
          <TitleTag className={cn("type-heading", "text-white")}>{content.title}</TitleTag>
        ) : null}
        {content.description ? (
          <p className={cn("type-lead", "mt-3 text-white/85")}>{content.description}</p>
        ) : null}
        {content.priceLabel ? (
          <p className="mt-3 text-base text-white/85">{content.priceLabel}</p>
        ) : null}
        {content.link ? (
          <div className="mt-6">
            <Button asChild variant="primary" className="min-h-12">
              <SmartLink record={content.link} locale={locale} tone="inherit">
                {content.linkLabel}
              </SmartLink>
            </Button>
          </div>
        ) : null}
      </div>
    </>
  );

  return (
    <article
      {...cmsBlockAttrs(card)}
      data-datocms-content-link-boundary=""
      className="relative flex h-[450px] overflow-hidden rounded-xl bg-foreground text-background lg:h-[600px]"
    >
      {maybeCatalogLink(content.href, body, "relative h-full")}
    </article>
  );
}
