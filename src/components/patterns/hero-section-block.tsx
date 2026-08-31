import type { AppLocale } from "@/constants/i18n";
import { Button } from "@/components/atoms/button";
import { DatoResponsivePicture } from "@/components/patterns/dato-responsive-picture";
import { SmartLink } from "@/components/patterns/smart-link";
import { StructuredTextRenderer } from "@/components/patterns/structured-text-renderer";
import type { FileFieldLike, HeroSectionRecord, LinkBlockRecord } from "@/infra/datocms/types-page";
import {
  readCdaArray,
  readCdaBool,
  readCdaObject,
  readCdaString,
  readCdaStringForLogic,
} from "@/lib/datocms/cda-field";
import { cmsBlockAttrs } from "@/lib/datocms/cms-block-attrs";
import { resolveLinkBlock } from "@/lib/datocms/link-block";
import { cn } from "@/lib/cn";
import type { CdaStructuredTextValue } from "datocms-structured-text-utils";

type HeroLayout = "text" | "image_side" | "image_overlay";

function imageBlockMobileAsset(
  block: { asset?: FileFieldLike | null; image?: FileFieldLike | null } | null | undefined,
): FileFieldLike | null {
  if (!block) return null;
  return block.asset?.url ? block.asset : block.image?.url ? block.image : null;
}

function imageBlockDesktopAsset(
  block: { assetDesktop?: FileFieldLike | null; asset?: FileFieldLike | null } | null | undefined,
): FileFieldLike | null | undefined {
  if (!block) return undefined;
  return block.assetDesktop?.url ? block.assetDesktop : undefined;
}

function readLayout(record: HeroSectionRecord): HeroLayout {
  const raw = readCdaStringForLogic(record, "layoutHero", "layout_hero").toLowerCase();
  const compact = raw.replace(/[\s-]+/g, "_");
  if (/_overlay\b/.test(compact) || compact === "overlay") return "image_overlay";
  if (/_side\b/.test(compact) || /\bimage_side\b/.test(compact)) return "image_side";
  return "text";
}

function structuredTextValueHasContent(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value !== "object") return false;
  const doc = (value as { document?: { children?: unknown[] } }).document;
  if (!doc?.children || !Array.isArray(doc.children)) return false;
  return dastChildrenHaveText(doc.children);
}

function dastChildrenHaveText(nodes: unknown[]): boolean {
  for (const node of nodes) {
    if (node == null || typeof node !== "object") continue;
    const n = node as Record<string, unknown>;
    if (n.type === "span" && typeof n.value === "string" && n.value.trim() !== "") return true;
    if (Array.isArray(n.children) && dastChildrenHaveText(n.children)) return true;
  }
  return false;
}

function subtitleData(record: HeroSectionRecord) {
  return record.subtitleHero ?? readCdaObject<NonNullable<HeroSectionRecord["subtitleHero"]>>(record as Record<string, unknown>, "subtitleHero", "subtitle_hero");
}

function buttons(record: HeroSectionRecord): LinkBlockRecord[] {
  const raw =
    record.buttonHero ?? readCdaArray<LinkBlockRecord>(record, "buttonHero", "button_hero");
  return raw.filter((b): b is LinkBlockRecord => b != null && b.__typename === "LinkRecord");
}

function imageHero(record: HeroSectionRecord) {
  return record.imageHero ?? readCdaObject<NonNullable<HeroSectionRecord["imageHero"]>>(record as Record<string, unknown>, "imageHero", "image_hero");
}

function imageOverlay(record: HeroSectionRecord) {
  return record.imageOverlay ?? readCdaObject<NonNullable<HeroSectionRecord["imageOverlay"]>>(record as Record<string, unknown>, "imageOverlay", "image_overlay");
}

function HeroButtons({ record, locale }: { record: HeroSectionRecord; locale: AppLocale }) {
  if (!readCdaBool(record, "showButton", "show_button")) return null;
  const items = buttons(record).filter((link) => {
    const label = (link.ctaLabel ?? "").trim();
    return label.length > 0 && resolveLinkBlock(link, locale) != null;
  });
  if (items.length === 0) return null;
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {items.map((link) => (
        <Button key={link.id} asChild variant="primary">
          <SmartLink record={link} locale={locale} />
        </Button>
      ))}
    </div>
  );
}

function HeroSubtitle({
  record,
  locale,
  className,
  contentLinkGroup,
}: {
  record: HeroSectionRecord;
  locale: AppLocale;
  className?: string;
  contentLinkGroup: boolean;
}) {
  const data = subtitleData(record);
  if (!data || !structuredTextValueHasContent(data.value)) return null;
  return (
    <div className={cn("mt-4 text-lg text-muted-foreground [&_p]:mt-0", className)}>
      <StructuredTextRenderer
        data={data as unknown as CdaStructuredTextValue}
        contentLinkGroup={contentLinkGroup}
        locale={locale}
      />
    </div>
  );
}

function HeroTitle({
  title,
  className,
  contentLinkGroup,
}: {
  title: string;
  className?: string;
  contentLinkGroup: boolean;
}) {
  const heading = (
    <h1 className={cn("text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl", className)}>
      {title}
    </h1>
  );
  if (!contentLinkGroup) return heading;
  return <div data-datocms-content-link-group="">{heading}</div>;
}

export function HeroSectionBlock({
  record,
  locale,
  contentLinkGroup = false,
}: {
  record: HeroSectionRecord;
  locale: AppLocale;
  contentLinkGroup?: boolean;
}) {
  const layout = readLayout(record);
  const title = readCdaString(record, "titleHero", "title_hero");
  const showHeroImg = readCdaBool(record, "showImageHero", "show_image_hero");
  const showOverlayImg = readCdaBool(record, "showImageOverlay", "show_image_overlay");
  const heroImg = imageHero(record);
  const overlayImg = imageOverlay(record);
  const heroMobile = showHeroImg ? imageBlockMobileAsset(heroImg) : null;

  const textColumn = (
    <div className="min-w-0 flex-1">
      {title ? <HeroTitle title={title} contentLinkGroup={contentLinkGroup} /> : null}
      <HeroSubtitle record={record} locale={locale} contentLinkGroup={contentLinkGroup} />
      <HeroButtons record={record} locale={locale} />
    </div>
  );

  if (layout === "image_side") {
    return (
      <section
        {...cmsBlockAttrs(record)}
        data-datocms-content-link-boundary=""
        className="not-prose mb-12 grid gap-10 md:grid-cols-2 md:items-center md:gap-12"
      >
        {textColumn}
        {showHeroImg && heroMobile ? (
          <figure className="aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted/30 shadow-sm ring-1 ring-border/50 [&>picture]:block [&>picture]:h-full [&>picture]:w-full">
            <DatoResponsivePicture
              mobile={heroMobile}
              desktop={imageBlockDesktopAsset(heroImg)}
              className="h-full w-full object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 496px"
              fallbackAlt={title || undefined}
              priority
            />
          </figure>
        ) : (
          <div aria-hidden className="hidden md:block" />
        )}
      </section>
    );
  }

  if (layout === "image_overlay") {
    const overlayMobile = showOverlayImg ? imageBlockMobileAsset(overlayImg) : null;
    const hasOverlayBg = Boolean(overlayMobile?.url);
    const showHeroColumn = Boolean(showHeroImg && heroMobile);

    return (
      <section
        {...cmsBlockAttrs(record)}
        data-datocms-content-link-boundary=""
        className={cn(
          "not-prose relative mb-12 min-h-[280px] overflow-hidden rounded-2xl border border-border",
          !hasOverlayBg && "bg-muted/40",
        )}
      >
        {hasOverlayBg ? (
          <div className="absolute inset-0">
            <DatoResponsivePicture
              mobile={overlayMobile!}
              desktop={imageBlockDesktopAsset(overlayImg)}
              className="h-full w-full object-cover"
              sizes="(max-width: 1024px) 100vw, 992px"
              fallbackAlt={title || undefined}
              priority
            />
            <div className="absolute inset-0 bg-black/25 dark:bg-black/30" aria-hidden />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/20" aria-hidden />
          </div>
        ) : null}

        <div
          className={cn(
            "relative z-10 grid gap-10 px-4 py-10 sm:px-6 md:gap-12 md:px-8 md:py-12",
            showHeroColumn ? "md:grid-cols-2 md:items-center" : "mx-auto w-full max-w-2xl",
          )}
        >
          <div className="min-w-0">
            <div
              className={cn(
                "rounded-2xl border px-6 py-8 shadow-lg ring-1 backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-lg",
                hasOverlayBg
                  ? "border-white/15 bg-black/55 text-white ring-black/30 supports-[backdrop-filter]:bg-black/45 [&_a]:text-white [&_a]:underline-offset-4 [&_a]:hover:text-white/90"
                  : "border-border bg-background/95 text-foreground ring-border/60",
              )}
            >
              {title ? (
                <HeroTitle
                  title={title}
                  className={hasOverlayBg ? "text-white" : undefined}
                  contentLinkGroup={contentLinkGroup}
                />
              ) : null}
              <HeroSubtitle
                record={record}
                locale={locale}
                contentLinkGroup={contentLinkGroup}
                className={
                  hasOverlayBg
                    ? "mt-4 text-lg text-white/95 [&_p]:mt-0 [&_a]:text-white"
                    : "mt-4 text-lg text-muted-foreground [&_p]:mt-0 [&_a]:text-primary"
                }
              />
              <HeroButtons record={record} locale={locale} />
            </div>
          </div>

          {showHeroColumn ? (
            <figure className="aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted/30 shadow-sm ring-1 ring-border/50 [&>picture]:block [&>picture]:h-full [&>picture]:w-full">
              <DatoResponsivePicture
                mobile={heroMobile!}
                desktop={imageBlockDesktopAsset(heroImg)}
                className="h-full w-full object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 496px"
                fallbackAlt={title || undefined}
                priority={!hasOverlayBg}
              />
            </figure>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section {...cmsBlockAttrs(record)} data-datocms-content-link-boundary="" className="not-prose mb-12 max-w-3xl">
      {textColumn}
    </section>
  );
}
