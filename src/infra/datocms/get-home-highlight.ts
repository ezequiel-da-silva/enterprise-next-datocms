import { datocmsFetch } from "@/infra/datocms/client";
import { HOME_HIGHLIGHT } from "@/infra/datocms/queries";

type HomeHighlightData = {
  _site: { locales: string[] };
};

export async function getHomeHighlightLocales(): Promise<{ locales: string[]; error?: string }> {
  const result = await datocmsFetch<HomeHighlightData>({
    query: HOME_HIGHLIGHT,
    tags: ["datocms:site"],
    revalidate: 600,
  });

  if ("errors" in result) {
    return { locales: [], error: result.errors[0]?.message };
  }

  return { locales: result.data._site.locales ?? [] };
}
