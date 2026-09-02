import { stripStega } from "react-datocms/stega";
import { readCdaString } from "@/lib/datocms/cda-field";
import type { AppLocale } from "@/constants/i18n";

type RecordLike = Record<string, unknown>;

/** Copy visível do excerpt (preserva stega para Content Link). */
export function readPostExcerpt(record: RecordLike): string {
  return readCdaString(record, "excerpt", "excerpt");
}

/**
 * Excerpt para lógica (JSON-LD, comparações): sem stega, uma linha.
 * Quebras do textarea do CMS não devem ir para schema nem para o cartão.
 */
export function excerptPlainText(raw: string | null | undefined): string {
  if (typeof raw !== "string" || !raw.trim()) return "";
  return stripStega(raw).replace(/\s+/g, " ").trim();
}

export function postListingJsonLdItem(post: RecordLike, locale: AppLocale): {
  name: string;
  path: string;
  description?: string;
} {
  const name = readCdaString(post, "postTitle", "post_title");
  const slug = readCdaString(post, "postSlug", "post_slug");
  const description = excerptPlainText(readPostExcerpt(post));
  return {
    name,
    path: `/${locale}/blog/${slug}`,
    ...(description ? { description } : {}),
  };
}
