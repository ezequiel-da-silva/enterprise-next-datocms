"use client";

import { HeaderSearchForm } from "@/components/patterns/header-search-form";
import { SearchResults } from "@/components/patterns/search-results";
import type { AppLocale } from "@/constants/i18n";
import type { SearchHit, SearchResultsPayload } from "@/lib/datocms/search-hit";
import { isSearchResultsPath } from "@/lib/datocms/search-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

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

const SCRIM_TOP_VAR = "--site-search-scrim-top";

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

function syncSearchScrimTop() {
  const chrome = document.querySelector(".site-chrome");
  const bottom = chrome?.getBoundingClientRect().bottom;
  const px = bottom != null && bottom > 0 ? `${Math.round(bottom)}px` : "4rem";
  document.documentElement.style.setProperty(SCRIM_TOP_VAR, px);
}

/**
 * Desktop chrome search: always-visible compact field (Jakob) with live preview strip.
 * Keyboard: ⌘K / Ctrl K focuses the input; Escape closes the preview.
 * On the search results route, preview/scrim stay closed — header only edits `q` + submit.
 * Mobile uses the drawer `HeaderSearchForm` (`searchBlock`) instead — this component is lg+.
 */
export function HeaderSearch({ action, locale, query, placeholder, submitLabel }: HeaderSearchProps) {
  const panelId = useId();
  const inputId = useId();
  const pathname = usePathname() ?? `/${locale}`;
  const onSearchPage = isSearchResultsPath(pathname, action);
  const propQuery = query?.trim() ?? "";
  const [open, setOpen] = useState(false);
  const [liveQuery, setLiveQuery] = useState(propQuery);
  const [syncedPropQuery, setSyncedPropQuery] = useState(propQuery);
  const [settled, setSettled] = useState<SettledPreview>({ q: "", hits: [] });
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Sync input when the URL `q` changes (navigation) without an effect — React “adjust state while rendering”.
  if (propQuery !== syncedPropQuery) {
    setSyncedPropQuery(propQuery);
    setLiveQuery(propQuery);
  }

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const focusInput = useCallback(() => {
    if (!onSearchPage) setOpen(true);
    requestAnimationFrame(() => {
      rootRef.current?.querySelector<HTMLInputElement>(`#${CSS.escape(inputId)}`)?.focus();
    });
  }, [inputId, onSearchPage]);

  const showPanel = open && !onSearchPage;

  useEffect(() => {
    if (!showPanel) {
      document.documentElement.style.removeProperty(SCRIM_TOP_VAR);
      return;
    }
    syncSearchScrimTop();
    const chrome = document.querySelector(".site-chrome");
    const observer =
      chrome instanceof Element ? new ResizeObserver(() => syncSearchScrimTop()) : null;
    if (chrome instanceof Element) observer?.observe(chrome);
    window.addEventListener("resize", syncSearchScrimTop);
    window.addEventListener("scroll", syncSearchScrimTop, { passive: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", syncSearchScrimTop);
      window.removeEventListener("scroll", syncSearchScrimTop);
      document.documentElement.style.removeProperty(SCRIM_TOP_VAR);
    };
  }, [showPanel]);

  useEffect(() => {
    if (!showPanel) return;
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
  }, [showPanel, close]);

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
  const previewReady = showPanel && trimmedLive.length >= 2;

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

  const scrim =
    showPanel && typeof document !== "undefined"
      ? createPortal(
          <div
            aria-hidden
            data-ui-section="GlobalHeaderSearchScrim"
            className="fixed inset-x-0 bottom-0 z-40 bg-black/20"
            style={{ top: `var(${SCRIM_TOP_VAR}, 4rem)` }}
            onClick={close}
          />,
          document.body,
        )
      : null;

  return (
    <div
      ref={rootRef}
      className="relative w-full min-w-[10rem] max-w-[13rem] shrink-0 xl:max-w-[16rem]"
      onFocusCapture={() => {
        if (!onSearchPage) setOpen(true);
      }}
    >
      <HeaderSearchForm
        action={action}
        locale={locale}
        placeholder={placeholder}
        submitLabel={submitLabel}
        value={liveQuery}
        onQueryChange={(value) => {
          setLiveQuery(value);
          if (!onSearchPage) setOpen(true);
        }}
        onClear={() => {
          setLiveQuery("");
          if (!onSearchPage) setOpen(true);
        }}
        onSubmit={close}
        inputId={inputId}
        expanded={showPanel}
        controlsId={panelId}
      />

      {scrim}

      {showPanel ? (
        <div
          ref={panelRef}
          id={panelId}
          role="region"
          aria-label={PREVIEW_REGION[locale]}
          data-ui-section="GlobalHeaderSearch"
          className="absolute top-full right-0 z-50 mt-2 max-h-[min(70vh,28rem)] w-[min(100vw-2rem,28rem)] space-y-3 overflow-y-auto rounded-md border border-border bg-background px-3 py-3 shadow-lg xl:w-[min(100vw-2rem,32rem)]"
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
                onNavigate={close}
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
