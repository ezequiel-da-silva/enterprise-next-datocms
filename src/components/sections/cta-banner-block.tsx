import { Button } from "@/components/atoms/button";
import { Container } from "@/components/atoms/container";
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

/**
 * Em `card_inset` o tema pinta o próprio cartão: pintar também a secção deixava um
 * retângulo de cor por trás do cartão arredondado (visível sobretudo com foto de fundo).
 */
function cardSurfaceClasses(theme: CtaBannerBgTheme): string {
  switch (theme) {
    case "muted":
      return "bg-muted text-foreground";
    case "transparent":
      return "border border-border bg-background text-foreground";
    default:
      return "bg-primary text-primary-foreground";
  }
}

/**
 * Superfície escura (`bg-primary` ou foto + scrim): texto e bordas a 100%.
 * `color-mix` (`/80`) falhava WCAG AA; a classe `dark` no overlay invertia
 * `primary-foreground` para navy e deixava o botão ilegível.
 */
const OVERLAY_OUTLINE_BUTTON =
  "border-white bg-transparent text-white hover:bg-white/15 hover:text-white";
const OVERLAY_SOLID_BUTTON = "border-transparent bg-white text-slate-900 shadow-md hover:bg-white/90";
const ON_PRIMARY_OUTLINE_BUTTON =
  "border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground";

function buttonVariantForTheme(
  theme: CtaBannerBgTheme,
  isOverlay = false,
  isSecondary = false,
): "primary" | "outline" {
  if (isOverlay) {
    return isSecondary ? "primary" : "outline";
  }
  return theme === "primary" ? "outline" : "primary";
}

function buttonClassesForTheme(
  theme: CtaBannerBgTheme,
  isOverlay = false,
  isSecondary = false,
): string | undefined {
  if (isOverlay) {
    return isSecondary ? OVERLAY_SOLID_BUTTON : OVERLAY_OUTLINE_BUTTON;
  }
  if (theme !== "primary") return undefined;
  return ON_PRIMARY_OUTLINE_BUTTON;
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
            isOverlay ? "text-white drop-shadow-sm" : isPrimary ? "text-primary-foreground" : "text-muted-foreground",
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
            isOverlay ? "text-white drop-shadow-sm" : isPrimary ? "text-primary-foreground" : "text-muted-foreground",
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
        className="not-prose my-12 w-full"
      >
        <Container size="lg" padded={false} name="CtaBanner">
          <div
            className={cn(
              "relative overflow-hidden rounded-3xl p-8 shadow-xl lg:p-16",
              "flex flex-col items-center text-center",
              hasOverlayImage ? "text-white ring-1 ring-black/10" : cardSurfaceClasses(options.bgTheme),
            )}
          >
            {hasOverlayImage && imageBlock && mobileAsset ? (
              <>
                <DatoResponsivePicture
                  mobile={mobileAsset}
                  desktop={imageBlock.assetDesktop}
                  className="absolute inset-0 h-full w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 992px"
                  decorative
                />
                {/* Nunca abaixo de 60%: texto branco mantém AA mesmo sobre a zona mais clara da foto. */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/65 to-black/60" aria-hidden />
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
        </Container>
      </section>
    );
  }

  return (
    <section
      id={options.sectionId}
      {...cmsBlockAttrs(record)}
      data-datocms-content-link-boundary=""
      className={cn(
        "not-prose my-12 w-full",
        /* A faixa já está dentro da largura do artigo: arredondar evita o bloco retangular duro. */
        options.bgTheme !== "transparent" && "rounded-2xl",
        bgThemeClasses(options.bgTheme),
      )}
    >
      <Container
        size="lg"
        padded={false}
        name="CtaBanner"
        className={cn(
          /* Sem cor de fundo o bloco alinha com o texto à volta; com cor precisa de respirar da margem. */
          options.bgTheme !== "transparent" && "px-6 py-10 md:px-10 md:py-14",
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
      </Container>
    </section>
  );
}
