import { HomeCmsSection } from "@/components/patterns/home-cms-section";
import { HomeCmsSkeleton } from "@/components/patterns/home-cms-skeleton";
import { JsonLdScript } from "@/components/patterns/seo-manager";
import { getHomeHighlightLocales } from "@/infra/datocms/get-home-highlight";
import { buildStaticPageJsonLd } from "@/lib/seo/build-static-page-jsonld";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { Suspense } from "react";

const homeDescription =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION?.trim() ||
  "Next.js 16, DatoCMS, streaming, CSP com nonce, SEO e acessibilidade.";

export const metadata: Metadata = buildMetadata({
  title: "Início",
  description: homeDescription,
  path: "/",
});

async function HomeCmsShell() {
  const { locales, error } = await getHomeHighlightLocales();
  return <HomeCmsSection locales={locales} error={error} />;
}

export default function Home() {
  const jsonLd = buildStaticPageJsonLd("WebPage", "Início", "/", homeDescription);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-12">
      <JsonLdScript graph={jsonLd} />
      <header className="max-w-2xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Boilerplate Elite 2026
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Next.js 16, Clean Architecture e DatoCMS com streaming.
        </h1>
        <p className="text-pretty text-base text-muted-foreground">
          CSP com nonce, tema sem flicker, formulário com Server Actions e cache com tags de
          revalidação no GraphQL.
        </p>
      </header>

      <Suspense fallback={<HomeCmsSkeleton />}>
        <HomeCmsShell />
      </Suspense>
    </div>
  );
}
