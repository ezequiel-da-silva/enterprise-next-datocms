import { DEFAULT_APP_LOCALE } from "@/constants/i18n";
import { getSitemapEntries } from "@/infra/datocms/get-sitemap";
import { getSiteSeo, pickSiteSeo } from "@/infra/datocms/get-site-seo";
import { getSiteBaseUrl } from "@/lib/seo/site-config";
import { buildSiteIdentity } from "@/lib/seo/site-identity";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

/**
 * `/llms.txt` — Markdown para agentes/LLMs (H1 + links).
 * @see https://llmstxt.org/
 */
export async function GET() {
  const seoResult = await getSiteSeo(DEFAULT_APP_LOCALE, false);
  const identity = buildSiteIdentity({ seo: pickSiteSeo(seoResult) });
  const site = identity.siteName;
  const base = getSiteBaseUrl();
  const description = identity.description;

  let entries: Awaited<ReturnType<typeof getSitemapEntries>> = [];
  try {
    entries = await getSitemapEntries();
  } catch {
    entries = [];
  }

  const linkLines = entries
    .slice(0, 40)
    .map((e) => {
      const path = e.url.startsWith(base) ? e.url.slice(base.length) || "/" : e.url;
      const label = path === "/" ? "Home" : path;
      return `- [${label}](${e.url})`;
    })
    .join("\n");

  const body = [
    `# ${site}`,
    "",
    description,
    "",
    "## Pages",
    "",
    linkLines || `- [Home](${base}/)`,
    "",
    "## Optional",
    "",
    `- [Sitemap](${base}/sitemap.xml)`,
    `- [Robots](${base}/robots.txt)`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
