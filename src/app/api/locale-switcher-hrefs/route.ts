import { isAppLocale, type AppLocale } from "@/constants/i18n";
import { readSearchQuery } from "@/lib/datocms/search-query";
import {
  appendLocaleSwitcherSearch,
  isSafeLocalePath,
  normalizeSwitcherPathname,
} from "@/lib/i18n/locale-switch-href";
import { resolveLocaleSwitcherHrefs } from "@/lib/i18n/resolve-locale-switcher-hrefs";
import { draftMode } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

const MAX_PATHNAME_LENGTH = 512;

function parsePathnameParam(raw: string | null): { pathname: string; locale: AppLocale } | null {
  if (!raw || raw.length > MAX_PATHNAME_LENGTH) return null;
  /* Query/hash no param — o cliente só envia path; normalizar depois apagaria a injecção. */
  if (/[?#]/.test(raw)) return null;
  const pathname = normalizeSwitcherPathname(raw);
  if (!isSafeLocalePath(pathname)) return null;
  const locale = pathname.slice(1).split("/")[0];
  if (!locale || !isAppLocale(locale)) return null;
  return { pathname, locale };
}

/**
 * Hrefs do seletor de idioma para o pathname actual.
 * Usado pelo cliente após soft nav — o root layout não volta a resolver `localeHrefs`.
 */
export async function GET(request: NextRequest) {
  const parsed = parsePathnameParam(request.nextUrl.searchParams.get("pathname"));
  if (!parsed) {
    return NextResponse.json({ error: "Invalid pathname" }, { status: 400 });
  }

  const { isEnabled } = await draftMode();
  const resolved = await resolveLocaleSwitcherHrefs(parsed.pathname, parsed.locale, isEnabled);
  const q = readSearchQuery(request.nextUrl.searchParams.get("q"));
  const hrefs = appendLocaleSwitcherSearch(resolved, q);

  return NextResponse.json(hrefs, {
    headers: {
      "Cache-Control": "private, max-age=30",
    },
  });
}
