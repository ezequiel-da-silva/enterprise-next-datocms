"use client";

import { Container } from "@/components/atoms/container";
import type { ReactNode } from "react";

type ProductStickyBuyBarProps = {
  title: string;
  priceLabel: string;
  visible: boolean;
  children: ReactNode;
};

/**
 * Mobile-only fixed ATC strip. Parent drives `visible` via IntersectionObserver on the
 * primary buy control. Stays under drawers (`z-50`) at `z-40`.
 */
export function ProductStickyBuyBar({ title, priceLabel, visible, children }: ProductStickyBuyBarProps) {
  if (!visible) return null;

  return (
    <div
      data-ui-section="ProductStickyBuyBar"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <Container size="lg" className="flex items-center gap-3 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{priceLabel}</p>
        </div>
        <div className="shrink-0 [&_button]:min-h-12 [&_button]:touch-target [&_button]:w-auto [&_form]:space-y-0 [&_p]:hidden">
          {children}
        </div>
      </Container>
    </div>
  );
}
