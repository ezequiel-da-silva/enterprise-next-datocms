import { Container } from "@/components/atoms/container";
import { HeaderNav } from "@/components/patterns/header-nav";
import { LocaleSwitcher } from "@/components/patterns/locale-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import type { NavigationData } from "@/infra/datocms/types-navigation";
import type { AppLocale } from "@/constants/i18n";
import type { ThemeMode } from "@/constants/theme";
import { homeBreadcrumbPath } from "@/lib/seo/breadcrumb-labels";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { getSiteName } from "@/lib/seo/site-config";

const SITE_WORDMARK = process.env.NEXT_PUBLIC_SITE_WORDMARK ?? getSiteName();

function homeAriaLabel(locale: AppLocale): string {
  if (locale === "pt") return "Início";
  if (locale === "es") return "Inicio";
  return "Home";
}

type GlobalHeaderProps = {
  data: NavigationData | null;
  locale: AppLocale;
  localeHrefs: Record<AppLocale, string>;
  /** Cookie `nd-theme` no SSR — evita skeleton no ThemeToggle. */
  initialThemeMode?: ThemeMode;
};

export function GlobalHeader({ data, locale, localeHrefs, initialThemeMode }: GlobalHeaderProps) {
  const logo = data?.logo;
  const menuLinks = data?.menuLinks?.filter(Boolean) ?? [];
  const showTheme = data?.showThemeToggle === true;
  const themeToggle = showTheme ? (
    <ThemeToggle key="header-theme-toggle" initialMode={initialThemeMode} />
  ) : null;
  const localeSwitcher: ReactNode = (
    <LocaleSwitcher key="header-locale-switcher" locale={locale} hrefs={localeHrefs} />
  );
  const localeSwitcherBlock: ReactNode = (
    <LocaleSwitcher key="header-locale-switcher-block" locale={locale} hrefs={localeHrefs} variant="block" />
  );
  const homeHref = homeBreadcrumbPath(locale);
  const homeLabel = homeAriaLabel(locale);

  return (
    <header className="overflow-visible border-b border-border bg-background shadow-sm supports-[backdrop-filter]:bg-background/95 supports-[backdrop-filter]:backdrop-blur">
      <Container
        size="lg"
        name="GlobalHeader"
        className="flex min-h-14 items-center gap-x-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]"
      >
        <Link
          href={homeHref}
          className="relative z-10 shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span className="sr-only">{homeLabel}</span>
          {logo?.url ? (
            <span
              className="relative block h-9 max-w-[10rem] shrink-0 overflow-hidden"
              style={{
                aspectRatio: `${logo.width ?? 160} / ${logo.height ?? 40}`,
              }}
            >
              <Image
                src={logo.url}
                alt=""
                width={logo.width ?? 160}
                height={logo.height ?? 40}
                sizes="160px"
                loading="eager"
                className="h-full w-full object-contain object-left"
              />
            </span>
          ) : (
            <span aria-hidden className="text-sm font-semibold tracking-tight text-foreground">
              {SITE_WORDMARK}
            </span>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          {menuLinks.length > 0 ? (
            <HeaderNav
              menuLinks={menuLinks}
              locale={locale}
              themeToggle={themeToggle}
              localeSwitcher={localeSwitcher}
              localeSwitcherBlock={localeSwitcherBlock}
            />
          ) : (
            <div className="flex shrink-0 items-center gap-2">
              {localeSwitcher}
              {themeToggle}
            </div>
          )}
        </div>
      </Container>
    </header>
  );
}
