import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const TAG_BYTES = 16;

function keyFrom(secret: string): Buffer {
  return createHash("sha256").update(secret, "utf8").digest();
}

/** Encrypts + authenticates a JSON payload for a cookie value (base64url: iv | tag | ciphertext). */
export function seal(payload: unknown, secret: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, keyFrom(secret), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64url");
}

/** Reverses `seal`; tampered values, wrong keys or invalid JSON resolve to `null`. */
export function unseal(value: string | undefined, secret: string): unknown {
  if (!value) return null;
  try {
    const raw = Buffer.from(value, "base64url");
    if (raw.length <= IV_BYTES + TAG_BYTES) return null;
    const decipher = createDecipheriv(ALGORITHM, keyFrom(secret), raw.subarray(0, IV_BYTES));
    decipher.setAuthTag(raw.subarray(IV_BYTES, IV_BYTES + TAG_BYTES));
    const text = Buffer.concat([decipher.update(raw.subarray(IV_BYTES + TAG_BYTES)), decipher.final()]).toString("utf8");
    return JSON.parse(text);
  } catch {
    return null;
  }
}
