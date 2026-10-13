"use client";

import type { ReactNode } from "react";
import { useConsent } from "./consent-store";

/** Renders third-party scripts only after "Accept all"; nothing is mounted before or after a rejection. */
export function ConsentScript({ children }: { children: ReactNode }) {
  return useConsent() === "granted" ? children : null;
}
