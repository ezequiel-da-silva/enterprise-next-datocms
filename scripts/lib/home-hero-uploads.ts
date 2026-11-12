/**
 * Shared hero media for home / best-of (snowboard category imagery).
 * Prefer these upload ids when present in the project media library.
 */
export const SNOWBOARD_HERO_UPLOAD = {
  mobile: "epD2HoobR62vkASqq0aRTw",
  desktop: "Cu05KbdFSTaFb34NyM5dPQ",
} as const;

/** Filename / alt heuristic when preferred ids are missing. */
export const SNOWBOARD_UPLOAD_NAME_RE = /snow|board|mountain|ski/i;
