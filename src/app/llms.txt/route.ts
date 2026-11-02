import { DEFAULT_APP_LOCALE } from "@/constants/i18n";
import { getLlmsCatalog } from "@/infra/datocms/get-llms-catalog";
import { getSiteSeo, pickSiteSeo } from "@/infra/datocms/get-site-seo";
import { buildLlmsTxt } from "@/lib/seo/build-llms-txt";
import { getSiteBaseUrl } from "@/lib/seo/site-config";
import { buildSiteIdentity } from "@/lib/seo/site-identity";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

/**
 * `/llms.txt` — Markdown para agentes/LLMs (título, uma linha, URL por locale).
 * @see https://llmstxt.org/
 */
export async function GET() {
  const seoResult = await getSiteSeo(DEFAULT_APP_LOCALE, false);
  const identity = buildSiteIdentity({ seo: pickSiteSeo(seoResult) });
  const base = getSiteBaseUrl();
  const catalog = await getLlmsCatalog().catch(() => ({
    pages: [],
    blog: [],
    products: [],
    collections: [],
    policies: [],
  }));

  const body = buildLlmsTxt({
    siteName: identity.siteName,
    description: identity.description,
    ...catalog,
    sitemapUrl: `${base}/sitemap.xml`,
    robotsUrl: `${base}/robots.txt`,
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
