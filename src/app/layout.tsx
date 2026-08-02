import { buildThemeCssVariables } from "@/config/theme.config";
import { DraftChrome } from "@/components/patterns/draft-chrome";
import { SkipLink } from "@/components/patterns/skip-link";
import { GlobalHeader } from "@/components/patterns/global-header";
import { SiteFooter } from "@/components/patterns/site-footer";
import { JsonLdScript } from "@/components/patterns/seo-manager";
import { buildThemeBootScript } from "@/lib/theme-boot-script";
import { DEFAULT_APP_LOCALE, REQUEST_LOCALE_HEADER, appLocaleFromParam, type AppLocale } from "@/constants/i18n";
import { THEME_COOKIE_NAME, isThemeMode } from "@/constants/theme";
import { pickNavigationData, getNavigation } from "@/infra/datocms/get-navigation";
import { cn } from "@/lib/cn";
import { getNonce } from "@/lib/nonce";
import { buildMetadata } from "@/lib/seo";
import { getSiteName } from "@/lib/seo/site-config";
import { buildSiteJsonLdGraph } from "@/lib/seo/json-ld-site";
import type { Metadata, Viewport } from "next";
import { cookies, draftMode, headers } from "next/headers";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  adjustFontFallback: true,
  preload: true,
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
  adjustFontFallback: true,
  preload: false,
});

const fontVariables = `${inter.variable} ${robotoMono.variable}`;

const siteDescription =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION?.trim() ||
  "Next.js 16, Clean Architecture, DatoCMS, Tailwind v4, CSP com nonce e streaming.";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Boilerplate Elite 2026",
    description: siteDescription,
    path: "/",
  }),
  title: {
    default: `Boilerplate Elite 2026 · ${getSiteName()}`,
    template: `%s · ${getSiteName()}`,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

function htmlLangFromAppLocale(locale: AppLocale): string {
  if (locale === "en") return "en";
  if (locale === "pt") return "pt-BR";
  return "es";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = await getNonce();
  const headerStore = await headers();
  const localeHeader = headerStore.get(REQUEST_LOCALE_HEADER);
  const appLocale = appLocaleFromParam(localeHeader ?? "") ?? DEFAULT_APP_LOCALE;
  const { isEnabled } = await draftMode();
  const navigationResult = await getNavigation(appLocale, isEnabled);
  const navigation = pickNavigationData(navigationResult);

  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(THEME_COOKIE_NAME)?.value;
  const initialThemeMode = isThemeMode(themeCookie) ? themeCookie : undefined;
  const serverDark = initialThemeMode === "dark";
  const themeCss = buildThemeCssVariables();

  const siteJsonLd = buildSiteJsonLdGraph(appLocale);

  return (
    <html
      lang={htmlLangFromAppLocale(appLocale)}
      suppressHydrationWarning
      data-theme={initialThemeMode}
      className={cn(fontVariables, "h-full", serverDark && "dark")}
    >
      <head>
        <link rel="preconnect" href="https://www.datocms-assets.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.datocms-assets.com" />
      </head>
      <body className="relative flex min-h-dvh flex-col bg-background text-foreground">
        <script
          nonce={nonce ?? undefined}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: buildThemeBootScript() }}
        />
        <SkipLink locale={appLocale} />
        <JsonLdScript graph={siteJsonLd} />
        <div className="sticky top-0 z-50 overflow-visible">
          <DraftChrome />
          <GlobalHeader data={navigation} locale={appLocale} initialThemeMode={initialThemeMode} />
        </div>
        <main id="conteudo-principal" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <SiteFooter data={navigation} locale={appLocale} />
        {/*
          Única injeção: paletas depois do bundle Tailwind (`@theme` em globals.css).
          Ver comentário em buildThemeCssVariables().
        */}
        <style
          nonce={nonce ?? undefined}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeCss }}
        />
      </body>
    </html>
  );
}
