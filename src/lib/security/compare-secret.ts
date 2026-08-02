import { timingSafeEqual } from "node:crypto";

/** Comparação constante no tempo — evita timing attacks em tokens de preview. */
export function isSecretEqual(received: string | null | undefined, expected: string): boolean {
  const a = (received ?? "").trim();
  const b = expected.trim();
  if (!a || !b) return false;

  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;

  return timingSafeEqual(bufA, bufB);
}
