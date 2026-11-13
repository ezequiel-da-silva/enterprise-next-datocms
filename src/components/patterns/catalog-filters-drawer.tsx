"use client";

import {
  FacetPanel,
  type CatalogFacetOption,
  type CatalogStockOption,
} from "@/components/patterns/catalog-facet-panel";
import { useModalDialog } from "@/lib/a11y/use-modal-dialog";
import { useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

type CatalogFiltersDrawerProps = {
  filtersLabel: string;
  openFiltersLabel: string;
  closeFiltersLabel: string;
  terrainLabel: string;
  profileLabel: string;
  terrainOptions: readonly CatalogFacetOption[];
  profileOptions: readonly CatalogFacetOption[];
  stock: CatalogStockOption;
  /** Number of active facets (0–3) for the toolbar badge. */
  activeFacetCount: number;
};

export function CatalogFiltersDrawer({
  filtersLabel,
  openFiltersLabel,
  closeFiltersLabel,
  terrainLabel,
  profileLabel,
  terrainOptions,
  profileOptions,
  stock,
  activeFacetCount,
}: CatalogFiltersDrawerProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useModalDialog({
    open,
    panelRef,
    returnFocusRef: triggerRef,
    onClose: () => setOpen(false),
    closeOnMediaQuery: "(min-width: 1024px)",
  });

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="touch-target inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground hover:border-foreground/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        {openFiltersLabel}
        {activeFacetCount > 0 ? (
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-xs font-semibold text-background">
            {activeFacetCount}
          </span>
        ) : null}
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[70] lg:hidden" role="presentation">
              <button
                type="button"
                className="absolute inset-0 cursor-pointer bg-foreground/40 backdrop-blur-sm"
                aria-label={closeFiltersLabel}
                onClick={() => setOpen(false)}
              />
              <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                data-ui-section="CatalogFiltersDrawer"
                className="absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col border-l border-border bg-background shadow-xl"
              >
                <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
                  <h2 id={titleId} className="text-base font-semibold text-foreground">
                    {filtersLabel}
                  </h2>
                  <button
                    type="button"
                    className="touch-target cursor-pointer rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">{closeFiltersLabel}</span>
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </header>
                <div className="flex-1 overflow-y-auto px-4">
                  <FacetPanel
                    terrainLabel={terrainLabel}
                    profileLabel={profileLabel}
                    terrainOptions={terrainOptions}
                    profileOptions={profileOptions}
                    stock={stock}
                    onNavigate={() => setOpen(false)}
                  />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
