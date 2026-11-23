"use client";

import { IconButton } from "@/components/atoms/icon-button";
import {
  AddToCartButton,
  type AddToCartAction,
  type AddToCartCopy,
} from "@/components/patterns/add-to-cart-button";
import type { AppLocale } from "@/constants/i18n";
import { useModalDialog } from "@/lib/a11y/use-modal-dialog";
import { cn } from "@/lib/cn";
import type { QuickAddCopy } from "@/lib/i18n/quick-add-copy";
import {
  findVariantForOption,
  isOptionValueAvailable,
  resolveQuickAddOptionName,
  uniqueOptionValues,
  type QuickAddVariant,
} from "@/lib/shopify/quick-add-variants";
import { useCallback, useId, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";

export type CatalogProductQuickAddProps = {
  locale: AppLocale;
  handle: string;
  title: string;
  action: AddToCartAction;
  cartHref: string;
  cartCopy: AddToCartCopy;
  labels: QuickAddCopy;
};

type QuickAddPayload = {
  handle: string;
  title: string;
  availableForSale: boolean;
  variants: QuickAddVariant[];
};

export function CatalogProductQuickAdd({
  locale,
  handle,
  title,
  action,
  cartHref,
  cartCopy,
  labels,
}: CatalogProductQuickAddProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<QuickAddPayload | null>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const desktopTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useModalDialog({
    open,
    panelRef,
    returnFocusRef,
    onClose: () => setOpen(false),
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPayload(null);
    setSelectedValue(null);
    try {
      const params = new URLSearchParams({ locale, handle });
      const res = await fetch(`/api/catalog/product-for-quick-add?${params.toString()}`);
      if (!res.ok) {
        setError(labels.error);
        return;
      }
      const json = (await res.json()) as QuickAddPayload;
      setPayload(json);
      const optionName = resolveQuickAddOptionName(json.variants);
      if (json.variants.length === 1) {
        setSelectedValue(json.variants[0]?.selectedOptions[0]?.value ?? "__single");
      } else if (optionName) {
        const firstAvailable = uniqueOptionValues(json.variants, optionName).find((value) =>
          isOptionValueAvailable(json.variants, optionName, value),
        );
        setSelectedValue(firstAvailable ?? null);
      }
    } catch {
      setError(labels.error);
    } finally {
      setLoading(false);
    }
  }, [handle, labels.error, locale]);

  function openFrom(event: MouseEvent<HTMLButtonElement>, trigger: HTMLButtonElement | null) {
    event.preventDefault();
    event.stopPropagation();
    returnFocusRef.current = trigger;
    setOpen(true);
    void load();
  }

  const optionName = payload ? resolveQuickAddOptionName(payload.variants) : null;
  const values = payload && optionName ? uniqueOptionValues(payload.variants, optionName) : [];
  const singleVariant = payload?.variants.length === 1 ? payload.variants[0] : null;
  const selectedVariant =
    singleVariant ??
    (payload && optionName && selectedValue
      ? findVariantForOption(payload.variants, optionName, selectedValue)
      : null);

  return (
    <>
      <button
        ref={desktopTriggerRef}
        type="button"
        className={cn(
          "pointer-events-none absolute inset-x-3 bottom-3 z-20 hidden touch-target items-center justify-center rounded-lg",
          "border border-border bg-background/95 px-3 text-sm font-semibold text-foreground opacity-0 shadow-sm",
          "transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "motion-safe:[@media(hover:hover)_and_(pointer:fine)]:pointer-events-auto",
          "motion-safe:[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100",
          "motion-safe:[@media(hover:hover)_and_(pointer:fine)]:group-focus-within:opacity-100",
        )}
        onClick={(event) => openFrom(event, desktopTriggerRef.current)}
      >
        {labels.add}
      </button>
      <IconButton
        ref={mobileTriggerRef}
        type="button"
        className="absolute bottom-3 right-3 z-20 border-border/80 bg-background/95 shadow-sm [@media(hover:hover)_and_(pointer:fine)]:hidden"
        aria-label={labels.addAria}
        onClick={(event) => openFrom(event, mobileTriggerRef.current)}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M12 5v14M5 12h14" />
        </svg>
      </IconButton>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[70]" role="presentation">
              <button
                type="button"
                className="absolute inset-0 cursor-pointer bg-foreground/40 backdrop-blur-sm"
                aria-label={labels.close}
                onClick={() => setOpen(false)}
              />
              <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                data-ui-section="QuickAddDrawer"
                className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl border border-border bg-background shadow-xl sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-0 sm:h-full sm:max-h-none sm:w-[min(100%,24rem)] sm:rounded-none sm:border-l sm:border-t-0"
              >
                <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
                  <div className="min-w-0">
                    <h2 id={titleId} className="truncate text-base font-semibold text-foreground">
                      {labels.chooseSize}
                    </h2>
                    <p className="truncate text-sm text-muted-foreground">{title}</p>
                  </div>
                  <button
                    type="button"
                    className="touch-target cursor-pointer rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">{labels.close}</span>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </header>

                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
                  {loading ? <p className="text-sm text-muted-foreground">{labels.loading}</p> : null}
                  {error ? (
                    <p className="text-sm text-destructive" role="alert">
                      {error}
                    </p>
                  ) : null}

                  {!loading && !error && payload && values.length > 1 && optionName ? (
                    <div role="radiogroup" aria-label={optionName || labels.sizeLabel} className="space-y-3">
                      <p className="text-sm font-medium text-foreground">{optionName || labels.sizeLabel}</p>
                      <div className="flex flex-wrap gap-2">
                        {values.map((value) => {
                          const available = isOptionValueAvailable(payload.variants, optionName, value);
                          const checked = selectedValue === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              role="radio"
                              aria-checked={checked}
                              disabled={!available}
                              onClick={() => setSelectedValue(value)}
                              className={cn(
                                "touch-target-text cursor-pointer rounded-lg border px-3 text-sm font-medium transition",
                                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                                checked
                                  ? "border-foreground bg-foreground text-background"
                                  : "border-border bg-background text-foreground hover:border-foreground/40",
                                !available && "cursor-not-allowed opacity-40",
                              )}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {!loading && !error && selectedVariant ? (
                    <AddToCartButton
                      action={action}
                      variantId={selectedVariant.id}
                      available={selectedVariant.availableForSale}
                      locale={locale}
                      cartHref={cartHref}
                      copy={cartCopy}
                      currency={selectedVariant.price.currencyCode}
                      item={{
                        item_id: handle,
                        item_name: title,
                        price: Number(selectedVariant.price.amount) || 0,
                        quantity: 1,
                        item_variant: selectedVariant.selectedOptions.map((o) => o.value).join(" / ") || undefined,
                      }}
                    />
                  ) : null}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
