"use client";

import type { CarouselSetting } from "@/lib/datocms/resolve-carousel-setting";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { useMemo } from "react";

type EmblaOptions = NonNullable<Parameters<typeof useEmblaCarousel>[0]>;

/**
 * Converte `carousel_setting` em opções/plugins estáveis do Embla.
 * O plugin inicia pausado; cada carousel decide quando tocar após verificar
 * `prefers-reduced-motion`.
 */
export function useCarouselConfig(setting: CarouselSetting) {
  const options = useMemo<EmblaOptions>(
    () => ({
      align: "start",
      containScroll: "trimSnaps",
      loop: setting.loop,
      slidesToScroll: 1,
    }),
    [setting.loop],
  );

  const autoplayPlugin = useMemo(
    () =>
      setting.autoplay
        ? Autoplay({
            delay: setting.autoplayInterval * 1000,
            playOnInit: false,
            stopOnFocusIn: true,
            stopOnInteraction: false,
            stopOnMouseEnter: false,
            stopOnLastSnap: !setting.loop,
          })
        : null,
    [setting.autoplay, setting.autoplayInterval, setting.loop],
  );

  const plugins = useMemo(() => (autoplayPlugin ? [autoplayPlugin] : []), [autoplayPlugin]);

  return { options, plugins, autoplayPlugin };
}
