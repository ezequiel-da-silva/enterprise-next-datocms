import type { AppLocale } from "@/constants/i18n";
import { cn } from "@/lib/cn";

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

type HeaderSearchFormProps = {
  action: string;
  locale: AppLocale;
  query?: string;
  placeholder?: string | null;
  submitLabel?: string | null;
  /** `block` empilha input e botão: cabe na largura do drawer móvel. */
  variant?: "inline" | "block";
  /** Único por instância — no drawer coexiste com a versão do header. */
  inputId?: string;
};

export function HeaderSearchForm({
  action,
  locale,
  query = "",
  placeholder,
  submitLabel,
  variant = "inline",
  inputId = "header-search-query",
}: HeaderSearchFormProps) {
  const block = variant === "block";
  return (
    <form
      action={action}
      method="get"
      role="search"
      aria-label={FALLBACK_SUBMIT[locale]}
      className={cn(
        "flex w-full gap-2",
        block ? "flex-col items-stretch" : "items-center sm:gap-3",
      )}
    >
      <label className="sr-only" htmlFor={inputId}>
        {FALLBACK_LABEL[locale]}
      </label>
      <div className="relative min-w-0 flex-1">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          id={inputId}
          name="q"
          type="search"
          defaultValue={query}
          placeholder={placeholder?.trim() || FALLBACK_PLACEHOLDER[locale]}
          autoComplete="off"
          enterKeyHint="search"
          className="min-h-12 w-full rounded-full border border-border bg-background py-2 pl-12 pr-4 text-sm text-foreground shadow-sm transition placeholder:text-muted-foreground hover:border-foreground/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
      </div>
      <button
        type="submit"
        className={cn(
          "touch-target-text min-h-12 shrink-0 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          block ? "w-full px-4" : "px-5 sm:px-7",
        )}
      >
        {submitLabel?.trim() || FALLBACK_SUBMIT[locale]}
      </button>
    </form>
  );
}
