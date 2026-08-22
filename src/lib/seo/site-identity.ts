import type { SocialLinkNav } from "@/infra/datocms/types-navigation";
import type { SiteGlobalSeo } from "@/infra/datocms/types-site-seo";
import { isSafeExternalHref } from "@/lib/datocms/link-block";
import {
  getDefaultOpenGraphImage,
  getOrganizationName,
  getSiteName,
} from "@/lib/seo/site-config";

const DEFAULT_SITE_DESCRIPTION =
  "Next.js 16, Clean Architecture, DatoCMS, Tailwind v4, CSP com nonce e streaming.";

export type SiteIdentity = {
  siteName: string;
  organizationName: string;
  description: string;
  fallbackTitle: string;
  titleSuffix: string | null;
  fallbackOgImage?: string;
  logoUrl?: string;
  sameAs: string[];
};

function twitterProfileUrl(raw: string): string | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  if (/^https?:\/\//i.test(t)) return t;
  const handle = t.replace(/^@/, "");
  if (!handle) return undefined;
  return `https://x.com/${handle}`;
}

function uniqueSafeUrls(urls: Array<string | undefined | null>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of urls) {
    const t = raw?.trim();
    if (!t || !isSafeExternalHref(t) || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

export function buildSiteIdentity(input: {
  seo?: SiteGlobalSeo | null;
  logoUrl?: string | null;
  socialLinks?: Pick<SocialLinkNav, "url">[] | null;
}): SiteIdentity {
  const seo = input.seo;
  const cmsName = seo?.siteName?.trim();
  const siteName = cmsName || getSiteName();
  const organizationName = cmsName || getOrganizationName();
  const description =
    seo?.fallbackSeo?.description?.trim() ||
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION?.trim() ||
    DEFAULT_SITE_DESCRIPTION;
  const fallbackTitle = seo?.fallbackSeo?.title?.trim() || siteName;
  const cmsOg = seo?.fallbackSeo?.image?.url?.trim();
  const fallbackOgImage = cmsOg || getDefaultOpenGraphImage();
  const logoUrl = input.logoUrl?.trim() || process.env.NEXT_PUBLIC_ORGANIZATION_LOGO_URL?.trim() || undefined;
  const envSameAs =
    process.env.NEXT_PUBLIC_ORGANIZATION_SAME_AS?.split(",").map((u) => u.trim()) ?? [];
  const sameAs = uniqueSafeUrls([
    ...(input.socialLinks ?? []).map((s) => s.url),
    seo?.facebookPageUrl,
    twitterProfileUrl(seo?.twitterAccount ?? ""),
    ...envSameAs,
  ]);

  return {
    siteName,
    organizationName,
    description,
    fallbackTitle,
    titleSuffix: seo?.titleSuffix?.trim() || null,
    fallbackOgImage,
    logoUrl,
    sameAs,
  };
}

/** Título default do layout: fallback SEO, com suffix do Dato se existir. */
export function siteDefaultDocumentTitle(identity: SiteIdentity): string {
  if (identity.titleSuffix) {
    const suffix = identity.titleSuffix.startsWith(" ")
      ? identity.titleSuffix
      : ` ${identity.titleSuffix}`;
    if (identity.fallbackTitle.endsWith(identity.titleSuffix.trim())) {
      return identity.fallbackTitle;
    }
    return `${identity.fallbackTitle}${suffix}`;
  }
  return `${identity.fallbackTitle} · ${identity.siteName}`;
}
