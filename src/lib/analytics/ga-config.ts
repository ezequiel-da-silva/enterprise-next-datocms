type Env = Record<string, string | undefined>;

const MEASUREMENT_ID = /^G-[A-Z0-9]+$/;

/** GA4 hosts allowed by the CSP only when a measurement ID is configured. */
export const GA_CSP_HOSTS = [
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
  "https://www.googletagmanager.com",
] as const;

/** GA4 stays off unless `GA_MEASUREMENT_ID` is a valid `G-…` ID; it only loads after consent. */
export function readGaMeasurementId(env: Env = process.env): string | null {
  const raw = env.GA_MEASUREMENT_ID?.trim().toUpperCase();
  return raw && MEASUREMENT_ID.test(raw) ? raw : null;
}
