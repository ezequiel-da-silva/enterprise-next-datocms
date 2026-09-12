import { DEFAULT_APP_LOCALE } from "@/constants/i18n";
import { getSearchPage, searchPagePath } from "@/infra/datocms/get-search-page";
import { readSearchQuery, searchResultsPath } from "@/lib/datocms/search-query";
import { draftMode } from "next/headers";
import { permanentRedirect } from "next/navigation";

type BuscaRedirectProps = {
  searchParams: Promise<{ q?: string }>;
};

/** Compat: `/busca` aponta para a Page configurada em Global setting. */
export default async function BuscaRedirectPage({ searchParams }: BuscaRedirectProps) {
  const { isEnabled } = await draftMode();
  const page = await getSearchPage(DEFAULT_APP_LOCALE, isEnabled);
  const query = readSearchQuery((await searchParams).q);
  permanentRedirect(searchResultsPath(searchPagePath(DEFAULT_APP_LOCALE, page), query));
}
