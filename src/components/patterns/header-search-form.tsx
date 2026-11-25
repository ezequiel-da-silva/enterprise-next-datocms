import type { AppLocale } from "@/constants/i18n";
import { cn } from "@/lib/cn";
import type { ChangeEvent } from "react";

const FALLBACK_PLACEHOLDER: Record<AppLocale, string> = {
  en: "Search products, pages or articles…",
  pt: "Buscar produtos, páginas ou artigos…",
  es: "Buscar productos, páginas o artículos…",
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
  /** `block` empilha em largura total: cabe na largura do drawer móvel. */
  variant?: "inline" | "block";
  /** Único por instância — no drawer coexiste com a versão do header. */
  inputId?: string;
  /** Live preview: controlled value + change handler. */
  value?: string;
  onQueryChange?: (value: string) => void;
  /** Close preview before navigation (Enter / lupa submit). */
  onSubmit?: () => void;
  /** `aria-expanded` for the live preview panel. */
  expanded?: boolean;
  /** `aria-controls` id of the preview region when open. */
  controlsId?: string;
};

/**
 * Busca do chrome: input + lupa como submit (Parkinson — sem botão “Search” duplicado
 * face ao ícone do header). Enter/`enterKeyHint=search` também submetem.
 */
export function HeaderSearchForm({
  action,
  locale,
  query = "",
  placeholder,
  submitLabel,
  variant = "inline",
  inputId = "header-search-query",
  value,
  onQueryChange,
  onSubmit,
  expanded,
  controlsId,
}: HeaderSearchFormProps) {
  const block = variant === "block";
  const submit = submitLabel?.trim() || FALLBACK_SUBMIT[locale];
  const controlled = typeof onQueryChange === "function";

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onQueryChange?.(event.target.value);
  }

  return (
    <form
      action={action}
      method="get"
      role="search"
      aria-label={submit}
      className={cn("flex w-full", block ? "flex-col items-stretch" : "items-center")}
      onSubmit={() => onSubmit?.()}
    >
      <label className="sr-only" htmlFor={inputId}>
        {FALLBACK_LABEL[locale]}
      </label>
      <div className="relative min-w-0 w-full flex-1">
        <button
          type="submit"
          className="touch-target absolute left-1 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label={submit}
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </button>
        <input
          id={inputId}
          name="q"
          type="search"
          {...(controlled
            ? { value: value ?? "", onChange: handleChange }
            : { defaultValue: query })}
          placeholder={placeholder?.trim() || FALLBACK_PLACEHOLDER[locale]}
          autoComplete="off"
          enterKeyHint="search"
          aria-expanded={typeof expanded === "boolean" ? expanded : undefined}
          aria-controls={expanded && controlsId ? controlsId : undefined}
          aria-autocomplete={typeof expanded === "boolean" ? "list" : undefined}
          className={cn(
            "w-full min-w-0 rounded-full border border-border bg-background py-2 pl-12 pr-4 text-sm text-foreground shadow-sm transition placeholder:truncate placeholder:text-muted-foreground hover:border-foreground/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            block ? "min-h-12" : "h-10 min-h-10",
          )}
        />
      </div>
    </form>
  );
}
