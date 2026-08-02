import type { AppLocale } from "@/constants/i18n";
import { isAppLocale } from "@/constants/i18n";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string; authorSlug: string }>;
};

/** Evita indexar o URL legado `/[locale]/author/...` (canónico: `/[locale]/blog/author/...`). */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

/**
 * Redireciona URLs do tipo `/en/author/ezequiel` para o caminho suportado pela app:
 * `/en/blog/author/ezequiel`.
 */
export default async function LegacyAuthorPathRedirect({ params }: Props) {
  const { slug, authorSlug } = await params;
  if (!isAppLocale(slug)) {
    notFound();
  }
  const locale = slug as AppLocale;
  permanentRedirect(`/${locale}/blog/author/${authorSlug}`);
}
