"use client";

import { APP_LOCALES, type AppLocale } from "@/constants/i18n";
import {
  LocaleSwitcherMenu,
  type LocaleOption,
} from "@/components/patterns/locale-switcher-menu";
import { cn } from "@/lib/cn";
import { isSafeLocalePath, normalizeSwitcherPathname } from "@/lib/i18n/locale-switch-href";
import { homeBreadcrumbPath } from "@/lib/seo/breadcrumb-labels";
import {
  LOCALE_NATIVE_NAME,
  LOCALE_SHORT_CODE,
  languageNavLabel,
  localeSwitcherTriggerLabel,
  schemaLanguage,
} from "@/lib/seo/locale-tags";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type LocaleSwitcherProps = {
  locale: AppLocale;
  hrefs: Record<AppLocale, string>;
  /** `block`: largura total no painel móvel. */
  variant?: "compact" | "block";
  className?: string;
};

function describeLocale(code: AppLocale, hrefs: Record<AppLocale, string>): LocaleOption {
  const href = hrefs[code];
  return {
    code,
    href: isSafeLocalePath(href, code) ? href : homeBreadcrumbPath(code),
    nativeName: LOCALE_NATIVE_NAME[code],
    bcp47: schemaLanguage(code),
    shortCode: LOCALE_SHORT_CODE[code],
  };
}

function isHrefMap(value: unknown): value is Record<AppLocale, string> {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return APP_LOCALES.every(
    (locale) => typeof record[locale] === "string" && isSafeLocalePath(record[locale] as string, locale),
  );
}

function hrefQueryValue(href: string): string | null {
  const i = href.indexOf("?");
  if (i < 0) return null;
  return new URLSearchParams(href.slice(i + 1)).get("q");
}

/** True when o mapa SSR (ou anterior) já cobre o pathname/`q` actuais — evita fetch no hard load. */
function hrefsMatchLocation(
  hrefs: Record<AppLocale, string>,
  locale: AppLocale,
  pathname: string,
  q: string | null,
): boolean {
  const href = hrefs[locale] ?? "";
  const hrefPath = normalizeSwitcherPathname(href.split("?")[0] ?? "");
  if (hrefPath !== normalizeSwitcherPathname(pathname)) return false;
  const hrefQ = hrefQueryValue(href);
  if (!q) return !hrefQ;
  return hrefQ === q;
}

type LocaleSwitcherViewProps = LocaleSwitcherProps;

function LocaleSwitcherView({ locale, hrefs, variant = "compact", className }: LocaleSwitcherViewProps) {
  const current = describeLocale(locale, hrefs);
  /* Só alternativas: o idioma ativo já está no botão, repeti-lo na lista era uma opção morta. */
  const options: LocaleOption[] = APP_LOCALES.filter((code) => code !== locale).map((code) =>
    describeLocale(code, hrefs),
  );

  if (options.length === 0) return null;

  return (
    <nav
      aria-label={languageNavLabel(locale)}
      className={cn(variant === "block" ? "w-full" : "shrink-0", className)}
    >
      <LocaleSwitcherMenu
        current={current}
        options={options}
        variant={variant}
        triggerAriaLabel={localeSwitcherTriggerLabel(locale, current.shortCode)}
      />
    </nav>
  );
}

function LiveLocaleSwitcher({ locale, hrefs: initialHrefs, variant = "compact", className }: LocaleSwitcherProps) {
  const pathname = usePathname() ?? `/${locale}`;
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  const locationKey = `${normalizeSwitcherPathname(pathname)}|${q ?? ""}`;
  const initialMatches = hrefsMatchLocation(initialHrefs, locale, pathname, q);
  const [override, setOverride] = useState<{ key: string; hrefs: Record<AppLocale, string> } | null>(null);

  useEffect(() => {
    if (initialMatches) return;

    const controller = new AbortController();
    const params = new URLSearchParams();
    params.set("pathname", normalizeSwitcherPathname(pathname));
    if (q) params.set("q", q);

    void fetch(`/api/locale-switcher-hrefs?${params.toString()}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json() as Promise<unknown>;
      })
      .then((data) => {
        if (controller.signal.aborted || !isHrefMap(data)) return;
        setOverride({ key: locationKey, hrefs: data });
      })
      .catch(() => {
        /* Abort ou rede: manter hrefs actuais. */
      });

    return () => controller.abort();
  }, [pathname, q, locale, initialHrefs, initialMatches, locationKey]);

  const hrefs =
    initialMatches ? initialHrefs : override?.key === locationKey ? override.hrefs : initialHrefs;

  return <LocaleSwitcherView locale={locale} hrefs={hrefs} variant={variant} className={className} />;
}

/** SSR com hrefs do layout; após soft nav o cliente re-resolve via `/api/locale-switcher-hrefs`. */
export function LocaleSwitcher(props: LocaleSwitcherProps) {
  return (
    <Suspense fallback={<LocaleSwitcherView {...props} />}>
      <LiveLocaleSwitcher {...props} />
    </Suspense>
  );
}
