"use client";

import { Container } from "@/components/atoms/container";
import { HeaderSearchForm } from "@/components/patterns/header-search-form";
import { SearchResults } from "@/components/patterns/search-results";
import type { AppLocale } from "@/constants/i18n";
import { cn } from "@/lib/cn";
import type { SearchHit, SearchResultsPayload } from "@/lib/datocms/search-hit";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";

const TOGGLE_LABELS: Record<AppLocale, { open: string; close: string }> = {
  en: { open: "Open search", close: "Close search" },
  pt: { open: "Abrir busca", close: "Fechar busca" },
  es: { open: "Abrir búsqueda", close: "Cerrar búsqueda" },
};

const VIEW_ALL: Record<AppLocale, string> = {
  en: "View all results",
  pt: "Ver todos os resultados",
  es: "Ver todos los resultados",
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
 * Compact lupa trigger (ghost, matches other header utilities). Opens an absolute
 * search strip under `<header>` with live product preview. Keyboard: ⌘K / Ctrl K.
 */
export function HeaderSearch({ action, locale, query, placeholder, submitLabel }: HeaderSearchProps) {
  const panelId = useId();
  const hasQuery = Boolean(query?.trim());
  const [open, setOpen] = useState(hasQuery);
  const [liveQuery, setLiveQuery] = useState(query?.trim() ?? "");
  const [settled, setSettled] = useState<SettledPreview>({ q: "", hits: [] });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const focusOnOpen = useRef(false);
  const labels = TOGGLE_LABELS[locale];

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) {
      requestAnimationFrame(() => buttonRef.current?.focus());
    }
  }, []);

  const openPanel = useCallback(() => {
    focusOnOpen.current = true;
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open || !focusOnOpen.current) return;
    focusOnOpen.current = false;
    const frame = requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLInputElement>('input[name="q"]')?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      close(false);
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
      if (open) close(false);
      else openPanel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close, openPanel]);

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
    <>
      <button
        type="button"
        ref={buttonRef}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          if (open) {
            close(false);
            return;
          }
          openPanel();
        }}
        className={cn(
          "touch-target size-10 inline-flex cursor-pointer items-center justify-center rounded-md border-transparent bg-transparent text-muted-foreground shadow-none transition hover:bg-muted",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        )}
      >
        <span className="sr-only">{open ? labels.close : labels.open}</span>
        <svg
          aria-hidden
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {open ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </>
          )}
        </svg>
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          className="absolute inset-x-0 top-full z-50 border-b border-border bg-background shadow-lg"
        >
          <Container size="lg" name="GlobalHeaderSearch" className="space-y-4 py-3">
            <HeaderSearchForm
              action={action}
              locale={locale}
              placeholder={placeholder}
              submitLabel={submitLabel}
              value={liveQuery}
              onQueryChange={setLiveQuery}
            />
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
                      onClick={() => close(false)}
                    >
                      {VIEW_ALL[locale]}
                    </Link>
                  </p>
                ) : null}
              </>
            )}
          </Container>
        </div>
      ) : null}
    </>
  );
}
