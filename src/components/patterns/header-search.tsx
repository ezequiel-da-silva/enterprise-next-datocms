"use client";

import { Container } from "@/components/atoms/container";
import { HeaderSearchForm } from "@/components/patterns/header-search-form";
import type { AppLocale } from "@/constants/i18n";
import { cn } from "@/lib/cn";
import { useCallback, useEffect, useId, useRef, useState } from "react";

const TOGGLE_LABELS: Record<AppLocale, { open: string; close: string }> = {
  en: { open: "Open search", close: "Close search" },
  pt: { open: "Abrir busca", close: "Fechar busca" },
  es: { open: "Abrir búsqueda", close: "Cerrar búsqueda" },
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
 * search strip under `<header>`. Keyboard: ⌘K / Ctrl K (no visible kbd — no hydration mismatch).
 */
export function HeaderSearch({ action, locale, query, placeholder, submitLabel }: HeaderSearchProps) {
  const panelId = useId();
  const hasQuery = Boolean(query?.trim());
  const [open, setOpen] = useState(hasQuery);
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
          <Container size="lg" name="GlobalHeaderSearch" className="py-3">
            <HeaderSearchForm
              action={action}
              locale={locale}
              query={query}
              placeholder={placeholder}
              submitLabel={submitLabel}
            />
          </Container>
        </div>
      ) : null}
    </>
  );
}
