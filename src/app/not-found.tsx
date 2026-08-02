import { Button } from "@/components/atoms/button";
import { DatoResponsivePicture } from "@/components/patterns/dato-responsive-picture";
import { StructuredTextRenderer } from "@/components/patterns/structured-text-renderer";
import { DEFAULT_APP_LOCALE, REQUEST_LOCALE_HEADER, appLocaleFromParam, type AppLocale } from "@/constants/i18n";
import { getGlobalSettings, pickGlobalSetting } from "@/infra/datocms/get-global-settings";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { draftMode, headers } from "next/headers";
import Link from "next/link";
import { cache } from "react";

function notFoundMetaTitle(locale: AppLocale): string {
  if (locale === "pt") return "Página não encontrada";
  if (locale === "es") return "Página no encontrada";
  return "Page not found";
}

function notFoundMetaDescription(locale: AppLocale): string {
  if (locale === "pt") {
    return "O conteúdo não existe ou foi movido. Esta página não deve ser indexada.";
  }
  if (locale === "es") {
    return "El contenido no existe o se ha movido. Esta página no debe indexarse.";
  }
  return "This content does not exist or has moved. This page should not be indexed.";
}

/** Metadados: texto a partir do DAST (apenas nós `span`), sem blocos/embeds resolvidos. */
function structuredTextPlainText(value: unknown): string | null {
  const doc = value && typeof value === "object" && "document" in value ? (value as { document?: unknown }).document : value;
  const parts: string[] = [];
  const walk = (node: unknown): void => {
    if (!node || typeof node !== "object") return;
    const n = node as Record<string, unknown>;
    if (n.type === "span" && typeof n.value === "string") {
      parts.push(n.value);
    }
    const children = n.children;
    if (Array.isArray(children)) {
      for (const c of children) walk(c);
    }
  };
  walk(doc);
  const out = parts.join(" ").replace(/\s+/g, " ").trim();
  return out.length > 0 ? out : null;
}

function homeLinkLabel(locale: AppLocale): string {
  if (locale === "pt") return "Voltar ao início";
  if (locale === "es") return "Volver al inicio";
  return "Back to home";
}

function blogLinkLabel(locale: AppLocale): string {
  if (locale === "pt") return "Ir para o blog";
  if (locale === "es") return "Ir al blog";
  return "Go to blog";
}

const getNotFoundCmsContext = cache(async () => {
  const headerStore = await headers();
  const locale = appLocaleFromParam(headerStore.get(REQUEST_LOCALE_HEADER) ?? "") ?? DEFAULT_APP_LOCALE;
  const { isEnabled } = await draftMode();
  const result = await getGlobalSettings(locale, isEnabled);
  return { locale, isEnabled, setting: pickGlobalSetting(result) };
});

export async function generateMetadata(): Promise<Metadata> {
  const { locale, setting } = await getNotFoundCmsContext();
  const cmsTitle = setting?.title404?.trim();
  const title = cmsTitle && cmsTitle.length > 0 ? cmsTitle : notFoundMetaTitle(locale);
  const cmsDesc =
    setting?.description404?.value != null
      ? structuredTextPlainText(setting.description404.value)
      : null;
  const description = cmsDesc ?? notFoundMetaDescription(locale);
  return buildMetadata({
    title: `${title} · next-dato`,
    description,
    path: "/",
    noIndex: true,
    omitCanonical: true,
  });
}

export default async function NotFound() {
  const { locale, isEnabled, setting } = await getNotFoundCmsContext();
  const cmsTitle = setting?.title404?.trim();
  const displayTitle = cmsTitle && cmsTitle.length > 0 ? cmsTitle : notFoundMetaTitle(locale);
  const image = setting?.image404;
  const mobile = image?.asset;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center gap-8 px-4 py-16 text-center md:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">404</p>
      <div className="space-y-4">
        <h1 className="text-balance font-sans text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {displayTitle}
        </h1>
        {setting?.description404 ? (
          <div className="text-pretty text-base text-muted-foreground md:text-lg">
            <StructuredTextRenderer data={setting.description404} contentLinkGroup={isEnabled} locale={locale} />
          </div>
        ) : (
          <p className="text-pretty text-base text-muted-foreground md:text-lg">{notFoundMetaDescription(locale)}</p>
        )}
      </div>

      {mobile?.url ? (
        <figure className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-muted/40 p-4 shadow-sm ring-1 ring-border/60">
          <DatoResponsivePicture
            mobile={mobile}
            desktop={image?.assetDesktop}
            className="mx-auto h-auto w-full max-w-full rounded-md object-contain"
            sizes="(max-width: 768px) 100vw, 448px"
            priority
          />
        </figure>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        <Button asChild variant="primary">
          <Link href="/">{homeLinkLabel(locale)}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/${locale}/blog`}>{blogLinkLabel(locale)}</Link>
        </Button>
      </div>
    </div>
  );
}
