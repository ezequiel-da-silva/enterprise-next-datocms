import type { AppLocale } from "@/constants/i18n";

type SearchFormProps = {
  action: string;
  query?: string;
  locale: AppLocale;
  placeholder?: string;
  submitLabel?: string;
};

const FALLBACK_PLACEHOLDER: Record<AppLocale, string> = {
  en: "Search pages, articles or authors…",
  pt: "Buscar páginas, artigos ou autores…",
  es: "Buscar páginas, artículos o autores…",
};

const FALLBACK_SUBMIT: Record<AppLocale, string> = {
  en: "Search",
  pt: "Buscar",
  es: "Buscar",
};

const FALLBACK_LABEL: Record<AppLocale, string> = {
  en: "Search term",
  pt: "Termo de busca",
  es: "Término de búsqueda",
};

export function SearchForm({
  action,
  query = "",
  locale,
  placeholder,
  submitLabel,
}: SearchFormProps) {
  return (
    <form className="flex flex-col gap-3 sm:flex-row" action={action} method="get" role="search">
      <label className="sr-only" htmlFor="q">
        {FALLBACK_LABEL[locale]}
      </label>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={query}
        placeholder={placeholder || FALLBACK_PLACEHOLDER[locale]}
        autoComplete="off"
        enterKeyHint="search"
        className="min-h-12 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />
      <button
        type="submit"
        className="min-h-12 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {submitLabel || FALLBACK_SUBMIT[locale]}
      </button>
    </form>
  );
}
