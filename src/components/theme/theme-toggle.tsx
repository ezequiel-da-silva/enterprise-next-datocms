"use client";

import { IconButton } from "@/components/atoms/icon-button";
import { THEME_COOKIE_NAME, isThemeMode, type ThemeMode } from "@/constants/theme";
import { cn } from "@/lib/cn";
import { useCallback, useEffect, useId, useState } from "react";

/**
 * Espelha `buildThemeCssVariables()`: `data-theme` (cookie) ganha; sem cookie a
 * primeira pintura segue `prefers-color-scheme`, por isso a classe `dark` pode
 * estar ausente num ecrã visualmente escuro.
 */
function readDomTheme(): ThemeMode {
  if (typeof document === "undefined") return "light";
  const root = document.documentElement;
  const attr = root.getAttribute("data-theme");
  if (isThemeMode(attr)) return attr;
  if (root.classList.contains("dark")) return "dark";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.setAttribute("data-theme", mode);
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${THEME_COOKIE_NAME}=${mode};path=/;max-age=31536000;SameSite=Lax${secure}`;
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-5 w-5", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-5 w-5", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

type ThemeToggleProps = {
  /** Cookie lido no SSR: alinha o ARIA do primeiro render com o HTML do servidor. */
  initialMode?: ThemeMode;
};

export function ThemeToggle({ initialMode }: ThemeToggleProps) {
  const baseId = useId();
  /*
   * Derivado só da prop: servidor e primeiro render do cliente produzem markup
   * idêntico, logo não há mismatch de hidratação nem troca de <span> por <button>.
   */
  const [mode, setMode] = useState<ThemeMode>(initialMode ?? "light");

  /*
   * Depois de hidratar o DOM passa a ser a fonte de verdade. Só afeta ARIA — o ícone
   * visível é resolvido por CSS em `globals.css`. O observer mantém coerentes as duas
   * instâncias que coexistem no header (desktop e móvel): só uma recebe o clique.
   */
  useEffect(() => {
    const sync = () => setMode(readDomTheme());
    const frame = requestAnimationFrame(sync);

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    media?.addEventListener("change", sync);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      media?.removeEventListener("change", sync);
    };
  }, []);

  const toggle = useCallback(() => {
    const next: ThemeMode = readDomTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
    setMode(next);
  }, []);

  const isDark = mode === "dark";

  return (
    <IconButton
      type="button"
      id={`${baseId}-theme-toggle`}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      onClick={toggle}
      className="border-border bg-muted hover:bg-muted/80"
    >
      <span aria-hidden data-theme-icon="light">
        <MoonIcon />
      </span>
      <span aria-hidden data-theme-icon="dark">
        <SunIcon />
      </span>
    </IconButton>
  );
}
