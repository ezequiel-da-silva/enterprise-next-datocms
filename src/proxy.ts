import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_APP_LOCALE,
  REQUEST_LOCALE_HEADER,
  REQUEST_PATHNAME_HEADER,
  REQUEST_SEARCH_HEADER,
  isAppLocale,
} from "@/constants/i18n";
import { NONCE_HEADER } from "@/constants/security";
import { THEME_COOKIE_NAME, isThemeMode, type ThemeMode } from "@/constants/theme";
import { getRedirects, pickRedirectRecords } from "@/infra/datocms/get-redirects";
import { shouldLookupCmsRedirects } from "@/lib/datocms/cms-redirect-lookup";
import { matchRedirect } from "@/lib/datocms/match-redirect";
import { GA_CSP_HOSTS, readGaMeasurementId } from "@/lib/analytics/ga-config";
import { SPEED_INSIGHTS_CSP_HOST, isSpeedInsightsEnabled } from "@/lib/analytics/speed-insights-config";
import { shopifyPrivacyCspHosts } from "@/lib/shopify/customer-privacy-config";

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

/**
 * Hosts only present when the matching env is set (consent-gated GA4, Shopify Customer Privacy,
 * Vercel Speed Insights). In prod `strict-dynamic` ignores script hosts; they are listed for dev,
 * where it is off. Speed Insights reports to same-origin `/_vercel/speed-insights/*`, so
 * `va.vercel-scripts.com` only matters for its dev debug build and `dsn` mode.
 */
function optionalCspHosts(): { script: string; connect: string; img: string } {
  const ga = readGaMeasurementId() ? GA_CSP_HOSTS.join(" ") : "";
  const shopify = shopifyPrivacyCspHosts();
  const speedInsights = isSpeedInsightsEnabled() ? SPEED_INSIGHTS_CSP_HOST : "";
  const join = (...parts: string[]) => parts.filter(Boolean).map((p) => ` ${p}`).join("");
  return {
    script: join(
      ga && "https://www.googletagmanager.com",
      shopify.length ? "https://cdn.shopify.com" : "",
      speedInsights,
    ),
    connect: join(ga, ...shopify, speedInsights),
    img: join(ga),
  };
}

function buildCspHeader(nonce: string, isDev: boolean): string {
  const scriptExtra = isDev ? " 'unsafe-eval'" : " 'strict-dynamic'";
  const optional = optionalCspHosts();
  /*
   * Dev: unsafe-inline para HMR.
   * Prod: nonce em <style> (style-src / style-src-elem).
   * style-src-attr: 'unsafe-inline' — next/image injeta style="color:transparent";
   * elementos <style> continuam nonce-only (bloqueia inject FA/runtime sem nonce).
   */
  const styleDirectives = isDev
    ? ["style-src 'self' 'unsafe-inline'", "style-src-elem 'self' 'unsafe-inline'", "style-src-attr 'unsafe-inline'"]
    : [
        `style-src 'self' 'nonce-${nonce}'`,
        `style-src-elem 'self' 'nonce-${nonce}'`,
        "style-src-attr 'unsafe-inline'",
      ];

  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'${scriptExtra}${optional.script}`,
    /* Fontes via next/font: ficheiros em /_next/static — cobertos por font-src 'self'. Sem fonts.googleapis.com / gstatic. */
    ...styleDirectives,
    /* image.mux.com: posters de vídeo (thumbnailUrl). */
    `img-src 'self' data: blob: https://www.datocms-assets.com https://image.mux.com https://cdn.shopify.com${optional.img}`,
    "font-src 'self' data:",
    /* *.mux.com: o Mux entrega por vários CDNs (stream.mux.com → *.fastly.mux.com) e os hosts mudam sem aviso. */
    `media-src 'self' https://www.datocms-assets.com https://*.mux.com`,
    "manifest-src 'self'",
    `connect-src 'self' https://graphql.datocms.com ${DATO_ADMIN_FRAME}${optional.connect}`,
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

/**
 * Aplica os headers de segurança a qualquer resposta — inclusive redirects.
 * Um 308 sem CSP/HSTS deixa a resposta exposta e falha o smoke de headers,
 * por isso o redirect raiz `/ → /{locale}` também tem de os carregar.
 */
function applySecurityHeaders(response: NextResponse, nonce: string, isDev: boolean): NextResponse {
  response.headers.set("Content-Security-Policy", buildCspHeader(nonce, isDev));
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  if (!isDev) {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const nonce = createNonce();
  const isDev = process.env.NODE_ENV === "development";
  const pathname = request.nextUrl.pathname;

  if (pathname === "/" || pathname === "") {
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_APP_LOCALE}`;
    return applySecurityHeaders(NextResponse.redirect(url, 308), nonce, isDev);
  }

  if (shouldLookupCmsRedirects(pathname)) {
    const records = pickRedirectRecords(await getRedirects());
    const matched = matchRedirect(pathname, records);
    if (matched) {
      const isExternal = /^https:\/\//i.test(matched.destination);
      const target = isExternal
        ? matched.destination
        : (() => {
            const url = request.nextUrl.clone();
            url.pathname = matched.destination;
            return url;
          })();
      return applySecurityHeaders(NextResponse.redirect(target, matched.status), nonce, isDev);
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(NONCE_HEADER, nonce);

  const firstSegment = pathname.split("/").filter(Boolean)[0];
  const requestLocale = firstSegment && isAppLocale(firstSegment) ? firstSegment : DEFAULT_APP_LOCALE;
  requestHeaders.set(REQUEST_LOCALE_HEADER, requestLocale);
  requestHeaders.set(REQUEST_PATHNAME_HEADER, pathname);
  requestHeaders.set(REQUEST_SEARCH_HEADER, request.nextUrl.search);

  const response = applySecurityHeaders(
    NextResponse.next({ request: { headers: requestHeaders } }),
    nonce,
    isDev,
  );

  const theme = readThemeCookie(request);
  if (theme) {
    response.headers.set("x-nd-theme", theme);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
