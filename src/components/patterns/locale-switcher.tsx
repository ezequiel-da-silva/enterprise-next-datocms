import { APP_LOCALES, type AppLocale } from "@/constants/i18n";
import {
  LocaleSwitcherMenu,
  type LocaleOption,
} from "@/components/patterns/locale-switcher-menu";
import { cn } from "@/lib/cn";
import { isSafeLocalePath } from "@/lib/i18n/locale-switch-href";
import { homeBreadcrumbPath } from "@/lib/seo/breadcrumb-labels";
import {
  LOCALE_NATIVE_NAME,
  LOCALE_SHORT_CODE,
  languageNavLabel,
  localeSwitcherTriggerLabel,
  schemaLanguage,
} from "@/lib/seo/locale-tags";

type LocaleSwitcherProps = {
  locale: AppLocale;
  hrefs: Record<AppLocale, string>;
  /** `block`: largura total no painel móvel. */
  variant?: "compact" | "block";
  className?: string;
};

function describeLocale(code: AppLocale, hrefs: Record<AppLocale, string>): LocaleOption {
  const href = hrefs[code];
  return {
    code,
    href: isSafeLocalePath(href, code) ? href : homeBreadcrumbPath(code),
    nativeName: LOCALE_NATIVE_NAME[code],
    bcp47: schemaLanguage(code),
    shortCode: LOCALE_SHORT_CODE[code],
  };
}

/** Estrutura no servidor; o cliente só hidrata a abertura do dropdown. */
export function LocaleSwitcher({ locale, hrefs, variant = "compact", className }: LocaleSwitcherProps) {
  const current = describeLocale(locale, hrefs);
  /* Só alternativas: o idioma ativo já está no botão, repeti-lo na lista era uma opção morta. */
  const options: LocaleOption[] = APP_LOCALES.filter((code) => code !== locale).map((code) =>
    describeLocale(code, hrefs),
  );

  if (options.length === 0) return null;

  return (
    <nav
      aria-label={languageNavLabel(locale)}
      className={cn(variant === "block" ? "w-full" : "shrink-0", className)}
    >
      <LocaleSwitcherMenu
        current={current}
        options={options}
        variant={variant}
        triggerAriaLabel={localeSwitcherTriggerLabel(locale, current.shortCode)}
      />
    </nav>
  );
}
