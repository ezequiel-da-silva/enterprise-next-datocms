import { cache } from "react";

/**
 * Per-request slot so only the first FAQ block with schema enabled
 * emits FAQPage JSON-LD (avoids duplicate graphs on the same page).
 */
export function createFaqSchemaSlot(): { claimed: boolean } {
  return { claimed: false };
}

/** Pure claim helper — testável sem contexto RSC. */
export function claimFromSlot(slot: { claimed: boolean }): boolean {
  if (slot.claimed) return false;
  slot.claimed = true;
  return true;
}

const getFaqSchemaSlot = cache(createFaqSchemaSlot);

/** Returns true once per RSC request; subsequent calls return false. */
export function claimFaqSchemaEmission(): boolean {
  return claimFromSlot(getFaqSchemaSlot());
}
