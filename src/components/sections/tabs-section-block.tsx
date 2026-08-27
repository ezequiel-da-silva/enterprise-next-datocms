import { Container } from "@/components/atoms/container";
import type { SmartLinkBlockRecord } from "@/components/patterns/smart-link";
import {
  TabsSectionInteractive,
  type ParsedTab,
  type TabsSectionImage,
} from "@/components/sections/tabs-section-interactive";
import type { AppLocale } from "@/constants/i18n";
import type { FileFieldLike, TabItemBlockRecord, TabsSectionBlockRecord } from "@/infra/datocms/types-page";
import { readCdaArray, readCdaBlock, readCdaBool, readCdaString } from "@/lib/datocms/cda-field";
import { cmsBlockAttrs } from "@/lib/datocms/cms-block-attrs";
import { resolveLinkBlock } from "@/lib/datocms/link-block";
import { cn } from "@/lib/cn";

type TabsSectionBlockProps = {
  record: TabsSectionBlockRecord;
  locale: AppLocale;
};

/** Corte defensivo: o CMS não documenta um máximo. */
const MAX_TABS = 8;

type ImageBlockLike = {
  __typename?: string;
  asset?: FileFieldLike;
  assetDesktop?: FileFieldLike;
};

const FALLBACK_SECTION_LABEL: Record<AppLocale, string> = {
  en: "Tabs",
  pt: "Abas",
  es: "Pestañas",
};

function readTabImage(card: TabItemBlockRecord): TabsSectionImage | null {
  if (!readCdaBool(card as Record<string, unknown>, "hasImage", "has_image")) return null;
  const block = readCdaBlock<ImageBlockLike>(card as Record<string, unknown>, "mediaImage", "media_image");
  const asset = block?.asset;
  if (!asset?.url?.trim()) return null;
  return { asset, assetDesktop: block?.assetDesktop };
}

function readTabCta(card: TabItemBlockRecord, locale: AppLocale): SmartLinkBlockRecord | null {
  if (!readCdaBool(card as Record<string, unknown>, "hasLink", "has_link")) return null;
  const block = readCdaBlock<SmartLinkBlockRecord>(card as Record<string, unknown>, "ctaLink", "cta_link");
  if (!block || !resolveLinkBlock(block, locale)) return null;
  return block;
}

function readTabs(record: TabsSectionBlockRecord, locale: AppLocale): ParsedTab[] {
  const raw =
    record.tabs ?? readCdaArray<TabItemBlockRecord>(record as Record<string, unknown>, "tabs", "tabs");

  const parsed: ParsedTab[] = [];
  for (const item of raw) {
    if (!item?.id) continue;
    if (item.__typename && item.__typename !== "TabItemRecord") continue;
    const labelTab = readCdaString(item as Record<string, unknown>, "labelTab", "label_tab");
    const title = readCdaString(item as Record<string, unknown>, "title", "title");
    if (!labelTab || !title) continue;
    parsed.push({
      id: item.id,
      labelTab,
      title,
      description: readCdaString(item as Record<string, unknown>, "description", "description"),
      cta: readTabCta(item, locale),
      image: readTabImage(item),
    });
    if (parsed.length >= MAX_TABS) break;
  }
  return parsed;
}

export function TabsSectionBlock({ record, locale }: TabsSectionBlockProps) {
  const title = readCdaString(record as Record<string, unknown>, "title", "title");
  const subtitle = readCdaString(record as Record<string, unknown>, "subtitle", "subtitle");
  const tabs = readTabs(record, locale);
  if (tabs.length === 0) return null;

  const headingId = `tabs-section-${record.id}`;

  return (
    <section
      {...cmsBlockAttrs(record)}
      data-datocms-content-link-boundary=""
      className="not-prose my-12 w-full py-6"
      {...(title
        ? { "aria-labelledby": headingId }
        : { "aria-label": FALLBACK_SECTION_LABEL[locale] })}
    >
      <Container size="lg" name="TabsSection" className="flex flex-col gap-10">
        {title || subtitle ? (
          <header className="mx-auto max-w-3xl text-center">
            {title ? (
              <h2 id={headingId} className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className={cn("text-base text-muted-foreground", title && "mt-2")}>{subtitle}</p>
            ) : null}
          </header>
        ) : null}

        <TabsSectionInteractive
          sectionId={record.id}
          tabs={tabs}
          locale={locale}
          {...(title
            ? { tablistLabelledBy: headingId }
            : { tablistLabel: FALLBACK_SECTION_LABEL[locale] })}
        />
      </Container>
    </section>
  );
}
