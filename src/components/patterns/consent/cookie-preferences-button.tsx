"use client";

import { clearConsent } from "./consent-store";

/** Footer control to withdraw or change consent (LGPD art. 8 §5 / GDPR art. 7(3)). */
export function CookiePreferencesButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={clearConsent}
      className="touch-target-text inline-flex cursor-pointer items-center py-1 text-xs leading-none text-muted-foreground transition hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {label}
    </button>
  );
}
