import { Button } from "@/components/atoms/button";
import { DatoResponsivePicture } from "@/components/patterns/dato-responsive-picture";
import { SmartLink } from "@/components/patterns/smart-link";
import type { AppLocale } from "@/constants/i18n";
import type { CtaBannerBlockRecord, FileFieldLike } from "@/infra/datocms/types-page";
import { readCdaArray, readCdaBool, readCdaString } from "@/lib/datocms/cda-field";
import { resolveLinkBlock } from "@/lib/datocms/link-block";
import { resolveCtaBannerImage } from "@/lib/datocms/resolve-cta-banner-image";
import {
  resolveCtaBannerOptions,
  type CtaBannerBgTheme,
  type CtaBannerVariant,
} from "@/lib/datocms/resolve-cta-banner-options";
import { cmsBlockAttrs } from "@/lib/datocms/cms-block-attrs";
import { cn } from "@/lib/cn";

type CtaBannerBlockProps = {
  record: CtaBannerBlockRecord;
  locale: AppLocale;
};

type CtaLinkRecord = CtaBannerBlockRecord["buttons"][number];
type CtaImageBlock = CtaBannerBlockRecord["imageBanner"][number];

function readButtons(record: CtaBannerBlockRecord, locale: AppLocale): CtaLinkRecord[] {
  const raw = record.buttons ?? readCdaArray<CtaLinkRecord>(record as Record<string, unknown>, "buttons", "buttons");
  return raw
    .filter((link): link is CtaLinkRecord => link != null && link.__typename === "LinkRecord")
    .filter((link) => {
      const label = (link.ctaLabel ?? "").trim();
      return label.length > 0 && resolveLinkBlock(link, locale) != null;
    })
    .slice(0, 2);
}

function imageMobileAsset(block: CtaImageBlock | null): FileFieldLike | null {
  if (!block?.asset?.url) return null;
  return block.asset;
}

function bgThemeClasses(theme: CtaBannerBgTheme): string {
  switch (theme) {
    case "muted":
      return "bg-muted text-foreground";
    case "transparent":
      return "bg-transparent text-foreground";
    default:
      return "bg-primary text-primary-foreground";
  }
}

function buttonVariantForTheme(
  theme: CtaBannerBgTheme,
  isOverlay = false,
  isSecondary = false
): "primary" | "outline" {
  // Se for o 2º botão no overlay, podemos manter 'primary' sólido ou 'outline'
  if (isOverlay) {
    return isSecondary ? "primary" : "outline";
  }
  return theme === "primary" ? "outline" : "primary";
}

function buttonClassesForTheme(
  theme: CtaBannerBgTheme,
  isOverlay = false,
  isSecondary = false
): string | undefined {
  if (isOverlay) {
    if (isSecondary) {
      // Botão secundário no overlay (Sólido branco com texto escuro para destacar do 1º botão)
      return "bg-white text-slate-900 hover:bg-white/90 border-transparent shadow-md font-medium";
    }
    // 💡 Botão principal no overlay: Outline refinado com borda e texto em branco translúcido
    return "border border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 backdrop-blur-xs";
  }

  if (theme !== "primary") return undefined;
  return "border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10";
}

function contentAlignment(variant: CtaBannerVariant): string {
  if (variant === "split") return "text-left items-start";
  return "text-center items-center";
}

function CtaBannerButtons({
  items,
  locale,
  theme,
  centered,
  isOverlay = false,
}: {
  items: CtaLinkRecord[];
  locale: AppLocale;
  theme: CtaBannerBgTheme;
  centered: boolean;
  isOverlay?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div className={cn("mt-8 flex flex-wrap gap-3", centered && "justify-center")}>
      {items.map((link, index) => {
        const isSecondary = index > 0;
        const variant = buttonVariantForTheme(theme, isOverlay, isSecondary);
        const themeClass = buttonClassesForTheme(theme, isOverlay, isSecondary);

        return (
          <Button key={link.id} asChild variant={variant} className={themeClass}>
            <SmartLink record={link} locale={locale} tone="inherit" />
          </Button>
        );
      })}
    </div>
  );
}

function CtaBannerImage({ block, fallbackAlt }: { block: CtaImageBlock; fallbackAlt?: string }) {
  const mobile = imageMobileAsset(block);
  if (!mobile?.url) return null;

  return (
    <figure className="aspect-[4/3] overflow-hidden rounded-2xl border border-border/50 bg-background/50 shadow-sm [&>picture]:block [&>picture]:h-full [&>picture]:w-full">
      <DatoResponsivePicture
        mobile={mobile}
        desktop={block.assetDesktop}
        className="h-full w-full object-cover"
        sizes="(max-width: 1024px) 100vw, 496px"
        fallbackAlt={fallbackAlt || "Banner image"}
      />
    </figure>
  );
}

function CtaBannerContent({
  record,
  locale,
  options,
  isOverlay = false,
}: {
  record: CtaBannerBlockRecord;
  locale: AppLocale;
  options: ReturnType<typeof resolveCtaBannerOptions>;
  isOverlay?: boolean;
}) {
  const title = readCdaString(record, "title", "title");
  const showEyebrow = readCdaBool(record, "hasEyebrow", "has_eyebrow");
  const eyebrow = showEyebrow ? readCdaString(record, "eyebrow", "eyebrow") : "";
  const showDescription = readCdaBool(record, "hasDescription", "has_description");
  const description = showDescription ? readCdaString(record, "description", "description") : "";
  const buttons = readButtons(record, locale);
  const isPrimary = options.bgTheme === "primary";

  return (
    <div className={cn("flex min-w-0 flex-col", contentAlignment(options.variant))}>
      {eyebrow ? (
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.2em]",
            isOverlay
              ? "text-white/90 drop-shadow-sm"
              : isPrimary
                ? "text-primary-foreground/80"
                : "text-muted-foreground",
          )}
        >
          {eyebrow}
        </p>
      ) : null}

      {title ? (
        <h2
          className={cn(
            "text-balance text-3xl font-semibold tracking-tight md:text-4xl",
            isOverlay ? "text-white drop-shadow-sm" : undefined,
            eyebrow ? "mt-3" : undefined,
          )}
        >
          {title}
        </h2>
      ) : null}

      {description ? (
        <p
          className={cn(
            "mt-4 max-w-2xl text-pretty text-base leading-relaxed md:text-lg",
            isOverlay
              ? "text-white/90 drop-shadow-sm"
              : isPrimary
                ? "text-primary-foreground/90"
                : "text-muted-foreground",
            options.variant !== "split" && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}

      <CtaBannerButtons
        items={buttons}
        locale={locale}
        theme={options.bgTheme}
        centered={options.variant !== "split"}
        isOverlay={isOverlay}
      />
    </div>
  );
}

/** Bloco CTA Banner do Structured Text — variantes centered / split / card_inset. */
export function CtaBannerBlock({ record, locale }: CtaBannerBlockProps) {
  const options = resolveCtaBannerOptions(record as Record<string, unknown>);
  const title = readCdaString(record, "title", "title");
  if (!title) return null;

  const image = resolveCtaBannerImage(record as Record<string, unknown>, options.variant);
  const imageBlock = image.block as CtaImageBlock | null;
  const mobileAsset = imageMobileAsset(imageBlock);

  if (options.variant === "card_inset") {
    const hasOverlayImage = image.hasValidAsset;

    return (
      <section
        id={options.sectionId}
        {...cmsBlockAttrs(record)}
        data-datocms-content-link-boundary=""
        className={cn("not-prose my-12 w-full", bgThemeClasses(options.bgTheme))}
      >
        <div className="mx-auto max-w-6xl">
          <div
            className={cn(
              "relative overflow-hidden rounded-3xl border border-border p-8 shadow-xl lg:p-16",
              "flex flex-col items-center text-center",
              hasOverlayImage ? "dark text-white" : "bg-background text-foreground",
            )}
          >
            {hasOverlayImage && imageBlock && mobileAsset ? (
              <>
                <DatoResponsivePicture
                  mobile={mobileAsset}
                  desktop={imageBlock.assetDesktop}
                  className="absolute inset-0 h-full w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 992px"
                  fallbackAlt={title}
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
              </>
            ) : null}

            <div className="relative z-10 max-w-3xl">
              <CtaBannerContent
                record={record}
                locale={locale}
                options={options}
                isOverlay={hasOverlayImage}
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id={options.sectionId}
      {...cmsBlockAttrs(record)}
      data-datocms-content-link-boundary=""
      className={cn("not-prose my-12 w-full", bgThemeClasses(options.bgTheme))}
    >
      <div
        className={cn(
          "mx-auto max-w-6xl",
          options.variant === "split" &&
          image.hasValidAsset &&
          "grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12",
          options.variant === "centered" && "flex flex-col items-center text-center",
        )}
      >
        <div className={options.variant === "split" && image.hasValidAsset ? "min-w-0" : "w-full max-w-3xl"}>
          <CtaBannerContent record={record} locale={locale} options={options} />
        </div>

        {options.variant === "split" && image.hasValidAsset && imageBlock ? (
          <div className="min-w-0">
            <CtaBannerImage block={imageBlock} fallbackAlt={title} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
