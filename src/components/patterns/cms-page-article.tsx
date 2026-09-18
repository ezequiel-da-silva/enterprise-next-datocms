import { Container } from "@/components/atoms/container";
import { HeroSectionBlock } from "@/components/patterns/hero-section-block";
import { BreadcrumbNav } from "@/components/patterns/breadcrumb-nav";
import { PageContentBlocks } from "@/components/patterns/page-content-blocks";
import { JsonLdScriptSync } from "@/components/patterns/seo-manager";
import type { AppLocale } from "@/constants/i18n";
import type { ContactActionState } from "@/core/entities/contact";
import type { UserReviewSubmitAction } from "@/core/entities/user-review";
import { buildPageWebPageJsonLd, type PageJsonLdType } from "@/lib/seo/build-page-webpage-jsonld";
import { buildSearchPageJsonLd } from "@/lib/seo/build-search-jsonld";
import type { LatestPostsCatalog } from "@/infra/datocms/types-blog";
import type { ProductsListingCatalog } from "@/lib/datocms/resolve-products-section";
import type { SearchResultsPayload } from "@/lib/datocms/search-hit";
import type { PageRecord } from "@/infra/datocms/types-page";
import { heroFirstBlockSuppliesH1, resolveVisiblePageTitle } from "@/lib/datocms/hero-first-block";
import { crumbsToNavItems, homeBreadcrumbLabel } from "@/lib/seo/breadcrumb-labels";
import { getNonce } from "@/lib/nonce";

type CmsPageArticleProps = {
  page: PageRecord;
  locale: AppLocale;
  /** Caminho canónico (ex.: `/en/page-two`, `/en` para home localizada). */
  canonicalPath: string;
  contentLinkGroup: boolean;
  submitUserReview?: UserReviewSubmitAction;
  submitContact?: (
    prev: ContactActionState,
    formData: FormData,
  ) => Promise<ContactActionState>;
  latestPostsCatalog?: LatestPostsCatalog | Promise<LatestPostsCatalog>;
  productsCatalog?: ProductsListingCatalog | Promise<ProductsListingCatalog>;
  jsonLdPageType?: PageJsonLdType;
  searchQuery?: string;
  searchResults?: SearchResultsPayload | Promise<SearchResultsPayload>;
};

export async function CmsPageArticle({
  page,
  locale,
  canonicalPath,
  contentLinkGroup,
  submitUserReview,
  submitContact,
  latestPostsCatalog,
  productsCatalog,
  jsonLdPageType = "WebPage",
  searchQuery,
  searchResults,
}: CmsPageArticleProps) {
  const description = page.seoSettingsSocial?.description ?? null;
  const query = searchQuery?.trim();
  const visibleTitle = resolveVisiblePageTitle(page);
  const jsonLd = query
    ? buildSearchPageJsonLd({
        locale,
        path: canonicalPath,
        title: visibleTitle,
        query,
      })
    : buildPageWebPageJsonLd({
        path: canonicalPath,
        title: visibleTitle,
        description,
        locale,
        pageType: jsonLdPageType,
      });
  const nonce = await getNonce();
  const heroH1 = heroFirstBlockSuppliesH1(page.heroPage);
  const wideLayout = heroH1 || Boolean(page.heroPage) || page.contentPage.length > 0;
  const isHome = page.slug.toLowerCase() === "home";
  const breadcrumbItems = isHome
    ? [{ label: homeBreadcrumbLabel(locale), href: canonicalPath }]
    : crumbsToNavItems([
        { name: homeBreadcrumbLabel(locale), path: `/${locale}` },
        {
          name: query ? `${visibleTitle}: ${query}` : visibleTitle,
          path: query ? `${canonicalPath}?q=${encodeURIComponent(query)}` : canonicalPath,
        },
      ]);
  const pageTitleHeading = (
    <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground">{page.title}</h1>
  );

  return (
    <>
      <JsonLdScriptSync graph={jsonLd} nonce={nonce} />
      <Container
        as="article"
        size={wideLayout ? "md" : "sm"}
        name="CmsPageArticle"
        data-page-leading-hero={page.heroPage ? "" : undefined}
        className={
          page.heroPage
            ? isHome
              ? "pb-12 pt-[var(--site-chrome-overlay-space)]"
              : "pb-12 pt-[calc(var(--site-chrome-overlay-space)+1.5rem)]"
            : "py-12"
        }
      >
        {isHome ? null : <BreadcrumbNav locale={locale} items={breadcrumbItems} />}
        <div className={isHome ? undefined : "mt-4"}>
          {page.heroPage ? (
            <HeroSectionBlock record={page.heroPage} locale={locale} contentLinkGroup={contentLinkGroup} />
          ) : null}
          {!heroH1 ? (
            contentLinkGroup ? (
              <div data-datocms-content-link-group="">{pageTitleHeading}</div>
            ) : (
              pageTitleHeading
            )
          ) : null}
          <PageContentBlocks
            records={page.contentPage}
            contentLinkGroup={contentLinkGroup}
            locale={locale}
            submitUserReview={submitUserReview}
            submitContact={submitContact}
            latestPostsCatalog={latestPostsCatalog}
            productsCatalog={productsCatalog}
            searchQuery={searchQuery}
            searchFormAction={canonicalPath}
            searchResults={searchResults}
          />
        </div>
      </Container>
    </>
  );
}
