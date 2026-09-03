import type { AppLocale } from "@/constants/i18n";
import type { LatestPostsCatalog } from "@/infra/datocms/types-blog";
import type { UserReviewSubmitAction } from "@/core/entities/user-review";
import { JsonLdScriptSync } from "@/components/patterns/seo-manager";
import { DatoResponsivePicture } from "@/components/patterns/dato-responsive-picture";
import type {
  CtaBannerBlockRecord,
  FeatureGridRecord,
  BlogPostsSectionBlockRecord,
  PageStructuredTextBlock,
  PricingSectionBlockRecord,
  ReviewsSectionBlockRecord,
  StatsSectionBlockRecord,
  StepsSectionBlockRecord,
  TabsSectionBlockRecord,
  TeamSectionBlockRecord,
  VideoBlockWithCaptions,
} from "@/infra/datocms/types-page";
import { FeatureGridBlock } from "@/components/patterns/feature-grid-block";
import { CtaBannerBlock } from "@/components/sections/cta-banner-block";
import { LogoGridBlock } from "@/components/sections/logo-grid-block";
import { PricingSectionBlock } from "@/components/sections/pricing-section-block";
import { ReviewsSectionBlock } from "@/components/sections/reviews-section-block";
import { StatsSectionBlock } from "@/components/sections/stats-section-block";
import { StepsSectionBlock } from "@/components/sections/steps-section-block";
import { TabsSectionBlock } from "@/components/sections/tabs-section-block";
import { TeamSectionBlock } from "@/components/sections/team-section-block";
import { LatestPostsSectionBlock, LatestPostsSectionFallback } from "@/components/sections/latest-posts-section-block";
import { FaqGroupBlock } from "@/components/patterns/faq-group-block";
import { readCdaObject } from "@/lib/datocms/cda-field";
import { cmsBlockAttrs } from "@/lib/datocms/cms-block-attrs";
import { clampLayoutDimensions } from "@/lib/datocms-image-loader";
import { resolveVideoSources } from "@/lib/datocms/resolve-video-sources";
import { buildVideoObjectJsonLd } from "@/lib/seo/build-video-object-jsonld";
import { getNonce } from "@/lib/nonce";
import Image from "next/image";
import { Suspense } from "react";

type StructuredTextBlockViewProps = {
  record: PageStructuredTextBlock;
  locale: AppLocale;
  submitUserReview?: UserReviewSubmitAction;
  latestPostsCatalog?: LatestPostsCatalog | Promise<LatestPostsCatalog>;
};

function unknownBlockFallback(record: PageStructuredTextBlock): null {
  const typename = record.__typename ?? "Unknown";
  if (process.env.NODE_ENV === "development") {
    console.warn(`[StructuredText] Bloco ST não implementado: ${typename} (id: ${"id" in record ? record.id : "?"})`);
  }
  return null;
}

function readVideoCaptions(record: VideoBlockWithCaptions): { url: string; label: string } | null {
  const ext = record as Record<string, unknown>;
  const file =
    readCdaObject<{ url?: string | null; title?: string | null }>(ext, "captions", "captions") ??
    readCdaObject<{ url?: string | null; title?: string | null }>(ext, "captionsFile", "captions_file") ??
    readCdaObject<{ url?: string | null; title?: string | null }>(ext, "subtitleFile", "subtitle_file");
  const url = file?.url?.trim();
  if (!url) return null;
  return { url, label: file?.title?.trim() || "Legendas" };
}

async function VideoBlockView({
  record,
  locale,
}: {
  record: Extract<PageStructuredTextBlock, { __typename: "VideoBlockRecord" }>;
  locale: AppLocale;
}) {
  const v = record.asset;
  const resolved = resolveVideoSources(v);
  if (!resolved) return null;
  const label = v?.title?.trim() || "Vídeo";
  const captions = readVideoCaptions(record);
  const aspectStyle = {
    aspectRatio:
      resolved.width && resolved.height
        ? `${resolved.width} / ${resolved.height}`
        : "16 / 9",
  };
  const contentUrl = resolved.sources[0]?.src;
  const videoLd =
    contentUrl &&
    buildVideoObjectJsonLd({
      id: String(record.id),
      name: label,
      contentUrl,
      thumbnailUrl: resolved.poster,
      durationSeconds: resolved.durationSeconds,
      width: resolved.width,
      height: resolved.height,
    });
  const nonce = videoLd ? await getNonce() : undefined;

  return (
    <figure
      {...cmsBlockAttrs(record)}
      data-datocms-content-link-boundary=""
      data-datocms-content-link-url={record._editingUrl ?? undefined}
      className="my-6"
    >
      {videoLd ? <JsonLdScriptSync graph={videoLd} nonce={nonce} /> : null}
      <video
        controls
        className="h-auto w-full max-w-full rounded-md"
        width={resolved.width ?? 16}
        height={resolved.height ?? 9}
        style={aspectStyle}
        poster={resolved.poster}
        preload="none"
        playsInline
        aria-label={label}
      >
        {resolved.sources.map((source) => (
          <source key={source.src} src={source.src} type={source.type} />
        ))}
        {captions ? (
          <track
            kind="captions"
            src={captions.url}
            label={captions.label}
            srcLang={locale}
            default
          />
        ) : null}
      </video>
      {v?.title ? <figcaption className="mt-2 text-sm text-muted-foreground">{v.title}</figcaption> : null}
    </figure>
  );
}

/**
 * Blocos modulares partilhados entre `PageContentBlocks` e `StructuredTextView` (posts).
 */
export function StructuredTextBlockView({
  record,
  locale,
  submitUserReview,
  latestPostsCatalog,
}: StructuredTextBlockViewProps) {
  switch (record.__typename) {
    case "ImageBlockRecord": {
      const mobile = record.asset;
      if (!mobile?.url) return null;
      const w = mobile.width ?? 16;
      const h = mobile.height ?? 9;
      return (
        <figure
          {...cmsBlockAttrs(record)}
          data-datocms-content-link-boundary=""
          className="my-6 overflow-hidden rounded-md [&>picture]:block [&>picture]:h-full [&>picture]:w-full"
          style={{ aspectRatio: `${w} / ${h}` }}
        >
          <DatoResponsivePicture
            mobile={mobile}
            desktop={record.assetDesktop}
            className="h-full w-full max-w-full object-cover"
            sizes="(max-width: 768px) 100vw, 992px"
            decorative={!mobile.alt?.trim()}
          />
        </figure>
      );
    }
    case "ImageGalleryBlockRecord": {
      const items = record.assets?.filter((a) => a?.url) ?? [];
      if (items.length === 0) return null;
      return (
        <div {...cmsBlockAttrs(record)} data-datocms-content-link-boundary="" className="my-6 grid gap-3 sm:grid-cols-2">
          {items.map((img, i) => {
            const layout = clampLayoutDimensions(img.width ?? 800, img.height ?? 600);
            const blurDataURL = img.blurUpThumb?.trim() ?? "";
            return (
              <figure
                key={`${record.id}-${i}`}
                className="aspect-[4/3] overflow-hidden rounded-md border border-border"
              >
                <Image
                  src={img.url}
                  alt={img.alt?.trim() ?? ""}
                  width={layout.width}
                  height={layout.height}
                  quality={75}
                  loading="lazy"
                  className="h-full w-full object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 480px"
                  {...(blurDataURL
                    ? { placeholder: "blur" as const, blurDataURL }
                    : {})}
                />
              </figure>
            );
          })}
        </div>
      );
    }
    case "VideoBlockRecord":
      return <VideoBlockView record={record} locale={locale} />;
    case "FeatureGridRecord":
      return <FeatureGridBlock record={record as FeatureGridRecord} locale={locale} />;
    case "FaqGroupRecord":
      return <FaqGroupBlock record={record} />;
    case "CtaBannerRecord":
      return <CtaBannerBlock record={record as CtaBannerBlockRecord} locale={locale} />;
    case "LogoGridRecord":
      return <LogoGridBlock record={record} locale={locale} />;
    case "ReviewsSectionRecord":
      return (
        <ReviewsSectionBlock
          record={record as ReviewsSectionBlockRecord}
          locale={locale}
          action={submitUserReview}
        />
      );
    case "PricingSectionRecord":
      return <PricingSectionBlock record={record as PricingSectionBlockRecord} locale={locale} />;
    case "StatsSectionRecord":
      return <StatsSectionBlock record={record as StatsSectionBlockRecord} locale={locale} />;
    case "StepsSectionRecord":
      return <StepsSectionBlock record={record as StepsSectionBlockRecord} locale={locale} />;
    case "TabsSectionRecord":
      return <TabsSectionBlock record={record as TabsSectionBlockRecord} locale={locale} />;
    case "TeamSectionRecord":
      return <TeamSectionBlock record={record as TeamSectionBlockRecord} locale={locale} />;
    case "BlogPostsSectionRecord":
      return (
        <Suspense
          fallback={
            <LatestPostsSectionFallback locale={locale} record={record as BlogPostsSectionBlockRecord} />
          }
        >
          <LatestPostsSectionBlock
            record={record as BlogPostsSectionBlockRecord}
            locale={locale}
            catalog={latestPostsCatalog}
          />
        </Suspense>
      );
    default:
      return unknownBlockFallback(record);
  }
}
