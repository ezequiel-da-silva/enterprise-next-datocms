import { getSiteBaseUrl, getSiteName } from "@/lib/seo/site-config";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  const base = getSiteBaseUrl();
  const name = getSiteName();

  return {
    name,
    short_name: name.length > 12 ? name.slice(0, 12) : name,
    description:
      process.env.NEXT_PUBLIC_SITE_DESCRIPTION?.trim() ||
      "Site Next.js com DatoCMS, SEO e acessibilidade.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
    lang: "pt-BR",
    icons: [
      {
        src: `${base}/favicon.ico`,
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
