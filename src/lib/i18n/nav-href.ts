import { type AppLocale, isAppLocale } from "@/constants/i18n";

const APP_ROOT_ROUTES = new Set(["contato", "busca"]);

/**
 * Ajusta hrefs internos ao locale: blog (`/blog/...` → `/[locale]/blog/...`) e páginas CMS
 * (`/page-slug` → `/[locale]/page-slug`). Rotas fixas à raiz (`/contato`, `/busca`) mantêm-se.
 */
export function localizeInternalHref(href: string, locale: AppLocale): string {
  const raw = href.trim();
  if (!raw) return "/";
  if (/^https?:\/\//i.test(raw) || raw.startsWith("//") || raw.startsWith("mailto:") || raw.startsWith("tel:") || raw.startsWith("#")) {
    return raw;
  }

  const path = raw.startsWith("/") ? raw : `/${raw}`;
  if (path === "/") return "/";

  const segments = path.split("/").filter(Boolean);
  const [first, ...rest] = segments;
  if (!first) return "/";

  if (first.startsWith("_")) {
    return path;
  }

  if (isAppLocale(first)) {
    return `/${locale}/${rest.join("/")}`.replace(/\/$/, "") || `/${locale}`;
  }

  if (first === "blog") {
    return `/${locale}/${segments.join("/")}`;
  }

  if (APP_ROOT_ROUTES.has(first)) {
    return path;
  }

  return `/${locale}/${segments.join("/")}`;
}

export function isExternalHref(href: string): boolean {
  const t = href.trim();
  return /^https?:\/\//i.test(t) || t.startsWith("//");
}
