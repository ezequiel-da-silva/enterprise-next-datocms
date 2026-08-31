import { APP_LOCALES, DEFAULT_APP_LOCALE, isAppLocale, type AppLocale } from "@/constants/i18n";
import { readCdaStringForLogic } from "@/lib/datocms/cda-field";
import { isSafeExternalHref } from "@/lib/datocms/link-block";

export type CmsRedirectStatus = 301 | 302;

export type MatchRedirectResult = {
  destination: string;
  status: CmsRedirectStatus;
};

type RecordLike = Record<string, unknown>;

/** Caracteres que não podem ir para um header Location (CRLF) nem virar protocol-relative. */
function hasUnsafePathChars(value: string): boolean {
  return /[\0\r\n\t\\]/.test(value);
}

/**
 * Path interno relativamente seguro para Location: começa por `/`, não `//`,
 * não é `/api`, e resolve para a mesma origem quando interpretado como URL.
 */
export function isSafeInternalRedirectPath(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/api")) {
    return false;
  }
  if (hasUnsafePathChars(path)) {
    return false;
  }
  try {
    const resolved = new URL(path, "https://placeholder.invalid");
    return resolved.origin === "https://placeholder.invalid";
  } catch {
    return false;
  }
}

function normalizeInternalPath(path: string): string {
  const noQuery = path.split("?")[0]?.split("#")[0] ?? path;
  const withSlash = noQuery.startsWith("/") ? noQuery : `/${noQuery}`;
  if (withSlash.length > 1 && withSlash.endsWith("/")) {
    return withSlash.slice(0, -1);
  }
  return withSlash;
}

function firstSegment(path: string): string | undefined {
  return normalizeInternalPath(path).split("/").filter(Boolean)[0];
}

function isLocalePrefixed(path: string): boolean {
  const seg = firstSegment(path);
  return Boolean(seg && isAppLocale(seg));
}

function joinLocale(locale: AppLocale, path: string): string {
  const normalized = normalizeInternalPath(path);
  if (normalized === "/") {
    return `/${locale}`;
  }
  return `/${locale}${normalized}`;
}

function parseStatus(raw: string): CmsRedirectStatus | null {
  const t = raw.trim();
  if (t === "301" || t === "302") {
    return Number(t) as CmsRedirectStatus;
  }
  return null;
}

function resolveHttpsDestination(toPath: string): string | null {
  if (hasUnsafePathChars(toPath) || !/^https:\/\//i.test(toPath)) {
    return null;
  }
  return isSafeExternalHref(toPath) ? toPath : null;
}

function resolveToPath(toPath: string, requestPath: string, fromWasExpanded: boolean): string | null {
  const trimmed = toPath.trim();
  if (!trimmed || trimmed.startsWith("//") || hasUnsafePathChars(trimmed)) {
    return null;
  }

  if (/^https:\/\//i.test(trimmed)) {
    return resolveHttpsDestination(trimmed);
  }

  if (!trimmed.startsWith("/")) {
    return null;
  }

  const normalized = normalizeInternalPath(trimmed);
  if (!isSafeInternalRedirectPath(normalized)) {
    return null;
  }

  if (isLocalePrefixed(normalized) || !fromWasExpanded) {
    return isSafeInternalRedirectPath(normalized) ? normalized : null;
  }

  const localeSeg = firstSegment(requestPath);
  const locale = localeSeg && isAppLocale(localeSeg) ? localeSeg : DEFAULT_APP_LOCALE;
  const joined = joinLocale(locale, normalized);
  return isSafeInternalRedirectPath(joined) ? joined : null;
}

function expandedFromPaths(fromPath: string): { exact: boolean; paths: string[] } {
  const normalized = normalizeInternalPath(fromPath);
  if (normalized === "/" || !isSafeInternalRedirectPath(normalized)) {
    return { exact: true, paths: [] };
  }
  if (isLocalePrefixed(normalized)) {
    return { exact: true, paths: [normalized] };
  }
  return {
    exact: false,
    paths: [normalized, ...APP_LOCALES.map((locale) => joinLocale(locale, normalized))],
  };
}

/**
 * Escolhe o redirect CMS para um pathname (sem query).
 * Match exacto (`/en/contact`) ganha sobre sufixo (`/contact` → todos os locales + o path sem locale).
 */
export function matchRedirect(
  pathname: string,
  records: ReadonlyArray<RecordLike>,
): MatchRedirectResult | null {
  if (!pathname || pathname === "/" || pathname.startsWith("/api")) {
    return null;
  }

  const requestPath = normalizeInternalPath(pathname);
  let suffixMatch: MatchRedirectResult | null = null;

  for (const record of records) {
    const fromRaw = readCdaStringForLogic(record, "fromPathRedirect", "from_path_redirect");
    const toRaw = readCdaStringForLogic(record, "toPathRedirect", "to_path_redirect");
    const status = parseStatus(readCdaStringForLogic(record, "statusRedirect", "status_redirect"));
    if (!fromRaw || !toRaw || !status) {
      continue;
    }

    const { exact, paths } = expandedFromPaths(fromRaw);
    if (!paths.includes(requestPath)) {
      continue;
    }

    const destination = resolveToPath(toRaw, requestPath, !exact);
    if (!destination || destination === requestPath) {
      continue;
    }

    const result: MatchRedirectResult = { destination, status };
    if (exact) {
      return result;
    }
    if (!suffixMatch) {
      suffixMatch = result;
    }
  }

  return suffixMatch;
}
