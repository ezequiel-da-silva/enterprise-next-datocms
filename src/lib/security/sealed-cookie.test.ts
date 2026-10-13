import { describe, expect, it } from "vitest";
import { seal, unseal } from "@/lib/security/sealed-cookie";

const SECRET = "a".repeat(32);

describe("sealed cookie", () => {
  it("round-trips a JSON payload", () => {
    const value = seal({ token: "abc", n: 1 }, SECRET);
    expect(unseal(value, SECRET)).toEqual({ token: "abc", n: 1 });
  });

  it("uses a fresh IV per seal", () => {
    expect(seal({ a: 1 }, SECRET)).not.toBe(seal({ a: 1 }, SECRET));
  });

  it("rejects a tampered value", () => {
    const value = seal({ token: "abc" }, SECRET);
    const raw = Buffer.from(value, "base64url");
    raw[raw.length - 1] ^= 0xff;
    expect(unseal(raw.toString("base64url"), SECRET)).toBeNull();
  });

  it("rejects the wrong key", () => {
    expect(unseal(seal({ token: "abc" }, SECRET), "b".repeat(32))).toBeNull();
  });

  it("rejects empty and garbage values", () => {
    expect(unseal(undefined, SECRET)).toBeNull();
    expect(unseal("", SECRET)).toBeNull();
    expect(unseal("not-a-cookie", SECRET)).toBeNull();
  });
});
