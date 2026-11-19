"use client";

import type { NavItemRecord } from "@/infra/datocms/types-navigation";
import type { AppLocale } from "@/constants/i18n";
import { navLinkAriaProps } from "@/lib/a11y/nav-link";
import { isSafeExternalHref } from "@/lib/datocms/link-block";
import { isExternalHref, localizeInternalHref } from "@/lib/i18n/nav-href";
import { prioritizeCommerceNavLinks } from "@/lib/i18n/prioritize-commerce-nav";
import { homeBreadcrumbLabel, homeBreadcrumbPath } from "@/lib/seo/breadcrumb-labels";
import { useModalDialog } from "@/lib/a11y/use-modal-dialog";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useCallback, useId, useMemo, useRef, useState, type ReactNode } from "react";

function normalizePath(path: string | null | undefined): string {
  const trimmed = (path ?? "").trim().replace(/\/+$/, "");
  return trimmed || "/";
}

function isCurrentPath(pathname: string | null | undefined, href: string | null | undefined): boolean {
  if (!href || isExternalHref(href)) return false;
  const current = normalizePath(pathname);
  const target = normalizePath(href);
  if (target === "/") return current === "/" || Boolean(pathname && /^\/[a-z]{2}$/.test(current));
  return current === target || current.startsWith(`${target}/`);
}

function resolveHref(raw: string | null | undefined, locale: AppLocale): string | null {
  const t = (raw ?? "").trim();
  if (!t) return "/";
  if (isExternalHref(t)) {
    return isSafeExternalHref(t) ? t : null;
  }
  return localizeInternalHref(t, locale);
}

function NavLink({
  item,
  locale,
  className,
  current = false,
}: {
  item: NavItemRecord;
  locale: AppLocale;
  className?: string;
  current?: boolean;
}) {
  const href = resolveHref(item.navItemLink, locale);
  if (!href) return null;
  const external = isExternalHref(href);
  const label = item.navItemLabel;
  const aria = navLinkAriaProps(locale, label, {
    customAria: item.navItemLinkAria,
    external,
    newTab: item.openInNewTab,
  });
  const common = cn(
    "touch-target-text rounded-md text-sm font-medium transition hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    current
      ? "text-foreground underline decoration-foreground/40 underline-offset-4"
      : "text-muted-foreground",
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
    <Link href={href} className={common} {...aria} {...(current ? { "aria-current": "page" as const } : {})}>
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

/** Só ponteiro (`lg:`): 8px de folga do link chega, não precisa do alvo de 48px do toque. */
function SubmenuChevron({ horizontal, open }: { horizontal: boolean; open: boolean }) {
  return (
    <svg
      className={cn(
        "h-4 w-4 transition-transform motion-reduce:transition-none",
        !horizontal && open && "rotate-180",
      )}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={horizontal ? "m9 6 6 6-6 6" : "m6 9 6 6 6-6"} />
    </svg>
  );
}

function DesktopMenuBranch({
  item,
  locale,
  level,
  pathname,
}: {
  item: NavItemRecord;
  locale: AppLocale;
  level: number;
  pathname: string;
}) {
  const children = item.submenu?.filter(Boolean) ?? [];
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const href = resolveHref(item.navItemLink, locale);
  const current = Boolean(href && isCurrentPath(pathname, href));

  if (children.length === 0) {
    return (
      <NavLink
        item={item}
        locale={locale}
        current={current}
        className={cn(level > 0 && "w-full items-center justify-start text-left")}
      />
    );
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
          "flex items-center rounded-md text-sm font-medium text-muted-foreground",
          level === 0
            ? "transition hover:bg-muted hover:text-foreground motion-reduce:transition-none"
            : "w-full justify-between gap-2",
        )}
      >
        <NavLink
          item={item}
          locale={locale}
          current={current}
          className={
            level > 0
              ? "min-h-11 min-w-0 flex-1 items-center justify-start bg-transparent px-2 text-left hover:bg-transparent"
              : "pr-1 hover:bg-transparent hover:text-inherit"
          }
        />
        <button
          type="button"
          className={cn(
            "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            level === 0 ? "-ml-1 w-6 hover:text-inherit" : "hover:bg-muted hover:text-foreground",
          )}
          aria-expanded={open}
          aria-haspopup="true"
          aria-controls={menuId}
          aria-label={submenuToggleLabel(locale, label)}
          onClick={() => setOpen((v) => !v)}
        >
          <SubmenuChevron horizontal={level > 0} open={open} />
        </button>
      </div>
      {open ? (
        <div className={cn("absolute z-[60]", level === 0 ? "left-0 top-full pt-1.5" : "left-full top-0 ml-1 pt-0")}>
          <ul
            id={menuId}
            className="min-w-[12rem] rounded-lg border border-border bg-background p-1 shadow-lg ring-1 ring-border/50"
          >
            {children.map((child) => (
              <li key={child.id} className="relative py-0.5">
                <DesktopMenuBranch item={child} locale={locale} level={level + 1} pathname={pathname} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function MobileNavList({
  items,
  locale,
  depth,
  pathname,
}: {
  items: NavItemRecord[];
  locale: AppLocale;
  depth: number;
  pathname: string;
}) {
  return (
    <ul className={cn("space-y-0.5", depth > 0 && "mt-0.5 pl-4")}>
      {items.map((item) => {
        const children = item.submenu?.filter(Boolean) ?? [];
        const href = resolveHref(item.navItemLink, locale);
        const current = Boolean(href && isCurrentPath(pathname, href));
        return (
          <li key={item.id}>
            <NavLink
              item={item}
              locale={locale}
              current={current}
              className="w-full items-center justify-start text-left"
            />
            {children.length > 0 ? (
              <MobileNavList items={children} locale={locale} depth={depth + 1} pathname={pathname} />
            ) : null}
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
  /** Lupa + painel de busca; o painel posiciona-se sobre o `<header>`. */
  searchToggle: ReactNode;
  /** Formulário já aberto no drawer: no móvel a lupa sairia do ecrã com o painel. */
  searchBlock: ReactNode;
  /** Compact locale control for the desktop chrome. */
  localeSwitcher: ReactNode;
  /** Compact locale control for the mobile drawer footer (separate instance). */
  localeSwitcherDrawer: ReactNode;
  /** Link de conta em largura total no drawer móvel. */
  accountBlock?: ReactNode;
};

export function HeaderNav({
  menuLinks,
  locale,
  themeToggle,
  searchToggle,
  searchBlock,
  localeSwitcher,
  localeSwitcherDrawer,
  accountBlock,
}: HeaderNavProps) {
  const panelId = useId();
  const dialogTitleId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? `/${locale}`;
  const orderedLinks = useMemo(() => prioritizeCommerceNavLinks(menuLinks), [menuLinks]);
  const close = useCallback(() => setOpen(false), []);
  const labels = mobileMenuLabels(locale);

  const handleClose = useCallback(() => {
    close();
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, [close]);

  useModalDialog({
    open,
    panelRef,
    returnFocusRef: menuButtonRef,
    onClose: handleClose,
    closeOnMediaQuery: "(min-width: 1024px)",
  });

  return (
    <>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 lg:gap-3">
        <nav aria-label="Principal" className="hidden min-w-0 flex-1 lg:block">
          <ul className="flex max-w-full flex-wrap items-center justify-start gap-1 xl:gap-2">
            {orderedLinks.map((item) => (
              <li key={item.id} className="relative max-w-full shrink-0">
                <DesktopMenuBranch item={item} locale={locale} level={0} pathname={pathname} />
              </li>
            ))}
          </ul>
        </nav>
        {/* Desktop: busca/idioma/tema na barra; mobile: só no drawer. */}
        {searchToggle ? <div className="hidden shrink-0 lg:contents">{searchToggle}</div> : null}
        {localeSwitcher ? <div className="hidden shrink-0 lg:contents">{localeSwitcher}</div> : null}
        {themeToggle ? <div className="hidden shrink-0 lg:contents">{themeToggle}</div> : null}
        <button
          ref={menuButtonRef}
          type="button"
          className="touch-target cursor-pointer rounded-md border-transparent bg-transparent text-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden"
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
                <div
                  className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4"
                  onClick={(e) => {
                    if (e.target instanceof HTMLAnchorElement) handleClose();
                  }}
                >
                  {searchBlock ? (
                    <div className="mb-4 min-w-0 border-b border-border pb-4">{searchBlock}</div>
                  ) : null}
                  {/* Landmarks planos: o seletor de idioma é irmão da navegação, não filho. */}
                  <nav aria-label="Principal móvel">
                    <Link
                      href={homeBreadcrumbPath(locale)}
                      className="touch-target-text mb-2 block rounded-md text-sm font-medium text-foreground transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {homeBreadcrumbLabel(locale)}
                    </Link>
                    <MobileNavList items={orderedLinks} locale={locale} depth={0} pathname={pathname} />
                  </nav>
                  {accountBlock ? (
                    <div className="mt-4 border-t border-border pt-4">{accountBlock}</div>
                  ) : null}
                </div>
                {/* Outside scroll: drop-up locale menu must not expand scrollHeight or get clipped. */}
                <div className="flex shrink-0 items-center gap-2 border-t border-border px-4 py-3">
                  <div className="relative z-10 min-w-0 flex-1">{localeSwitcherDrawer}</div>
                  <div className="shrink-0 [&_button]:size-11 [&_button]:w-11">{themeToggle}</div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
