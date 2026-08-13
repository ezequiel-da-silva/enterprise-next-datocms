"use client";

import type { NavItemRecord } from "@/infra/datocms/types-navigation";
import type { AppLocale } from "@/constants/i18n";
import { navLinkAriaProps } from "@/lib/a11y/nav-link";
import { isExternalHref, localizeInternalHref } from "@/lib/i18n/nav-href";
import { homeBreadcrumbLabel, homeBreadcrumbPath } from "@/lib/seo/breadcrumb-labels";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";

function resolveHref(raw: string, locale: AppLocale): string {
  const t = raw.trim();
  if (!t) return "/";
  if (isExternalHref(t)) return t;
  return localizeInternalHref(t, locale);
}

function NavLink({
  item,
  locale,
  className,
}: {
  item: NavItemRecord;
  locale: AppLocale;
  className?: string;
}) {
  const href = resolveHref(item.navItemLink, locale);
  const external = isExternalHref(href);
  const label = item.navItemLabel;
  const aria = navLinkAriaProps(locale, label, {
    customAria: item.navItemLinkAria,
    external,
    newTab: item.openInNewTab,
  });
  const common = cn(
    "touch-target-text rounded-md text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    className,
  );
  if (external) {
    return (
      <a
        href={href}
        className={common}
        {...aria}
        {...(item.openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={common} {...aria}>
      {label}
    </Link>
  );
}

function submenuToggleLabel(locale: AppLocale, label: string): string {
  if (locale === "pt") return `Submenu de ${label}`;
  if (locale === "es") return `Submenú de ${label}`;
  return `${label} submenu`;
}

function mobileMenuLabels(locale: AppLocale): {
  open: string;
  close: string;
  title: string;
  dismiss: string;
} {
  if (locale === "pt") {
    return { open: "Abrir menu", close: "Fechar menu", title: "Menu", dismiss: "Fechar" };
  }
  if (locale === "es") {
    return { open: "Abrir menú", close: "Cerrar menú", title: "Menú", dismiss: "Cerrar" };
  }
  return { open: "Open menu", close: "Close menu", title: "Menu", dismiss: "Close" };
}

function DesktopMenuBranch({ item, locale, level }: { item: NavItemRecord; locale: AppLocale; level: number }) {
  const children = item.submenu?.filter(Boolean) ?? [];
  const menuId = useId();
  const [open, setOpen] = useState(false);

  if (children.length === 0) {
    return <NavLink item={item} locale={locale} className={cn(level > 0 && "block w-full text-left")} />;
  }

  const label = item.navItemLabel;

  return (
    <div
      className={cn("relative", level === 0 && "inline-flex items-stretch")}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <div
        className={cn(
          "flex items-center gap-2 rounded-md text-sm font-medium text-muted-foreground",
          level > 0 && "w-full justify-between",
        )}
      >
        <NavLink
          item={item}
          locale={locale}
          className={level > 0 ? "min-h-11 min-w-0 flex-1 bg-transparent px-2 hover:bg-transparent" : undefined}
        />
        <button
          type="button"
          className="touch-target rounded-md hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={menuId}
          aria-label={submenuToggleLabel(locale, label)}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="text-[10px] opacity-70" aria-hidden>
            {level === 0 ? "▾" : "›"}
          </span>
        </button>
      </div>
      {open ? (
        <div className={cn("absolute z-[60]", level === 0 ? "left-0 top-full pt-1.5" : "left-full top-0 ml-1 pt-0")}>
          <ul
            id={menuId}
            role="menu"
            className="min-w-[12rem] rounded-lg border border-border bg-background p-1 shadow-lg ring-1 ring-border/50"
          >
            {children.map((child) => (
              <li key={child.id} className="relative py-0.5" role="none">
                <DesktopMenuBranch item={child} locale={locale} level={level + 1} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function MobileNavList({ items, locale, depth }: { items: NavItemRecord[]; locale: AppLocale; depth: number }) {
  return (
    <ul className={cn("space-y-0.5", depth > 0 && "mt-1 border-l border-border pl-3")}>
      {items.map((item) => {
        const children = item.submenu?.filter(Boolean) ?? [];
        return (
          <li key={item.id}>
            <NavLink item={item} locale={locale} className="block" />
            {children.length > 0 ? <MobileNavList items={children} locale={locale} depth={depth + 1} /> : null}
          </li>
        );
      })}
    </ul>
  );
}

type HeaderNavProps = {
  menuLinks: NavItemRecord[];
  locale: AppLocale;
  themeToggle: ReactNode;
};

export function HeaderNav({ menuLinks, locale, themeToggle }: HeaderNavProps) {
  const panelId = useId();
  const dialogTitleId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const labels = mobileMenuLabels(locale);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  // `lg:hidden` esconde o painel no desktop; sem isto o `inert` e o scroll lock ficavam presos.
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) close();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [open, close]);

  useEffect(() => {
    const main = document.getElementById("conteudo-principal");
    const footer = document.querySelector("footer");
    if (open) {
      main?.setAttribute("inert", "");
      footer?.setAttribute("inert", "");
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => {
        const first = panelRef.current?.querySelector<HTMLElement>("button, a[href]");
        first?.focus();
      });
    } else {
      main?.removeAttribute("inert");
      footer?.removeAttribute("inert");
      document.body.style.overflow = "";
    }
    return () => {
      main?.removeAttribute("inert");
      footer?.removeAttribute("inert");
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open || !panelRef.current) return;
    const panel = panelRef.current;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    panel.addEventListener("keydown", onKeyDown);
    return () => panel.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const handleClose = useCallback(() => {
    close();
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, [close]);

  return (
    <>
      <div className="hidden min-w-0 flex-1 items-center justify-end gap-3 lg:flex">
        <nav aria-label="Principal" className="min-w-0">
          <ul className="flex max-w-full flex-wrap items-center justify-end gap-2">
            {menuLinks.map((item) => (
              <li key={item.id} className="relative max-w-full shrink-0">
                <DesktopMenuBranch item={item} locale={locale} level={0} />
              </li>
            ))}
          </ul>
        </nav>
        {themeToggle}
      </div>

      <div className="flex shrink-0 items-center gap-2 lg:hidden">
        {/* Enquanto o painel está aberto o toggle vive lá dentro — evita duplicar o switch na árvore de acessibilidade. */}
        {open ? null : themeToggle}
        <button
          ref={menuButtonRef}
          type="button"
          className="touch-target cursor-pointer rounded-md border border-border bg-background text-foreground shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? labels.close : labels.open}</span>
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            {open ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/*
        Portal para o `body`: o `<header>` aplica `backdrop-filter`, que cria um containing
        block e prendia este `fixed inset-0` à altura do header (~56px), esmagando o painel
        e deixando o backdrop invisível por cima do logo e do theme toggle.
      */}
      {/* `open` só fica true depois de um clique no cliente, por isso `document` existe sempre aqui. */}
      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[60] lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby={dialogTitleId}
            >
              <button
                type="button"
                className="absolute inset-0 cursor-pointer bg-foreground/40 backdrop-blur-sm"
                aria-label={labels.dismiss}
                onClick={handleClose}
              />
              <div
                ref={panelRef}
                id={panelId}
                className="absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col border-l border-border bg-background shadow-xl"
              >
                <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
                  <span id={dialogTitleId} className="text-sm font-semibold text-foreground">
                    {labels.title}
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    {themeToggle}
                    <button
                      type="button"
                      className="touch-target cursor-pointer rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      onClick={handleClose}
                    >
                      <span className="sr-only">{labels.dismiss}</span>
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <nav
                  className="flex-1 overflow-y-auto px-4 py-4"
                  aria-label="Principal móvel"
                  onClick={(e) => {
                    if (e.target instanceof HTMLAnchorElement) handleClose();
                  }}
                >
                  <Link
                    href={homeBreadcrumbPath(locale)}
                    className="touch-target-text mb-2 block rounded-md text-sm font-medium text-foreground transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {homeBreadcrumbLabel(locale)}
                  </Link>
                  <MobileNavList items={menuLinks} locale={locale} depth={0} />
                </nav>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
