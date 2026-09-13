import { Container } from "@/components/atoms/container";
import { BreadcrumbNav } from "@/components/patterns/breadcrumb-nav";
import { JsonLdScriptSync } from "@/components/patterns/seo-manager";
import { StructuredTextRenderer } from "@/components/patterns/structured-text-renderer";
import type { AppLocale } from "@/constants/i18n";
import type { LegalPageRecord } from "@/infra/datocms/types-legal";
import { structuredTextHasHeadingLevel } from "@/lib/datocms/structured-text-has-heading";
import { crumbsToNavItems, homeBreadcrumbLabel } from "@/lib/seo/breadcrumb-labels";
import { buildPageWebPageJsonLd } from "@/lib/seo/build-page-webpage-jsonld";
import { getNonce } from "@/lib/nonce";
import type { CdaStructuredTextValue } from "datocms-structured-text-utils";

type LegalPageArticleProps = {
  page: LegalPageRecord;
  locale: AppLocale;
  canonicalPath: string;
  contentLinkGroup: boolean;
};

export async function LegalPageArticle({
  page,
  locale,
  canonicalPath,
  contentLinkGroup,
}: LegalPageArticleProps) {
  const description = page.seoSettingsSocial?.description ?? null;
  const jsonLd = buildPageWebPageJsonLd({
    path: canonicalPath,
    title: page.title,
    description,
    locale,
    pageType: "WebPage",
  });
  const nonce = await getNonce();
  const bodyHasH1 = structuredTextHasHeadingLevel(page.content, 1);
  const breadcrumbItems = crumbsToNavItems([
    { name: homeBreadcrumbLabel(locale), path: `/${locale}` },
    { name: page.title, path: canonicalPath },
  ]);
  const pageTitleHeading = (
    <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground">{page.title}</h1>
  );

  return (
    <>
      <JsonLdScriptSync graph={jsonLd} nonce={nonce} />
      <Container as="article" size="sm" name="LegalPageArticle" className="py-12">
        <BreadcrumbNav locale={locale} items={breadcrumbItems} />
        <div className="mt-4">
          {!bodyHasH1 ? (
            contentLinkGroup ? (
              <div data-datocms-content-link-group="">{pageTitleHeading}</div>
            ) : (
              pageTitleHeading
            )
          ) : null}
          {page.content ? (
            <div className={bodyHasH1 ? undefined : "mt-8"} data-datocms-content-link-group="">
              <StructuredTextRenderer
                data={page.content as unknown as CdaStructuredTextValue}
                contentLinkGroup={contentLinkGroup}
                locale={locale}
              />
            </div>
          ) : null}
        </div>
      </Container>
    </>
  );
}
