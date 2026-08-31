import { buildThemeCssVariables } from "@/config/theme.config";
import { DraftChrome, DraftContentLink } from "@/components/patterns/draft-chrome";
import { SkipLink } from "@/components/patterns/skip-link";
import { GlobalHeader } from "@/components/patterns/global-header";
import { SiteFooter } from "@/components/patterns/site-footer";
import { JsonLdScript } from "@/components/patterns/seo-manager";
import { buildThemeBootScript } from "@/lib/theme-boot-script";
import { DEFAULT_APP_LOCALE, REQUEST_LOCALE_HEADER, REQUEST_PATHNAME_HEADER, appLocaleFromParam } from "@/constants/i18n";
import { THEME_COOKIE_NAME, isThemeMode } from "@/constants/theme";
import { pickNavigationData, getNavigation } from "@/infra/datocms/get-navigation";
import { getSiteSeo, pickSiteSeo } from "@/infra/datocms/get-site-seo";
import { cn } from "@/lib/cn";
import { resolveLocaleSwitcherHrefs } from "@/lib/i18n/resolve-locale-switcher-hrefs";
import { getNonce } from "@/lib/nonce";
import { buildMetadata } from "@/lib/seo";
import { schemaLanguage } from "@/lib/seo/locale-tags";
import { buildSiteJsonLdGraph } from "@/lib/seo/json-ld-site";
import { buildSiteIdentity, siteDefaultDocumentTitle } from "@/lib/seo/site-identity";
import type { Metadata, Viewport } from "next";
import { cookies, draftMode, headers } from "next/headers";
import { Inter, Roboto_Mono } from "next/font/google";
import { cache } from "react";
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

const loadLayoutChrome = cache(async () => {
  const headerStore = await headers();
  const localeHeader = headerStore.get(REQUEST_LOCALE_HEADER);
  const appLocale = appLocaleFromParam(localeHeader ?? "") ?? DEFAULT_APP_LOCALE;
  const { isEnabled } = await draftMode();
  const pathname = headerStore.get(REQUEST_PATHNAME_HEADER) ?? `/${appLocale}`;
  const [navigationResult, seoResult, localeHrefs] = await Promise.all([
    getNavigation(appLocale, isEnabled),
    getSiteSeo(appLocale, isEnabled),
    resolveLocaleSwitcherHrefs(pathname, appLocale, isEnabled),
  ]);
  const navigation = pickNavigationData(navigationResult);
  const identity = buildSiteIdentity({
    seo: pickSiteSeo(seoResult),
    logoUrl: navigation?.logo?.url,
    socialLinks: navigation?.socialLinks,
  });
  return { appLocale, navigation, localeHrefs, identity };
});

export async function generateMetadata(): Promise<Metadata> {
  const { appLocale, identity } = await loadLayoutChrome();
  const title = identity.fallbackTitle;
  return {
    ...buildMetadata({
      title,
      description: identity.description,
      path: "/",
      openGraphImage: identity.fallbackOgImage,
      locale: appLocale,
    }),
    title: {
      default: siteDefaultDocumentTitle(identity),
      template: `%s · ${identity.siteName}`,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = await getNonce();
  const { appLocale, navigation, localeHrefs, identity } = await loadLayoutChrome();

  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(THEME_COOKIE_NAME)?.value;
  const initialThemeMode = isThemeMode(themeCookie) ? themeCookie : undefined;
  const serverDark = initialThemeMode === "dark";
  const themeCss = buildThemeCssVariables();

  const siteJsonLd = buildSiteJsonLdGraph(identity);

  return (
    <html
      lang={schemaLanguage(appLocale)}
      suppressHydrationWarning
      data-theme={initialThemeMode}
      className={cn(fontVariables, "h-full", serverDark && "dark")}
    >
      <head>
        <link rel="preconnect" href="https://www.datocms-assets.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.datocms-assets.com" />
        <link rel="preconnect" href="https://image.mux.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://image.mux.com" />
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
          <GlobalHeader
            data={navigation}
            locale={appLocale}
            localeHrefs={localeHrefs}
            initialThemeMode={initialThemeMode}
          />
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
        <DraftContentLink />
      </body>
    </html>
  );
}
