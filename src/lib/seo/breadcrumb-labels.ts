import type { AppLocale } from "@/constants/i18n";

/** Visible breadcrumb + JSON-LD label for locale home. */
export function homeBreadcrumbLabel(locale: AppLocale): string {
  if (locale === "pt") return "Início";
  if (locale === "es") return "Inicio";
  return "Home";
}

export function blogBreadcrumbLabel(): string {
  return "Blog";
}

export function homeBreadcrumbPath(locale: AppLocale): string {
  return `/${locale}`;
}

export type BreadcrumbCrumb = { name: string; path: string };

/** Standard trail: locale home → optional middle → current page. */
export function buildLocaleBreadcrumbTrail(
  locale: AppLocale,
  current: { name: string; path: string },
  middle?: BreadcrumbCrumb[],
): BreadcrumbCrumb[] {
  return [
    { name: homeBreadcrumbLabel(locale), path: homeBreadcrumbPath(locale) },
    ...(middle ?? []),
    current,
  ];
}

/** Maps schema crumbs to visible BreadcrumbNav items. */
export function crumbsToNavItems(crumbs: BreadcrumbCrumb[]): { label: string; href?: string }[] {
  return crumbs.map((c, i) => ({
    label: c.name,
    href: i < crumbs.length - 1 ? c.path : undefined,
  }));
}
