import { cache } from "react";

/**
 * Per-request slot so only the first FAQ block with schema enabled
 * emits FAQPage JSON-LD (avoids duplicate graphs on the same page).
 */
const getFaqSchemaSlot = cache(() => ({ claimed: false }));

/** Returns true once per RSC request; subsequent calls return false. */
export function claimFaqSchemaEmission(): boolean {
  const slot = getFaqSchemaSlot();
  if (slot.claimed) return false;
  slot.claimed = true;
  return true;
}
