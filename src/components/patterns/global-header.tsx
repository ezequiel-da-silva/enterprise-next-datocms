import { HeaderNav } from "@/components/patterns/header-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import type { NavigationData } from "@/infra/datocms/types-navigation";
import type { AppLocale } from "@/constants/i18n";
import type { ThemeMode } from "@/constants/theme";
import { homeBreadcrumbPath } from "@/lib/seo/breadcrumb-labels";
import Image from "next/image";
import Link from "next/link";

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
  /** Cookie `nd-theme` no SSR — evita skeleton no ThemeToggle. */
  initialThemeMode?: ThemeMode;
};

export function GlobalHeader({ data, locale, initialThemeMode }: GlobalHeaderProps) {
  const logo = data?.logo;
  const menuLinks = data?.menuLinks?.filter(Boolean) ?? [];
  const showTheme = data?.showThemeToggle === true;
  const themeToggle = showTheme ? <ThemeToggle initialMode={initialThemeMode} /> : null;
  const homeHref = homeBreadcrumbPath(locale);
  const homeLabel = homeAriaLabel(locale);

  return (
    <header className="overflow-visible border-b border-border bg-background shadow-sm supports-[backdrop-filter]:bg-background/95 supports-[backdrop-filter]:backdrop-blur">
      <div className="mx-auto flex min-h-14 max-w-6xl items-center gap-x-4 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
        <Link
          href={homeHref}
          className="relative z-10 shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span className="sr-only">{homeLabel}</span>
          {logo?.url ? (
            <Image
              src={logo.url}
              alt=""
              width={logo.width ?? 160}
              height={logo.height ?? 40}
              sizes="160px"
              className="h-9 w-auto max-w-[10rem] object-contain object-left"
            />
          ) : (
            <span aria-hidden className="text-sm font-semibold tracking-tight text-foreground">
              {SITE_WORDMARK}
            </span>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          {menuLinks.length > 0 ? (
            <HeaderNav menuLinks={menuLinks} locale={locale} themeToggle={themeToggle} />
          ) : (
            <div className="flex shrink-0 items-center gap-2">{themeToggle}</div>
          )}
        </div>
      </div>
    </header>
  );
}
