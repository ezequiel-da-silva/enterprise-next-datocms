import { DEFAULT_APP_LOCALE } from "@/constants/i18n";
import { getSiteBaseUrl, getSiteName } from "@/lib/seo/site-config";
import { manifestLang } from "@/lib/seo/locale-tags";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  const base = getSiteBaseUrl().replace(/\/$/, "");
  const name = getSiteName();

  return {
    name,
    short_name: name.length > 12 ? name.slice(0, 12) : name,
    description:
      process.env.NEXT_PUBLIC_SITE_DESCRIPTION?.trim() ||
      "Site Next.js com DatoCMS, SEO e acessibilidade.",
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
