import { NextResponse } from "next/server";

const STATIC_ALLOWED_ORIGINS = new Set([
  "https://plugins-cdn.datocms.com",
]);

function adminFrameOrigin(): string | null {
  const raw = process.env.DATOCMS_ADMIN_FRAME_ANCESTOR?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

/**
 * Reflect Origin only when it belongs to DatoCMS admin / plugins CDN.
 * Returns null when Origin is missing or not allowed (no wildcard).
 */
export function resolveDatoCorsOrigin(requestOrigin: string | null): string | null {
  if (!requestOrigin) return null;
  const trimmed = requestOrigin.trim();
  if (!trimmed) return null;

  if (STATIC_ALLOWED_ORIGINS.has(trimmed)) return trimmed;

  const admin = adminFrameOrigin();
  if (admin && trimmed === admin) return trimmed;

  try {
    const { protocol, hostname } = new URL(trimmed);
    if (protocol !== "https:" && protocol !== "http:") return null;
    if (hostname === "plugins-cdn.datocms.com") return trimmed;
    if (hostname === "admin.datocms.com" || hostname.endsWith(".admin.datocms.com")) {
      return trimmed;
    }
  } catch {
    return null;
  }

  return null;
}

export function withCors(init?: ResponseInit, requestOrigin?: string | null): ResponseInit {
  const allowed = resolveDatoCorsOrigin(requestOrigin ?? null);
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
  if (allowed) {
    headers["Access-Control-Allow-Origin"] = allowed;
    headers.Vary = "Origin";
  }

  return {
    ...init,
    headers: {
      ...init?.headers,
      ...headers,
    },
  };
}

export function jsonWithCors(body: unknown, status = 200, requestOrigin?: string | null) {
  return NextResponse.json(body, withCors({ status }, requestOrigin));
}

export function isRelativeUrl(path: string): boolean {
  try {
    new URL(path);
    return false;
  } catch {
    try {
      new URL(path, "http://example.com");
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Next.js Draft Mode dentro do iframe do Web Previews precisa de cookie particionado
 * (SameSite=None + Partitioned). Ver starter Dato + Next.js.
 */
export async function makeDraftModeWorkWithinIframes() {
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  const cookie = jar.get("__prerender_bypass");
  if (!cookie?.value) {
    return;
  }

  jar.set({
    name: "__prerender_bypass",
    value: cookie.value,
    httpOnly: true,
    path: "/",
    secure: true,
    sameSite: "none",
    partitioned: true,
  });
}
