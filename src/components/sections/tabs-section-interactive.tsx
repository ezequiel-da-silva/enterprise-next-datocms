"use client";

import { Button } from "@/components/atoms/button";
import { DatoResponsivePicture } from "@/components/patterns/dato-responsive-picture";
import { SmartLink, type SmartLinkBlockRecord } from "@/components/patterns/smart-link";
import type { AppLocale } from "@/constants/i18n";
import type { FileFieldLike } from "@/infra/datocms/types-page";
import { cn } from "@/lib/cn";
import { useCallback, useId, useState, type KeyboardEvent } from "react";

export type TabsSectionImage = {
  asset: NonNullable<FileFieldLike>;
  assetDesktop?: FileFieldLike;
};

export type ParsedTab = {
  id: string;
  labelTab: string;
  title: string;
  description: string;
  cta: SmartLinkBlockRecord | null;
  image: TabsSectionImage | null;
};

type TabsSectionInteractiveProps = {
  sectionId: string;
  tabs: ParsedTab[];
  locale: AppLocale;
  /** Nome visível da secção (`h2`) — evita `aria-label` duplicado. */
  tablistLabelledBy?: string;
  /** Fallback só quando não há título visível. */
  tablistLabel?: string;
};

const IMAGE_SIZES =
  "(max-width: 1023px) calc(100vw - 2rem), calc((min(100vw - 2rem, 72rem) - 2rem) / 2)";

export function TabsSectionInteractive({
  sectionId,
  tabs,
  locale,
  tablistLabelledBy,
  tablistLabel,
}: TabsSectionInteractiveProps) {
  const reactId = useId().replace(/:/g, "");
  const prefix = `tabs-${sectionId}-${reactId}`;
  const [selectedId, setSelectedId] = useState(tabs[0]!.id);

  const selectedIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === selectedId),
  );

  const focusTab = useCallback(
    (index: number) => {
      const tab = tabs[index];
      if (!tab) return;
      setSelectedId(tab.id);
      document.getElementById(`${prefix}-tab-${tab.id}`)?.focus();
    },
    [prefix, tabs],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      const last = tabs.length - 1;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        focusTab((selectedIndex + 1) % tabs.length);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        focusTab((selectedIndex - 1 + tabs.length) % tabs.length);
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        focusTab(0);
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        focusTab(last);
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        document.getElementById(`${prefix}-panel-${tabs[selectedIndex]!.id}`)?.focus();
      }
    },
    [focusTab, prefix, selectedIndex, tabs],
  );

  return (
    <div className="flex flex-col gap-8">
      <div
        role="tablist"
        aria-orientation="horizontal"
        {...(tablistLabelledBy ? { "aria-labelledby": tablistLabelledBy } : { "aria-label": tablistLabel })}
        className="flex gap-2 overflow-x-auto border-b border-border"
      >
        {tabs.map((tab) => {
          const isSelected = tab.id === selectedId;
          const tabId = `${prefix}-tab-${tab.id}`;
          const panelId = `${prefix}-panel-${tab.id}`;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={tabId}
              aria-selected={isSelected}
              aria-controls={panelId}
              tabIndex={isSelected ? 0 : -1}
              className={cn(
                "touch-target-text shrink-0 cursor-pointer rounded-t-md border-b-2 px-3 text-sm font-medium whitespace-nowrap",
                "transition-colors motion-reduce:transition-none",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                isSelected
                  ? "border-primary bg-muted/40 text-foreground"
                  : "border-transparent text-muted-foreground hover:border-muted-foreground/50 hover:bg-muted/50 hover:text-foreground",
              )}
              onClick={() => setSelectedId(tab.id)}
              onKeyDown={onKeyDown}
            >
              {tab.labelTab}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => {
        const isSelected = tab.id === selectedId;
        const hasImage = Boolean(tab.image?.asset.url);
        return (
          <div
            key={tab.id}
            role="tabpanel"
            id={`${prefix}-panel-${tab.id}`}
            hidden={!isSelected}
            tabIndex={isSelected ? 0 : undefined}
            aria-labelledby={`${prefix}-tab-${tab.id}`}
            onKeyDown={(event) => {
              if (event.key !== "ArrowUp") return;
              event.preventDefault();
              document.getElementById(`${prefix}-tab-${tab.id}`)?.focus();
            }}
            className={cn(
              "grid gap-8 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              isSelected && "tabs-panel-fade motion-reduce:animate-none",
              hasImage ? "lg:grid-cols-2 lg:items-center" : "grid-cols-1",
            )}
          >
            <div className="min-w-0">
              <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{tab.title}</h3>
              {tab.description ? (
                <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                  {tab.description}
                </p>
              ) : null}
              {tab.cta ? (
                <div className="mt-6">
                  <Button asChild variant="primary" className="min-h-12">
                    <SmartLink record={tab.cta} locale={locale} tone="inherit" />
                  </Button>
                </div>
              ) : null}
            </div>
            {isSelected && tab.image?.asset ? (
              <figure className="min-w-0 overflow-hidden rounded-2xl border border-border bg-muted/30">
                <DatoResponsivePicture
                  mobile={tab.image.asset}
                  desktop={tab.image.assetDesktop}
                  fallbackAlt={tab.title}
                  decoding="async"
                  className="h-auto w-full object-cover"
                  sizes={IMAGE_SIZES}
                />
              </figure>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
