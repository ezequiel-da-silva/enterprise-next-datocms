"use client";

import { IconButton } from "@/components/atoms/icon-button";
import { THEME_COOKIE_NAME, type ThemeMode } from "@/constants/theme";
import { cn } from "@/lib/cn";
import { useCallback, useEffect, useId, useState } from "react";

function readDomTheme(): ThemeMode {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
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
  /** Quando definido (cookie no SSR), evita skeleton até hidratar. */
  initialMode?: ThemeMode;
};

export function ThemeToggle({ initialMode }: ThemeToggleProps) {
  const baseId = useId();
  const [mode, setMode] = useState<ThemeMode>(initialMode ?? "light");
  const [mounted, setMounted] = useState(Boolean(initialMode));

  useEffect(() => {
    if (initialMode !== undefined) return;
    const frame = requestAnimationFrame(() => {
      setMounted(true);
      setMode(readDomTheme());
    });
    return () => cancelAnimationFrame(frame);
  }, [initialMode]);

  const toggle = useCallback(() => {
    const next: ThemeMode = mode === "dark" ? "light" : "dark";
    setMode(next);
    applyTheme(next);
  }, [mode]);

  if (!mounted) {
    return (
      <span
        suppressHydrationWarning
        className="inline-block h-12 w-12 shrink-0 animate-pulse rounded-md bg-muted"
        aria-hidden
      />
    );
  }

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
      <span className="sr-only">
        {isDark
          ? "Tema escuro ativo. Ativar tema claro."
          : "Tema claro ativo. Ativar tema escuro."}
      </span>
      {isDark ? <SunIcon /> : <MoonIcon />}
    </IconButton>
  );
}
