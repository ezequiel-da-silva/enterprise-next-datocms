type Env = Record<string, string | undefined>;

/** Dev debug build and `dsn` mode load from here; production uses the same-origin `/_vercel/speed-insights/*`. */
export const SPEED_INSIGHTS_CSP_HOST = "https://va.vercel-scripts.com";

/**
 * Speed Insights only exists on Vercel (`/_vercel/speed-insights/*` 404s elsewhere), so it is on when
 * `VERCEL=1`. `SPEED_INSIGHTS_ENABLED=1|true` forces it on, `0|false` forces it off.
 */
export function isSpeedInsightsEnabled(env: Env = process.env): boolean {
  const override = env.SPEED_INSIGHTS_ENABLED?.trim().toLowerCase();
  if (override === "0" || override === "false") return false;
  if (override === "1" || override === "true") return true;
  return env.VERCEL === "1";
}
