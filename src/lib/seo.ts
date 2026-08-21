import type { AppLocale } from "@/constants/i18n";
import { buildHreflangAlternates } from "@/lib/seo/hreflang";
import { appLocaleFromPath, openGraphAlternateLocales, openGraphLocale } from "@/lib/seo/locale-tags";
import { getOrganizationName, getSiteBaseUrl, getSiteName } from "@/lib/seo/site-config";
import type { Metadata } from "next";

export type SeoInput = {
  title: string;
  description: string;
  path?: string;
  openGraphImage?: string;
  noIndex?: boolean;
  /** Evita `alternates.canonical` enganador (ex.: 404). */
  omitCanonical?: boolean;
  /** Sobrescreve o template de título do layout. */
  absoluteTitle?: boolean;
  /** hreflang para páginas estáticas multilíngues (ex.: `/contato`). */
  hreflangPaths?: Partial<Record<AppLocale, string>>;
  /** Locale da página; se omitido, deriva do `path` ou usa o default da app. */
  locale?: AppLocale;
};

const DEFAULT_ROBOTS: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

export function buildMetadata(input: SeoInput): Metadata {
  const base = getSiteBaseUrl();
  const siteName = getSiteName();
  const url = new URL(input.path ?? "/", `${base}/`).toString();
  const title = input.absoluteTitle ? { absolute: input.title } : input.title;
  const locale = input.locale ?? appLocaleFromPath(input.path);

  const ogImages = input.openGraphImage ? [{ url: input.openGraphImage, alt: input.title }] : undefined;

  const hreflang = input.hreflangPaths ? buildHreflangAlternates(input.hreflangPaths) : undefined;
  const alternateLocale = openGraphAlternateLocales(locale, input.hreflangPaths);

  return {
    title,
    description: input.description,
    metadataBase: new URL(`${base}/`),
    applicationName: siteName,
    authors: [{ name: getOrganizationName(), url: base }],
    creator: getOrganizationName(),
    publisher: getOrganizationName(),
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    robots: input.noIndex ? { index: false, follow: false } : DEFAULT_ROBOTS,
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      type: "website",
      siteName,
      locale: openGraphLocale(locale),
      ...(alternateLocale ? { alternateLocale } : {}),
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: input.openGraphImage ? [input.openGraphImage] : undefined,
    },
    alternates: input.omitCanonical
      ? hreflang
      : { canonical: url, ...hreflang },
  };
}
