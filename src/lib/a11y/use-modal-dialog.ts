"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type UseModalDialogOptions = {
  open: boolean;
  panelRef: RefObject<HTMLElement | null>;
  returnFocusRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
  /** When set, close the dialog if this media query starts matching (e.g. desktop breakpoint). */
  closeOnMediaQuery?: string;
  /** Elements that receive `inert` while open (defaults to main + footer). */
  inertTargets?: () => (HTMLElement | null)[];
};

/**
 * Escape, Tab wrap, scroll lock and inert backdrop for modal dialogs/drawers.
 * Matches the mobile nav pattern in `header-nav.tsx`.
 */
export function useModalDialog({
  open,
  panelRef,
  returnFocusRef,
  onClose,
  closeOnMediaQuery,
  inertTargets,
}: UseModalDialogOptions): void {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !closeOnMediaQuery) return;
    const mq = window.matchMedia(closeOnMediaQuery);
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) onClose();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [open, closeOnMediaQuery, onClose]);

  useEffect(() => {
    const targets = inertTargets?.() ?? [
      document.getElementById("conteudo-principal"),
      document.querySelector("footer"),
    ];
    if (open) {
      for (const el of targets) el?.setAttribute("inert", "");
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => {
        const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
        first?.focus();
      });
    } else {
      for (const el of targets) el?.removeAttribute("inert");
      document.body.style.overflow = "";
    }
    return () => {
      for (const el of targets) el?.removeAttribute("inert");
      document.body.style.overflow = "";
    };
  }, [open, panelRef, inertTargets]);

  useEffect(() => {
    if (!open || !panelRef.current) return;
    const panel = panelRef.current;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusables = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
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
  }, [open, panelRef]);

}
