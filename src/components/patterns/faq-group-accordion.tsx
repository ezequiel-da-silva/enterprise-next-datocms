"use client";

import type { FaqGroupItem, FaqGroupOptions } from "@/lib/datocms/resolve-faq-group-options";
import { cn } from "@/lib/cn";
import { useCallback, useId, useState, type KeyboardEvent } from "react";

type FaqGroupAccordionProps = {
  groupId: string;
  items: FaqGroupItem[];
  options: FaqGroupOptions;
};

function initialOpenIds(
  items: FaqGroupItem[],
  openFirstItem: boolean,
): Set<string> {
  if (!openFirstItem || items.length === 0) return new Set();
  return new Set([items[0]!.id]);
}

export function FaqGroupAccordion({ groupId, items, options }: FaqGroupAccordionProps) {
  const reactId = useId();
  const prefix = `faq-${groupId}-${reactId.replace(/:/g, "")}`;

  const [openIds, setOpenIds] = useState<Set<string>>(() => initialOpenIds(items, options.openFirstItem));

  const toggle = useCallback(
    (id: string) => {
      setOpenIds((prev) => {
        const isOpen = prev.has(id);
        if (options.accordionMode === "single") {
          if (isOpen) return new Set();
          return new Set([id]);
        }
        const next = new Set(prev);
        if (isOpen) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [options.accordionMode],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (index + delta + items.length) % items.length;
      const nextId = `${prefix}-trigger-${items[nextIndex]!.id}`;
      document.getElementById(nextId)?.focus();
    },
    [items, prefix],
  );

  return (
    <div className="divide-y divide-border rounded-xl border border-border">
      {items.map((item, index) => {
        const isOpen = openIds.has(item.id);
        const triggerId = `${prefix}-trigger-${item.id}`;
        const panelId = `${prefix}-panel-${item.id}`;

        return (
          <div key={item.id} className={cn("px-4 py-3", isOpen && "bg-muted/30")}>
            <h3 className="m-0">
              <button
                type="button"
                id={triggerId}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between gap-4",
                  "text-left font-medium text-foreground",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                )}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                onKeyDown={(e) => onKeyDown(e, index)}
              >
                <span>{item.question}</span>
                <span className="text-muted-foreground" aria-hidden>
                  {isOpen ? "−" : "+"}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              hidden={!isOpen}
              className={cn(!isOpen && "hidden")}
            >
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
