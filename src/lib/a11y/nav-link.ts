import type { AppLocale } from "@/constants/i18n";
import { accessibleNameIncludesVisible } from "@/lib/a11y/label-in-name";

type NavLinkAriaOptions = {
  customAria?: string | null;
  external?: boolean;
  newTab?: boolean;
};

/** `aria-label` só quando necessário (evita redundância com texto visível). */
export function navLinkAriaLabel(
  locale: AppLocale,
  label: string,
  { customAria, external, newTab }: NavLinkAriaOptions,
): string | undefined {
  const custom = customAria?.trim();
  // WCAG 2.5.3: custom aria must include the visible label (skip CMS placeholders).
  if (custom && custom !== label && accessibleNameIncludesVisible(custom, label)) {
    return custom;
  }
  if (external && newTab) {
    if (locale === "pt") return `${label} (abre em nova janela)`;
    if (locale === "es") return `${label} (abre en nueva ventana)`;
    return `${label} (opens in new window)`;
  }
  return undefined;
}

export function navLinkAriaProps(
  locale: AppLocale,
  label: string,
  options: NavLinkAriaOptions,
): { "aria-label"?: string } {
  const ariaLabel = navLinkAriaLabel(locale, label, options);
  return ariaLabel ? { "aria-label": ariaLabel } : {};
}
