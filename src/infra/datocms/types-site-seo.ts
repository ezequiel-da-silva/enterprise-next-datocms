export type SiteFallbackSeo = {
  title?: string | null;
  description?: string | null;
  image?: {
    url: string;
    alt?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
};

export type SiteGlobalSeo = {
  siteName?: string | null;
  titleSuffix?: string | null;
  facebookPageUrl?: string | null;
  twitterAccount?: string | null;
  fallbackSeo?: SiteFallbackSeo | null;
};

export type GetSiteSeoQueryResult = {
  _site: {
    globalSeo?: SiteGlobalSeo | null;
  };
};
