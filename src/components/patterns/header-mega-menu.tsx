"use client";

import type { AppLocale } from "@/constants/i18n";
import type {
  NavMegaMenuCampaignRecord,
  NavMegaMenuCategoryRecord,
  NavMegaMenuLinkRecord,
  NavigationMegaMenuRecord,
} from "@/infra/datocms/types-navigation";
import { resolveLinkBlock } from "@/lib/datocms/link-block";
import { cn } from "@/lib/cn";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

function ResolvedMegaLink({
  record,
  locale,
  className,
  onNavigate,
}: {
  record: NavMegaMenuLinkRecord;
  locale: AppLocale;
  className?: string;
  onNavigate?: () => void;
}) {
  const resolved = resolveLinkBlock(record, locale);
  if (!resolved) return null;
  const label = resolved.label?.trim() || resolved.ariaLabel?.trim() || resolved.href;
  const common = cn(
    "touch-target-text block rounded-md text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    className,
  );
  if (resolved.kind === "external") {
    return (
      <a
        href={resolved.href}
        className={common}
        {...(resolved.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        onClick={onNavigate}
      >
        {label}
      </a>
    );
  }
  return (
    <Link href={resolved.href} className={common} onClick={onNavigate}>
      {label}
    </Link>
  );
}

function CampaignColumn({
  campaign,
  locale,
  onNavigate,
}: {
  campaign: NavMegaMenuCampaignRecord;
  locale: AppLocale;
  onNavigate?: () => void;
}) {
  const cta = campaign.cta[0] ?? null;
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-muted/40 p-3">
      {campaign.image?.url ? (
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-muted">
          <Image
            src={campaign.image.url}
            alt={campaign.image.alt?.trim() || campaign.title?.trim() || ""}
            width={campaign.image.width ?? 400}
            height={campaign.image.height ?? 500}
            sizes="240px"
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
      {campaign.title?.trim() ? (
        <p className="text-sm font-semibold text-foreground">{campaign.title.trim()}</p>
      ) : null}
      {campaign.description?.trim() ? (
        <p className="text-xs text-muted-foreground">{campaign.description.trim()}</p>
      ) : null}
      {cta ? (
        <ResolvedMegaLink
          record={cta}
          locale={locale}
          className="inline-flex w-fit bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:bg-foreground/90 hover:text-background"
          onNavigate={onNavigate}
        />
      ) : null}
    </div>
  );
}

function CategoryColumn({
  category,
  locale,
  onNavigate,
}: {
  category: NavMegaMenuCategoryRecord;
  locale: AppLocale;
  onNavigate?: () => void;
}) {
  return (
    <div className="min-w-0 space-y-2">
      {category.title?.trim() ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
          {category.title.trim()}
        </p>
      ) : null}
      <ul className="m-0 space-y-0.5 p-0">
        {category.links.map((link) => (
          <li key={link.id} className="list-none">
            <ResolvedMegaLink record={link} locale={locale} className="px-2 py-1.5" onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    </div>
  );
}

type DesktopMegaMenuProps = {
  item: NavigationMegaMenuRecord;
  locale: AppLocale;
};

export function DesktopMegaMenu({ item, locale }: DesktopMegaMenuProps) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [hoverOpen, setHoverOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hoverOpen || pinned;
  const label = item.label?.trim() || "Menu";
  const campaign = item.campaign[0] ?? null;
  const categories = item.categories.filter(Boolean);

  useEffect(() => {
    if (!pinned) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPinned(false);
        setHoverOpen(false);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target || rootRef.current?.contains(target)) return;
      setPinned(false);
      setHoverOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [pinned]);

  return (
    <div
      ref={rootRef}
      className="relative inline-flex items-stretch"
      onMouseEnter={() => setHoverOpen(true)}
      onMouseLeave={() => setHoverOpen(false)}
      onFocusCapture={() => setHoverOpen(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHoverOpen(false);
      }}
    >
      <button
        type="button"
        className="touch-target-text inline-flex cursor-pointer items-center gap-1 rounded-md px-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        onClick={(event) => {
          event.preventDefault();
          setPinned((value) => !value);
        }}
      >
        {label}
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-[60] pt-1.5">
          <div
            id={menuId}
            className={cn(
              "rounded-xl border border-border bg-background p-4 shadow-lg ring-1 ring-border/50",
              campaign ? "grid w-[min(90vw,48rem)] gap-6 sm:grid-cols-[1fr_12rem]" : "w-[min(90vw,36rem)]",
            )}
          >
            <div
              className={cn(
                "grid gap-6",
                categories.length >= 3 ? "sm:grid-cols-3" : categories.length === 2 ? "sm:grid-cols-2" : "grid-cols-1",
              )}
            >
              {categories.map((category) => (
                <CategoryColumn key={category.id} category={category} locale={locale} />
              ))}
            </div>
            {campaign ? <CampaignColumn campaign={campaign} locale={locale} /> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

type MobileMegaMenuProps = {
  item: NavigationMegaMenuRecord;
  locale: AppLocale;
  onNavigate?: () => void;
};

export function MobileMegaMenu({ item, locale, onNavigate }: MobileMegaMenuProps) {
  const [open, setOpen] = useState(false);
  const label = item.label?.trim() || "Menu";
  const campaign = item.campaign[0] ?? null;
  const panelId = useId();

  return (
    <div>
      <button
        type="button"
        className="touch-target-text flex w-full cursor-pointer items-center justify-between rounded-md text-left text-sm font-medium text-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <svg
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open ? (
        <div id={panelId} className="mt-2 space-y-4 border-l border-border pl-3">
          {item.categories.map((category) => (
            <CategoryColumn
              key={category.id}
              category={category}
              locale={locale}
              onNavigate={onNavigate}
            />
          ))}
          {campaign ? (
            <CampaignColumn campaign={campaign} locale={locale} onNavigate={onNavigate} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
