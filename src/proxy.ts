import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_APP_LOCALE, REQUEST_LOCALE_HEADER, isAppLocale } from "@/constants/i18n";
import { NONCE_HEADER } from "@/constants/security";
import { THEME_COOKIE_NAME, isThemeMode, type ThemeMode } from "@/constants/theme";

const DATO_ADMIN_FRAME =
  process.env.DATOCMS_ADMIN_FRAME_ANCESTOR ?? "https://boilerplate-dato.admin.datocms.com";

function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function buildCspHeader(nonce: string, isDev: boolean): string {
  const scriptExtra = isDev ? " 'unsafe-eval'" : " 'strict-dynamic'";
  /* Com nonce em style-src o browser ignora 'unsafe-inline' → estilos inline do dev/HMR falham. */
  const styleSrc = isDev ? "style-src 'self' 'unsafe-inline'" : `style-src 'self' 'nonce-${nonce}'`;

  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'${scriptExtra}`,
    /* Fontes via next/font: ficheiros em /_next/static — cobertos por font-src 'self'. Sem fonts.googleapis.com / gstatic. */
    styleSrc,
    "img-src 'self' data: blob: https://www.datocms-assets.com",
    "font-src 'self' data:",
    `media-src 'self' https://www.datocms-assets.com https://stream.mux.com`,
    "manifest-src 'self'",
    `connect-src 'self' https://graphql.datocms.com ${DATO_ADMIN_FRAME}`,
    `frame-ancestors 'self' https://plugins-cdn.datocms.com ${DATO_ADMIN_FRAME}`,
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ];

  return directives.join("; ");
}

function readThemeCookie(request: NextRequest): ThemeMode | null {
  const raw = request.cookies.get(THEME_COOKIE_NAME)?.value;
  return isThemeMode(raw) ? raw : null;
}

export function proxy(request: NextRequest) {
  const nonce = createNonce();
  const isDev = process.env.NODE_ENV === "development";
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(NONCE_HEADER, nonce);

  const firstSegment = request.nextUrl.pathname.split("/").filter(Boolean)[0];
  const requestLocale = firstSegment && isAppLocale(firstSegment) ? firstSegment : DEFAULT_APP_LOCALE;
  requestHeaders.set(REQUEST_LOCALE_HEADER, requestLocale);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set("Content-Security-Policy", buildCspHeader(nonce, isDev));
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  if (!isDev) {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  const theme = readThemeCookie(request);
  if (theme) {
    response.headers.set("x-nd-theme", theme);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
