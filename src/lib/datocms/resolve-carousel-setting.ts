import { readCdaBlock } from "@/lib/datocms/cda-field";

export type CarouselSetting = {
  autoplay: boolean;
  autoplayInterval: number;
  showArrows: boolean;
  showDots: boolean;
  loop: boolean;
};

export const CAROUSEL_SETTING_DEFAULTS: CarouselSetting = {
  autoplay: false,
  autoplayInterval: 5,
  showArrows: true,
  showDots: true,
  loop: true,
};

const MIN_AUTOPLAY_INTERVAL = 3;
const MAX_AUTOPLAY_INTERVAL = 60;

function optionalBoolean(record: Record<string, unknown>, camel: string, snake: string): boolean | undefined {
  const raw = record[camel] ?? record[snake];
  return typeof raw === "boolean" ? raw : undefined;
}

function autoplayInterval(record: Record<string, unknown>): number {
  const raw = record.autoplayInterval ?? record.autoplay_interval;
  const value = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : Number.NaN;
  if (!Number.isFinite(value)) return CAROUSEL_SETTING_DEFAULTS.autoplayInterval;
  return Math.min(MAX_AUTOPLAY_INTERVAL, Math.max(MIN_AUTOPLAY_INTERVAL, Math.round(value)));
}

/**
 * Normaliza o single block do Dato, que o CDA expõe como array de zero ou um item.
 * Campos ausentes mantêm os defaults editoriais do modelo `carousel_setting`.
 */
export function resolveCarouselSetting(source: unknown): CarouselSetting {
  const owner = { carouselOptions: source };
  const record = readCdaBlock<Record<string, unknown>>(owner, "carouselOptions", "carousel_options");
  if (!record) return { ...CAROUSEL_SETTING_DEFAULTS };

  return {
    autoplay: optionalBoolean(record, "autoplay", "autoplay") ?? CAROUSEL_SETTING_DEFAULTS.autoplay,
    autoplayInterval: autoplayInterval(record),
    showArrows: optionalBoolean(record, "showArrows", "show_arrows") ?? CAROUSEL_SETTING_DEFAULTS.showArrows,
    showDots: optionalBoolean(record, "showDots", "show_dots") ?? CAROUSEL_SETTING_DEFAULTS.showDots,
    loop: optionalBoolean(record, "loop", "loop") ?? CAROUSEL_SETTING_DEFAULTS.loop,
  };
}
