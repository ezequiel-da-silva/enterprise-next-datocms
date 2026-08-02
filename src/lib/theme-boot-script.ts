import { THEME_COOKIE_NAME } from "@/constants/theme";

/** Script mínimo (nonce CSP) — evita hidratar `ThemeBoot` só para ler cookie. */
export function buildThemeBootScript(): string {
  const escaped = THEME_COOKIE_NAME.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return `(function(){try{var m=document.cookie.match(new RegExp("(?:^|; )${escaped}=([^;]*)"));if(!m)return;var v=decodeURIComponent(m[1]);if(v!=="dark"&&v!=="light")return;var r=document.documentElement;r.classList.toggle("dark",v==="dark");r.setAttribute("data-theme",v)}catch(e){}})();`;
}
