import { APP_LOCALES, appLocaleFromDato, isAppLocale, type AppLocale, type DatoSiteLocale } from "@/constants/i18n";

/**
 * Tags passadas a `datocmsFetch` / `next.tags`.
 * Qualquer string aqui tem de existir num fetch — não inventar tags no webhook.
 */
export const DATOCMS_CACHE_TAGS = {
  page: "datocms:page",
  blog: "datocms:blog",
  posts: "datocms:posts",
  authors: "datocms:authors",
  categories: "datocms:categories",
  site: "datocms:site",
  siteSeo: "datocms:site-seo",
  navigation: "datocms:navigation",
  globalSettings: "datocms:global-settings",
  sitemap: "datocms:sitemap",
  search: "datocms:search",
  redirects: "datocms:redirects",
} as const;

/** Famílias usadas em todos os fetches publicados (webhook CDA / payload desconhecido). */
export function coarseDatocmsCacheTags(): string[] {
  const localePairs = APP_LOCALES.flatMap((locale) => [
    `navigation:${locale}`,
    `site-seo:${locale}`,
    `global-settings:${locale}`,
  ]);
  return uniqueTags([
    DATOCMS_CACHE_TAGS.page,
    DATOCMS_CACHE_TAGS.blog,
    DATOCMS_CACHE_TAGS.posts,
    DATOCMS_CACHE_TAGS.authors,
    DATOCMS_CACHE_TAGS.categories,
    DATOCMS_CACHE_TAGS.site,
    DATOCMS_CACHE_TAGS.siteSeo,
    DATOCMS_CACHE_TAGS.navigation,
    DATOCMS_CACHE_TAGS.globalSettings,
    DATOCMS_CACHE_TAGS.sitemap,
    DATOCMS_CACHE_TAGS.search,
    DATOCMS_CACHE_TAGS.redirects,
    ...localePairs,
  ]);
}

type JsonRecord = Record<string, unknown>;

export type DatoWebhookBody = {
  entity?: {
    id?: string;
    type?: string;
    attributes?: JsonRecord;
    relationships?: {
      item_type?: { data?: { id?: string | null } | null };
    };
  };
  related_entities?: Array<{
    id?: string;
    type?: string;
    attributes?: { api_key?: string | null };
  }>;
};

function uniqueTags(tags: string[]): string[] {
  return [...new Set(tags.filter(Boolean))].sort();
}

function asRecord(value: unknown): JsonRecord | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonRecord;
  }
  return null;
}

export function isCdaCacheTagsPayload(body: DatoWebhookBody): boolean {
  const tags = body.entity?.attributes?.tags;
  return Array.isArray(tags) && tags.every((t) => typeof t === "string");
}

export function resolveWebhookItemTypeApiKey(body: DatoWebhookBody): string | null {
  const typeId = body.entity?.relationships?.item_type?.data?.id;
  const related = body.related_entities?.find(
    (entry) => entry.type === "item_type" && (!typeId || entry.id === typeId),
  );
  const key = related?.attributes?.api_key?.trim();
  return key || null;
}

function localeFromKey(key: string): AppLocale | null {
  if (isAppLocale(key)) return key;
  if (key === "en" || key === "pt_BR" || key === "es") {
    return appLocaleFromDato(key as DatoSiteLocale);
  }
  return null;
}

function localesFromPayload(attrs: JsonRecord | undefined): AppLocale[] {
  const locale = typeof attrs?.locale === "string" ? localeFromKey(attrs.locale) : null;
  return locale ? [locale] : [...APP_LOCALES];
}

/** Slug simples → todos os locales do payload; hash localizado → um par por chave. */
function readLocalizedSlugs(attrs: JsonRecord | undefined, keys: string[]): Array<{ locale: AppLocale; slug: string }> {
  if (!attrs) return [];
  const fallbackLocales = localesFromPayload(attrs);
  const out: Array<{ locale: AppLocale; slug: string }> = [];
  for (const key of keys) {
    const raw = attrs[key];
    if (typeof raw === "string" && raw.trim()) {
      const slug = raw.trim();
      for (const locale of fallbackLocales) out.push({ locale, slug });
      return out;
    }
    const nested = asRecord(raw);
    if (!nested) continue;
    for (const [localeKey, value] of Object.entries(nested)) {
      if (typeof value !== "string" || !value.trim()) continue;
      const locale = localeFromKey(localeKey);
      if (locale) out.push({ locale, slug: value.trim() });
    }
    if (out.length > 0) return out;
  }
  return out;
}

function tagsForApiKey(
  apiKey: string,
  attrs: JsonRecord | undefined,
  entityId: string | undefined,
): string[] {
  switch (apiKey) {
    case "page": {
      const pageTags = readLocalizedSlugs(attrs, ["slug"]).map(({ locale, slug }) => `page:${locale}:${slug}`);
      return [
        DATOCMS_CACHE_TAGS.page,
        DATOCMS_CACHE_TAGS.site,
        DATOCMS_CACHE_TAGS.sitemap,
        DATOCMS_CACHE_TAGS.search,
        ...pageTags,
      ];
    }
    case "post": {
      const postTags = readLocalizedSlugs(attrs, ["post_slug", "postSlug"]).map(
        ({ locale, slug }) => `post:${locale}:${slug}`,
      );
      return [DATOCMS_CACHE_TAGS.blog, DATOCMS_CACHE_TAGS.posts, DATOCMS_CACHE_TAGS.sitemap, DATOCMS_CACHE_TAGS.search, ...postTags];
    }
    case "author": {
      const authorTags = readLocalizedSlugs(attrs, ["author_slug", "authorSlug"]).map(
        ({ locale, slug }) => `author:${locale}:${slug}`,
      );
      const byId = entityId ? [`author-posts:${entityId}`] : [];
      return [
        DATOCMS_CACHE_TAGS.blog,
        DATOCMS_CACHE_TAGS.authors,
        DATOCMS_CACHE_TAGS.posts,
        DATOCMS_CACHE_TAGS.sitemap,
        DATOCMS_CACHE_TAGS.search,
        ...authorTags,
        ...byId,
      ];
    }
    case "category": {
      const categoryTags = readLocalizedSlugs(attrs, ["category_slug", "categorySlug"]).map(
        ({ locale, slug }) => `category:${locale}:${slug}`,
      );
      const byId = entityId ? [`category-posts:${entityId}`] : [];
      return [
        DATOCMS_CACHE_TAGS.blog,
        DATOCMS_CACHE_TAGS.categories,
        DATOCMS_CACHE_TAGS.posts,
        DATOCMS_CACHE_TAGS.sitemap,
        DATOCMS_CACHE_TAGS.search,
        ...categoryTags,
        ...byId,
      ];
    }
    case "navigation":
      return [DATOCMS_CACHE_TAGS.navigation, ...APP_LOCALES.map((locale) => `navigation:${locale}`)];
    case "global_setting":
      return [DATOCMS_CACHE_TAGS.globalSettings, ...APP_LOCALES.map((locale) => `global-settings:${locale}`)];
    case "redirect":
      return [DATOCMS_CACHE_TAGS.redirects];
    default:
      return [];
  }
}

/**
 * Converte o JSON do webhook Dato nas strings de `next.tags` deste repo.
 * Evento CDA (`entity.attributes.tags`) → famílias completas (não mapeamos tags opacas do Dato).
 * Evento `item.*` → famílias do modelo + slugs quando o payload as traz.
 */
export function tagsToRevalidateFromWebhook(body: DatoWebhookBody): string[] {
  if (isCdaCacheTagsPayload(body)) {
    return coarseDatocmsCacheTags();
  }

  const apiKey = resolveWebhookItemTypeApiKey(body);
  const extra = apiKey ? tagsForApiKey(apiKey, body.entity?.attributes, body.entity?.id) : [];
  if (extra.length > 0) {
    return uniqueTags(extra);
  }

  return coarseDatocmsCacheTags();
}
