import { headers } from "next/headers";

/** Best-effort client IP for rate limiting (behind reverse proxies). */
export async function getClientIpKey(prefix: string): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const realIp = h.get("x-real-ip");
  const raw = forwarded?.split(",")[0]?.trim() || realIp?.trim() || "unknown";
  return `${prefix}:${raw}`;
}
