"use client";

import { HeaderSearchForm } from "@/components/patterns/header-search-form";
import { SearchResults } from "@/components/patterns/search-results";
import type { AppLocale } from "@/constants/i18n";
import type { SearchHit, SearchResultsPayload } from "@/lib/datocms/search-hit";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";

const VIEW_ALL: Record<AppLocale, string> = {
  en: "View all results",
  pt: "Ver todos os resultados",
  es: "Ver todos los resultados",
};

const PREVIEW_REGION: Record<AppLocale, string> = {
  en: "Search suggestions",
  pt: "Sugestões de busca",
  es: "Sugerencias de búsqueda",
};

const PREVIEW_HINT: Record<AppLocale, string> = {
  en: "Type at least 2 characters to preview products and articles.",
  pt: "Escreva pelo menos 2 caracteres para pré-visualizar produtos e artigos.",
  es: "Escribe al menos 2 caracteres para previsualizar productos y artículos.",
};

type SettledPreview = {
  q: string;
  hits: SearchHit[];
  error?: string;
};

type HeaderSearchProps = {
  action: string;
  locale: AppLocale;
  query?: string;
  placeholder?: string | null;
  submitLabel?: string | null;
};

/**
 * Desktop chrome search: always-visible compact field (Jakob) with live preview strip.
 * Keyboard: ⌘K / Ctrl K focuses the input; Escape closes the preview.
 * Mobile uses the drawer `HeaderSearchForm` (`searchBlock`) instead — this component is lg+.
 */
export function HeaderSearch({ action, locale, query, placeholder, submitLabel }: HeaderSearchProps) {
  const panelId = useId();
  const inputId = useId();
  const hasQuery = Boolean(query?.trim());
  const [open, setOpen] = useState(hasQuery);
  const [liveQuery, setLiveQuery] = useState(query?.trim() ?? "");
  const [settled, setSettled] = useState<SettledPreview>({ q: "", hits: [] });
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const focusInput = useCallback(() => {
    setOpen(true);
    requestAnimationFrame(() => {
      rootRef.current?.querySelector<HTMLInputElement>(`#${CSS.escape(inputId)}`)?.focus();
    });
  }, [inputId]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, close]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.key === "k" || e.key === "K")) return;
      if (!(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      focusInput();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [focusInput]);

  const trimmedLive = liveQuery.trim();
  const previewReady = open && trimmedLive.length >= 2;

  useEffect(() => {
    if (!previewReady) return;

    let cancelled = false;
    const q = trimmedLive;
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ locale, q });
      void fetch(`/api/search?${params.toString()}`)
        .then(async (res) => {
          if (!res.ok) throw new Error("search failed");
          return (await res.json()) as SearchResultsPayload;
        })
        .then((payload) => {
          if (cancelled) return;
          setSettled({ q, hits: payload.hits ?? [], error: payload.error });
        })
        .catch(() => {
          if (cancelled) return;
          setSettled({ q, hits: [], error: "unavailable" });
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [previewReady, trimmedLive, locale]);

  const showPreviewLoading = previewReady && settled.q !== trimmedLive;
  const previewHits = previewReady && settled.q === trimmedLive ? settled.hits : [];
  const previewErr = previewReady && settled.q === trimmedLive ? settled.error : undefined;

  const seeAllHref = previewReady
    ? `${action}${action.includes("?") ? "&" : "?"}q=${encodeURIComponent(trimmedLive)}`
    : action;

  return (
    <div
      ref={rootRef}
      className="relative w-full min-w-[10rem] max-w-[13rem] shrink-0 xl:max-w-[16rem]"
      onFocusCapture={() => setOpen(true)}
    >
      <HeaderSearchForm
        action={action}
        locale={locale}
        placeholder={placeholder}
        submitLabel={submitLabel}
        value={liveQuery}
        onQueryChange={(value) => {
          setLiveQuery(value);
          setOpen(true);
        }}
        inputId={inputId}
      />

      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          role="region"
          aria-label={PREVIEW_REGION[locale]}
          data-ui-section="GlobalHeaderSearch"
          className="absolute top-full right-0 z-50 mt-2 w-[min(100vw-2rem,28rem)] space-y-3 rounded-md border border-border bg-background px-3 py-3 shadow-lg"
        >
          {trimmedLive.length < 2 ? (
            <p className="text-sm text-muted-foreground">{PREVIEW_HINT[locale]}</p>
          ) : showPreviewLoading ? (
            <p className="text-sm text-muted-foreground" aria-busy="true">
              …
            </p>
          ) : (
            <>
              <SearchResults
                query={trimmedLive}
                hits={previewHits}
                locale={locale}
                error={previewErr}
                compact
              />
              {previewHits.length > 0 ? (
                <p className="pb-1">
                  <Link
                    href={seeAllHref}
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    onClick={() => close()}
                  >
                    {VIEW_ALL[locale]}
                  </Link>
                </p>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
