import type { AppLocale } from "@/constants/i18n";
import Link from "next/link";

function skipLabel(locale: AppLocale): string {
  if (locale === "pt") return "Saltar para o conteúdo principal";
  if (locale === "es") return "Saltar al contenido principal";
  return "Skip to main content";
}

type SkipLinkProps = {
  locale: AppLocale;
  /** Deve coincidir com `id` do `<main>`. */
  mainId?: string;
};

/**
 * Link de salto no ATF — oculto até foco; `fixed` evita interferir no layout do header.
 */
export function SkipLink({ locale, mainId = "conteudo-principal" }: SkipLinkProps) {
  return (
    <Link href={`#${mainId}`} className="skip-link">
      {skipLabel(locale)}
    </Link>
  );
}
