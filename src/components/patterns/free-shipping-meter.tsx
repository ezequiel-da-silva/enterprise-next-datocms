import type { FreeShippingProgress } from "@/lib/shopify/free-shipping-progress";

type FreeShippingMeterProps = {
  progress: FreeShippingProgress;
  /** Label when `progress.kind === "progress"` (remaining or unlocked). */
  progressLabel: string | null;
  /** Label when shipping is flat free without a threshold bar. */
  simpleFreeLabel: string;
};

/**
 * Cart free-shipping cue: progress bar under threshold, or a simple “free shipping” line.
 * Renders nothing when progress is `hidden`.
 */
export function FreeShippingMeter({ progress, progressLabel, simpleFreeLabel }: FreeShippingMeterProps) {
  if (progress.kind === "hidden") return null;

  if (progress.kind === "simple_free") {
    return (
      <p className="text-xs font-medium text-foreground" data-free-shipping-progress="simple">
        {simpleFreeLabel}
      </p>
    );
  }

  if (!progressLabel) return null;

  const percent = Math.round(progress.ratio * 100);

  return (
    <div className="space-y-2" data-free-shipping-progress="">
      <p className="text-xs font-medium text-foreground">{progressLabel}</p>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={progressLabel}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
