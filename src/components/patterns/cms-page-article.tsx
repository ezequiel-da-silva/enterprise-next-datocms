import { HeroSectionBlock } from "@/components/patterns/hero-section-block";
import { PageStructuredText } from "@/components/patterns/page-structured-text";
import { JsonLdScriptSync } from "@/components/patterns/seo-manager";
import type { AppLocale } from "@/constants/i18n";
import { buildPageWebPageJsonLd } from "@/infra/datocms/adapters/build-page-jsonld";
import type { PageRecord } from "@/infra/datocms/types-page";
import { heroFirstBlockSuppliesH1 } from "@/lib/datocms/hero-first-block";
import { getNonce } from "@/lib/nonce";

type CmsPageArticleProps = {
  page: PageRecord;
  locale: AppLocale;
  /** Caminho canónico (ex.: `/en/page-two`, `/en` para home localizada). */
  canonicalPath: string;
  contentLinkGroup: boolean;
};

export async function CmsPageArticle({ page, locale, canonicalPath, contentLinkGroup }: CmsPageArticleProps) {
  const description = page.seoSettingsSocial?.description ?? null;
  const jsonLd = buildPageWebPageJsonLd({
    path: canonicalPath,
    title: page.title,
    description,
  });
  const nonce = await getNonce();
  const heroH1 = heroFirstBlockSuppliesH1(page.structuredText, page.heroPage);
  const wideLayout = heroH1 || Boolean(page.heroPage);

  return (
    <>
      <JsonLdScriptSync graph={jsonLd} nonce={nonce} />
      <article className={wideLayout ? "mx-auto w-full max-w-5xl px-4 py-12" : "mx-auto w-full max-w-3xl px-4 py-12"}>
        {page.heroPage ? <HeroSectionBlock record={page.heroPage} locale={locale} /> : null}
        {!heroH1 ? (
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground">{page.title}</h1>
        ) : null}
        <PageStructuredText data={page.structuredText} contentLinkGroup={contentLinkGroup} locale={locale} />
      </article>
    </>
  );
}
