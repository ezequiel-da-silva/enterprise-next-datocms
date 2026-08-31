import {
  DEFAULT_APP_LOCALE,
  appLocaleFromDato,
  isAppLocale,
  type AppLocale,
  type DatoSiteLocale,
} from "@/constants/i18n";

type JsonRecord = {
  attributes?: Record<string, unknown>;
  meta?: { status?: string };
};

type JsonItemType = {
  attributes?: { api_key?: string };
};

function readStringAttr(item: JsonRecord, keys: string[]): string | null {
  const attrs = item.attributes;
  if (!attrs) return null;
  for (const key of keys) {
    const raw = attrs[key];
    if (typeof raw === "string" && raw.trim() !== "") {
      return raw.trim();
    }
  }
  return null;
}

/** Locale do payload Web Previews (enum SiteLocale ou segmento da app). */
function resolveAppLocale(locale: string | undefined): AppLocale {
  if (!locale) {
    return DEFAULT_APP_LOCALE;
  }
  if (isAppLocale(locale)) {
    return locale;
  }
  if (locale === "en" || locale === "pt_BR" || locale === "es") {
    return appLocaleFromDato(locale as DatoSiteLocale);
  }
  return DEFAULT_APP_LOCALE;
}

export type RecordToWebsitePathOptions = {
  /** `locale` no corpo POST do plugin Web Previews (ex.: `en`, `pt_BR`, `es`). */
  locale?: string;
};

/**
 * Mapeia um registo Dato (payload do Web Previews) para um path do site.
 * `api_key` corresponde ao identificador do modelo no schema (page, post, …).
 */
export function recordToWebsitePath(
  item: JsonRecord,
  itemType: JsonItemType,
  options?: RecordToWebsitePathOptions,
): string | null {
  const apiKey = itemType.attributes?.api_key;
  const appLocale = resolveAppLocale(options?.locale);

  switch (apiKey) {
    case "page": {
      const slug = readStringAttr(item, ["slug"]);
      if (!slug) return null;
      if (slug.toLowerCase() === "home") {
        return `/${appLocale}`;
      }
      return `/${appLocale}/${slug}`;
    }
    case "post": {
      const slug = readStringAttr(item, ["post_slug", "postSlug"]);
      if (!slug) return null;
      return `/${appLocale}/blog/${slug}`;
    }
    case "category": {
      const slug = readStringAttr(item, ["category_slug", "categorySlug"]);
      if (!slug) return null;
      return `/${appLocale}/blog/category/${slug}`;
    }
    case "author": {
      const slug = readStringAttr(item, ["author_slug", "authorSlug"]);
      if (!slug) return null;
      return `/${appLocale}/blog/author/${slug}`;
    }
    case "redirect": {
      const fromPath = readStringAttr(item, ["from_path_redirect", "fromPathRedirect"]);
      return fromPath ? fromPath : null;
    }
    case "navigation":
    case "global_setting":
      return "/";
    default:
      return null;
  }
}

/**
 * Resolve path a partir do `__typename` do registo ligado (CDA) e do slug de URL já normalizado
 * (`slug`, `postSlug`, `categorySlug` ou `authorSlug` consoante o modelo).
 */
export function recordToWebsiteRoute(
  typename: string | null | undefined,
  slug: string | null | undefined,
  locale: AppLocale,
): string | null {
  if (!typename || !slug?.trim()) {
    return null;
  }
  const s = slug.trim();

  switch (typename) {
    case "PageRecord":
      return s.toLowerCase() === "home" ? `/${locale}` : `/${locale}/${s}`;
    case "PostRecord":
      return `/${locale}/blog/${s}`;
    case "CategoryRecord":
      return `/${locale}/blog/category/${s}`;
    case "AuthorRecord":
      return `/${locale}/blog/author/${s}`;
    default:
      return null;
  }
}
