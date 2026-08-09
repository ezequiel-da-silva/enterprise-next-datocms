import type { AppLocale } from "@/constants/i18n";
import { CtaBannerBlock } from "@/components/sections/cta-banner-block";
import { FaqGroupBlock } from "@/components/patterns/faq-group-block";
import { DatoResponsivePicture } from "@/components/patterns/dato-responsive-picture";
import type {
  CtaBannerBlockRecord,
  FeatureGridRecord,
  PageStructuredTextBlock,
  VideoBlockWithCaptions,
} from "@/infra/datocms/types-page";
import { FeatureGridBlock } from "@/components/patterns/feature-grid-block";
import { readCdaObject } from "@/lib/datocms/cda-field";
import { resolveVideoSources } from "@/lib/datocms/resolve-video-sources";
import Image from "next/image";

type StructuredTextBlockViewProps = {
  record: PageStructuredTextBlock;
  locale: AppLocale;
  contentLinkGroup?: boolean;
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

/**
 * Blocos modulares partilhados entre `PageStructuredText` e `StructuredTextRenderer`.
 */
export function StructuredTextBlockView({ record, locale, contentLinkGroup = false }: StructuredTextBlockViewProps) {
  switch (record.__typename) {
    case "ImageBlockRecord": {
      const mobile = record.asset;
      if (!mobile?.url) return null;
      return (
        <figure data-datocms-content-link-boundary="" className="my-6">
          <DatoResponsivePicture
            mobile={mobile}
            desktop={record.assetDesktop}
            className="h-auto max-w-full rounded-md"
            sizes="(max-width: 768px) 100vw, 720px"
            fallbackAlt="Embedded image"
          />
        </figure>
      );
    }
    case "ImageGalleryBlockRecord": {
      const items = record.assets?.filter((a) => a?.url) ?? [];
      if (items.length === 0) return null;
      return (
        <div data-datocms-content-link-boundary="" className="my-6 grid gap-3 sm:grid-cols-2">
          {items.map((img, i) => (
            <figure key={`${record.id}-${i}`} className="overflow-hidden rounded-md border border-border">
              <Image
                src={img.url}
                alt={img.alt ?? ""}
                width={img.width ?? 800}
                height={img.height ?? 600}
                quality={75}
                loading="lazy"
                className="h-auto w-full object-cover"
                sizes="(max-width: 768px) 100vw, 360px"
              />
            </figure>
          ))}
        </div>
      );
    }
    case "VideoBlockRecord": {
      const v = record.asset;
      const resolved = resolveVideoSources(v);
      if (!resolved) return null;
      const label = v?.title?.trim() || "Vídeo";
      const captions = readVideoCaptions(record);
      return (
        <figure data-datocms-content-link-boundary="" className="my-6">
          <video
            controls
            className="h-auto max-w-full rounded-md"
            width={resolved.width}
            height={resolved.height}
            poster={resolved.poster}
            preload="metadata"
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
    case "FeatureGridRecord":
      return (
        <FeatureGridBlock
          record={record as FeatureGridRecord}
          locale={locale}
          contentLinkGroup={contentLinkGroup}
        />
      );
    case "FaqGroupRecord":
      return <FaqGroupBlock record={record} />;
    case "CtaBannerRecord":
      return <CtaBannerBlock record={record as CtaBannerBlockRecord} locale={locale} />;
    default:
      return unknownBlockFallback(record);
  }
}
