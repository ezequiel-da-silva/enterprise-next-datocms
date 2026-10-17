import { buildThemeCssVariables } from "@/config/theme.config";
import { DraftChrome, DraftContentLink } from "@/components/patterns/draft-chrome";
import { SkipLink } from "@/components/patterns/skip-link";
import { getCartSnapshot, removeCartLine, updateCartLine } from "@/app/actions/cart";
import { toCartDrawerCopy } from "@/lib/i18n/cart-drawer-copy";
import { CartChrome } from "@/components/patterns/cart-chrome";
import { GlobalHeader } from "@/components/patterns/global-header";
import { SiteFooter } from "@/components/patterns/site-footer";
import { JsonLdScript } from "@/components/patterns/seo-manager";
import { buildThemeBootScript } from "@/lib/theme-boot-script";
import { DEFAULT_APP_LOCALE, REQUEST_LOCALE_HEADER, REQUEST_PATHNAME_HEADER, REQUEST_SEARCH_HEADER, appLocaleFromParam } from "@/constants/i18n";
import { THEME_COOKIE_NAME, isThemeMode } from "@/constants/theme";
import { pickNavigationData, getNavigation } from "@/infra/datocms/get-navigation";
import { getSearchPage, searchPagePath } from "@/infra/datocms/get-search-page";
import { getAccountCopy, getCartCopy, getConsentCopy } from "@/infra/datocms/get-ui-strings";
import { getSiteSeo, pickSiteSeo } from "@/infra/datocms/get-site-seo";
import { ConsentRoot } from "@/components/patterns/consent/consent-root";
import { getCartFromCookie } from "@/infra/shopify/cart";
import { getShopPrivacyPolicyUrl } from "@/infra/shopify/storefront";
import { readGaMeasurementId } from "@/lib/analytics/ga-config";
import { isSpeedInsightsEnabled } from "@/lib/analytics/speed-insights-config";
import { CONSENT_COOKIE, parseConsent } from "@/lib/consent/consent-cookie";
import { readShopifyPrivacyConfig } from "@/lib/shopify/customer-privacy-config";
import { CART_COOKIE, isCartEnabled } from "@/lib/shopify/cart-cookie";
import {
  activeAccessToken,
  CUSTOMER_COOKIE,
  isCustomerAccountEnabled,
  readCustomerSession,
} from "@/lib/shopify/customer-session";
import { cn } from "@/lib/cn";
import { appendLocaleSwitcherSearch } from "@/lib/i18n/locale-switch-href";
import { resolveLocaleSwitcherHrefs } from "@/lib/i18n/resolve-locale-switcher-hrefs";
import { readSearchQuery } from "@/lib/datocms/search-query";
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
  const search = headerStore.get(REQUEST_SEARCH_HEADER) ?? "";
  const query = readSearchQuery(new URLSearchParams(search.startsWith("?") ? search.slice(1) : search).get("q"));
  const [navigationResult, seoResult, resolvedHrefs, searchPage] = await Promise.all([
    getNavigation(appLocale, isEnabled),
    getSiteSeo(appLocale, isEnabled),
    resolveLocaleSwitcherHrefs(pathname, appLocale, isEnabled),
    getSearchPage(appLocale, isEnabled),
  ]);
  const localeHrefs = appendLocaleSwitcherSearch(resolvedHrefs, query);
  const navigation = pickNavigationData(navigationResult);
  const identity = buildSiteIdentity({
    seo: pickSiteSeo(seoResult),
    logoUrl: navigation?.logo?.url,
    socialLinks: navigation?.socialLinks,
  });
  return {
    appLocale,
    navigation,
    localeHrefs,
    identity,
    searchPath: searchPagePath(appLocale, searchPage),
    searchQuery: query,
  };
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
  const { appLocale, navigation, localeHrefs, identity, searchPath, searchQuery } =
    await loadLayoutChrome();

  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(THEME_COOKIE_NAME)?.value;
  const initialThemeMode = isThemeMode(themeCookie) ? themeCookie : undefined;
  const serverDark = initialThemeMode === "dark";
  const accountEnabled = isCustomerAccountEnabled();
  const customerSession = accountEnabled ? readCustomerSession(cookieStore.get(CUSTOMER_COOKIE)?.value) : null;
  const cartCount = isCartEnabled()
    ? ((await getCartFromCookie(cookieStore.get(CART_COOKIE)?.value, appLocale, activeAccessToken(customerSession)))
        ?.totalQuantity ?? 0)
    : null;
  const initialConsent = parseConsent(cookieStore.get(CONSENT_COOKIE)?.value);
  const [privacyPolicyUrl, consentCopy, cartCopy, accountCopy] = await Promise.all([
    getShopPrivacyPolicyUrl(),
    getConsentCopy(appLocale),
    getCartCopy(appLocale),
    getAccountCopy(appLocale),
  ]);
  const themeCss = buildThemeCssVariables();

  const siteJsonLd = buildSiteJsonLdGraph(identity, searchPath);
  const cartEnabled = isCartEnabled();

  const pageChrome = (
    <>
      <div className="site-chrome sticky top-0 z-50 overflow-visible">
        <DraftChrome />
        <GlobalHeader
          data={navigation}
          locale={appLocale}
          localeHrefs={localeHrefs}
          searchPath={searchPath}
          searchQuery={searchQuery}
          initialThemeMode={initialThemeMode}
          cartCount={cartCount}
          accountSignedIn={accountEnabled ? customerSession !== null : null}
          cartLinkLabel={cartCopy.linkLabel(cartCount ?? 0)}
          accountLinkLabel={accountCopy.linkLabel(customerSession !== null)}
        />
      </div>
      <main id="conteudo-principal" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <SiteFooter data={navigation} locale={appLocale} cookiePreferencesLabel={consentCopy.manage} />
    </>
  );

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
        {cartEnabled ? (
          <CartChrome
            locale={appLocale}
            copy={toCartDrawerCopy(cartCopy)}
            loadCartSnapshot={getCartSnapshot}
            lineActions={{ updateLine: updateCartLine, removeLine: removeCartLine }}
          >
            {pageChrome}
          </CartChrome>
        ) : (
          pageChrome
        )}
        <ConsentRoot
          copy={consentCopy}
          initialConsent={initialConsent}
          gaMeasurementId={readGaMeasurementId()}
          speedInsightsEnabled={isSpeedInsightsEnabled()}
          shopifyPrivacy={readShopifyPrivacyConfig()}
          privacyPolicyUrl={privacyPolicyUrl}
          nonce={nonce ?? null}
        />
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
