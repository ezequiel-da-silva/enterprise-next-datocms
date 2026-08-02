import { NextResponse } from "next/server";

export function withCors(init?: ResponseInit): ResponseInit {
  return {
    ...init,
    headers: {
      ...init?.headers,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  };
}

export function jsonWithCors(body: unknown, status = 200) {
  return NextResponse.json(body, withCors({ status }));
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
