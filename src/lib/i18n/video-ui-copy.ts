import type { AppLocale } from "@/constants/i18n";

export type VideoUiCopy = {
  videoDefaultLabel: string;
  captionsDefaultLabel: string;
};

export const VIDEO_UI_COPY: Record<AppLocale, VideoUiCopy> = {
  en: {
    videoDefaultLabel: "Product video",
    captionsDefaultLabel: "Captions available",
  },
  pt: {
    videoDefaultLabel: "Vídeo do produto",
    captionsDefaultLabel: "Legendas disponíveis",
  },
  es: {
    videoDefaultLabel: "Vídeo del producto",
    captionsDefaultLabel: "Subtítulos disponibles",
  },
};

export function videoUiCopy(locale: AppLocale): VideoUiCopy {
  return VIDEO_UI_COPY[locale];
}
