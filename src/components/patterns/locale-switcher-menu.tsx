"use client";

import type { AppLocale } from "@/constants/i18n";
import { cn } from "@/lib/cn";
import { useCallback, useEffect, useId, useRef, useState } from "react";

export type LocaleOption = {
  code: AppLocale;
  href: string;
  /** Nome no próprio idioma — bandeiras representam países, não idiomas. */
  nativeName: string;
  /** BCP 47 para `lang` (pronúncia no leitor de ecrã). */
  bcp47: string;
  shortCode: string;
};

function GlobeIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 3.75 5.7 3.75 9S14.5 18.3 12 21c-2.5-2.7-3.75-5.7-3.75-9S9.5 5.7 12 3z" />
    </svg>
  );
}

type LocaleSwitcherMenuProps = {
  current: LocaleOption;
  /** Apenas os outros idiomas — o ativo vive no botão. */
  options: LocaleOption[];
  variant: "compact" | "block";
  triggerAriaLabel: string;
};

export function LocaleSwitcherMenu({
  current,
  options,
  variant,
  triggerAriaLabel,
}: LocaleSwitcherMenuProps) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }, []);

  const focusFirstLink = useCallback(() => {
    requestAnimationFrame(() => {
      containerRef.current?.querySelector<HTMLAnchorElement>("ul a[href]")?.focus();
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node | null)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const block = variant === "block";

  return (
    <div
      ref={containerRef}
      className={cn("relative", block ? "w-full" : "shrink-0")}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          close(true);
          return;
        }
        if (event.key === "ArrowDown") {
          event.preventDefault();
          if (!open) setOpen(true);
          focusFirstLink();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={triggerAriaLabel}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          /* Largura reservada: o rótulo não muda de tamanho ao hidratar nem ao trocar de idioma (sem CLS). */
          "touch-target cursor-pointer gap-2 rounded-md px-3 text-sm font-medium text-foreground transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          block
            ? "w-full justify-between border border-border bg-background"
            : "min-w-[5.5rem] justify-center border border-transparent",
        )}
      >
        <span className="inline-flex items-center gap-2">
          <GlobeIcon />
          <span className="w-6 text-left tabular-nums">{current.shortCode}</span>
        </span>
        <svg
          className={cn("h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none", open && "rotate-180")}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/*
        Links reais no HTML para crawlers; `hidden` tira-os da árvore a11y e do foco quando fechado.
        O hreflang canónico vive no `<head>` (`alternates.languages`) — não no `<a>`.
        `<a>` em vez de `Link`: o layout raiz lê o locale de `headers()` e não volta a
        renderizar numa navegação suave, o que deixaria `html lang`, o menu do Dato e o
        próprio seletor no idioma anterior.
      */}
      <ul
        id={listId}
        hidden={!open}
        className={cn(
          "absolute right-0 z-50 mt-1 min-w-[12rem] overflow-hidden rounded-lg border border-border bg-background py-1 shadow-lg",
          block ? "left-0 w-full" : "",
        )}
      >
        {options.map((option) => (
          <li key={option.code}>
            <a
              href={option.href}
              lang={option.bcp47}
              onClick={() => close()}
              className="touch-target-text w-full justify-start rounded-none text-sm text-foreground transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            >
              {option.nativeName}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
