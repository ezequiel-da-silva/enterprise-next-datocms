import { DEFAULT_APP_LOCALE } from "@/constants/i18n";
import { getSiteSeo, pickSiteSeo } from "@/infra/datocms/get-site-seo";
import { getSiteBaseUrl } from "@/lib/seo/site-config";
import { buildSiteIdentity } from "@/lib/seo/site-identity";
import { manifestLang } from "@/lib/seo/locale-tags";
import type { MetadataRoute } from "next";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const base = getSiteBaseUrl().replace(/\/$/, "");
  const seoResult = await getSiteSeo(DEFAULT_APP_LOCALE, false);
  const identity = buildSiteIdentity({ seo: pickSiteSeo(seoResult) });
  const name = identity.siteName;

  return {
    name,
    short_name: name.length > 12 ? name.slice(0, 12) : name,
    description: identity.description,
    start_url: `/${DEFAULT_APP_LOCALE}`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
    lang: manifestLang(),
    icons: [
      {
        src: `${base}/icon`,
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: `${base}/apple-icon`,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
