import { Container } from "@/components/atoms/container";
import { SearchForm } from "@/components/patterns/search-form";
import { SearchResults } from "@/components/patterns/search-results";
import { SearchSkeleton } from "@/components/patterns/search-skeleton";
import { SectionTextHeader } from "@/components/patterns/section-text-header";
import { StructuredTextRenderer } from "@/components/patterns/structured-text-renderer";
import type { AppLocale } from "@/constants/i18n";
import type { SearchResultsPayload } from "@/lib/datocms/search-hit";
import type { SearchSectionBlockRecord } from "@/infra/datocms/types-page";
import { readCdaBool, readCdaString } from "@/lib/datocms/cda-field";
import { cmsBlockAttrs } from "@/lib/datocms/cms-block-attrs";
import { sectionLandmarkProps, textHeaderFromRecord } from "@/lib/datocms/resolve-text-header";
import type { CdaStructuredTextValue } from "datocms-structured-text-utils";
import { Suspense } from "react";

type SearchSectionBlockProps = {
  record: SearchSectionBlockRecord;
  locale: AppLocale;
  contentLinkGroup?: boolean;
  formAction: string;
  query: string;
  results?: SearchResultsPayload | Promise<SearchResultsPayload>;
};

const FALLBACK_SECTION_LABEL: Record<AppLocale, string> = {
  en: "Search",
  pt: "Busca",
  es: "Búsqueda",
};

function introHasContent(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value !== "object") return false;
  const doc = (value as { document?: { children?: unknown[] } }).document;
  return Array.isArray(doc?.children) && doc.children.length > 0;
}

async function SearchResultsSlot({
  results,
  query,
  locale,
  emptyHint,
  noResults,
}: {
  results?: SearchResultsPayload | Promise<SearchResultsPayload>;
  query: string;
  locale: AppLocale;
  emptyHint?: string;
  noResults?: string;
}) {
  const payload = results ? await results : { hits: [] };
  return (
    <SearchResults
      query={query}
      hits={payload.hits}
      error={payload.error}
      locale={locale}
      emptyHint={emptyHint}
      noResults={noResults}
    />
  );
}

export function SearchSectionBlock({
  record,
  locale,
  contentLinkGroup = false,
  formAction,
  query,
  results,
}: SearchSectionBlockProps) {
  const fields = record as Record<string, unknown>;
  const hasTextHeader = readCdaBool(fields, "hasTextHeader", "has_text_header");
  const header = hasTextHeader ? textHeaderFromRecord(fields) : { title: "", description: "" };
  const intro = record.intro as CdaStructuredTextValue | null | undefined;
  const hasIntro = introHasContent(intro?.value);
  const placeholder = readCdaString(fields, "placeholder", "placeholder");
  const submitLabel = readCdaString(fields, "submitLabel", "submit_label");
  const emptyHint = readCdaString(fields, "emptyHint", "empty_hint");
  const noResults = readCdaString(fields, "noResults", "no_results");
  const headingId = `search-${record.id}`;

  return (
    <section
      {...cmsBlockAttrs(record)}
      data-datocms-content-link-boundary=""
      className="not-prose my-12 w-full"
      id={header.sectionId}
      {...sectionLandmarkProps(header, headingId, FALLBACK_SECTION_LABEL[locale])}
    >
      <Container size="lg" name="SearchSection" className="flex flex-col gap-8">
        {hasTextHeader ? (
          <SectionTextHeader header={header} headingId={headingId} align="left" />
        ) : null}
        {hasIntro ? (
          <div className="max-w-xl">
            <StructuredTextRenderer data={intro} contentLinkGroup={contentLinkGroup} locale={locale} />
          </div>
        ) : null}
        <SearchForm
          action={formAction}
          query={query}
          locale={locale}
          placeholder={placeholder || undefined}
          submitLabel={submitLabel || undefined}
        />
        <Suspense fallback={<SearchSkeleton />}>
          <SearchResultsSlot
            results={results}
            query={query}
            locale={locale}
            emptyHint={emptyHint || undefined}
            noResults={noResults || undefined}
          />
        </Suspense>
      </Container>
    </section>
  );
}
