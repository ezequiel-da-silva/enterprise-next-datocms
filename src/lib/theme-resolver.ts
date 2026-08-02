import { THEME_COOKIE_NAME, isThemeMode } from "@/constants/theme";

function readCookieValue(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const hit = document.cookie.split("; ").find((x) => x.startsWith(`${name}=`));
  if (!hit) return undefined;
  return decodeURIComponent(hit.slice(name.length + 1));
}

/**
 * Alinha `class="dark"` + `data-theme` ao cookie já aplicado no SSR (`layout.tsx`).
 * Sem cookie, não faz nada — a primeira pintura usa `prefers-color-scheme` em
 * `buildThemeCssVariables()` (`html:not([data-theme])`).
 */
export function syncThemeDomFromCookie(): void {
  if (typeof document === "undefined") return;
  const fromCookie = readCookieValue(THEME_COOKIE_NAME);
  if (!isThemeMode(fromCookie)) return;
  const root = document.documentElement;
  root.classList.toggle("dark", fromCookie === "dark");
  root.setAttribute("data-theme", fromCookie);
}
