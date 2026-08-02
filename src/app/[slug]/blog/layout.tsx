import { isAppLocale } from "@/constants/i18n";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";

type BlogLayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

/**
 * O primeiro segmento da URL partilha o nome dinâmico `[slug]` com as páginas CMS.
 * Aqui restringimos `slug` a `en` | `pt` | `es` para todas as rotas `/[slug]/blog/*`.
 */
export default async function BlogLayout({ children, params }: BlogLayoutProps) {
  const { slug } = await params;
  if (!isAppLocale(slug)) {
    notFound();
  }

  const lang = slug === "en" ? "en" : slug === "pt" ? "pt-BR" : "es";

  return (
    <div lang={lang} className="contents">
      {children}
    </div>
  );
}
