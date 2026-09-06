"use client";

import type { AppLocale } from "@/constants/i18n";
import type { FeatureGridOptions } from "@/lib/datocms/resolve-feature-grid-options";
import { FEATURE_GRID_COPY } from "@/lib/i18n/feature-grid-copy";
import { cn } from "@/lib/cn";
import { useCarouselConfig } from "@/components/ui/carousel/use-carousel-config";
import useEmblaCarousel from "embla-carousel-react";
import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

type FeatureGridCarouselProps = {
  children: ReactNode;
  locale: AppLocale;
  options: FeatureGridOptions;
  labelledBy?: string;
  label?: string;
};

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={direction === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
}

function PlaybackIcon({ playing }: { playing: boolean }) {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      {playing ? (
        <>
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </>
      ) : (
        <path d="M8 5.5v13a1 1 0 0 0 1.53.85l10-6.5a1 1 0 0 0 0-1.7l-10-6.5A1 1 0 0 0 8 5.5Z" />
      )}
    </svg>
  );
}

export function FeatureGridCarousel({
  children,
  locale,
  options,
  labelledBy,
  label,
}: FeatureGridCarouselProps) {
  const copy = FEATURE_GRID_COPY[locale];
  const slides = Children.toArray(children);
  const carousel = options.carousel;
  const { options: emblaOptions, plugins, autoplayPlugin } = useCarouselConfig(carousel);
  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, plugins);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const syncCarouselState = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setScrollSnaps(emblaApi.scrollSnapList());
    setCanScrollPrev(emblaApi.canScrollPrev());
    const canNext = emblaApi.canScrollNext();
    setCanScrollNext(canNext);
    if (autoplayPlugin && !carousel.loop && !canNext) {
      autoplayPlugin.stop();
      setIsPlaying(false);
      return;
    }
    setIsPlaying(autoplayPlugin?.isPlaying() ?? false);
  }, [autoplayPlugin, carousel.loop, emblaApi]);

  const syncAutoplayState = useCallback(() => {
    setIsPlaying(autoplayPlugin?.isPlaying() ?? false);
  }, [autoplayPlugin]);

  useEffect(() => {
    if (!emblaApi) return;
    const frame = requestAnimationFrame(syncCarouselState);
    emblaApi.on("select", syncCarouselState);
    emblaApi.on("reInit", syncCarouselState);
    if (autoplayPlugin) {
      emblaApi.on("autoplay:play", syncAutoplayState);
      emblaApi.on("autoplay:stop", syncAutoplayState);
    }
    return () => {
      cancelAnimationFrame(frame);
      emblaApi.off("select", syncCarouselState);
      emblaApi.off("reInit", syncCarouselState);
      if (autoplayPlugin) {
        emblaApi.off("autoplay:play", syncAutoplayState);
        emblaApi.off("autoplay:stop", syncAutoplayState);
      }
    };
  }, [autoplayPlugin, emblaApi, syncAutoplayState, syncCarouselState]);

  useEffect(() => {
    if (!autoplayPlugin || !emblaApi) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => {
      const reduced = media.matches;
      setReducedMotion(reduced);
      if (reduced || userPaused) {
        autoplayPlugin.stop();
      } else {
        autoplayPlugin.play();
      }
      syncAutoplayState();
    };
    const frame = requestAnimationFrame(syncPreference);
    media.addEventListener("change", syncPreference);
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", syncPreference);
      autoplayPlugin.stop();
    };
  }, [autoplayPlugin, emblaApi, syncAutoplayState, userPaused]);

  const toggleAutoplay = useCallback(() => {
    if (!autoplayPlugin || reducedMotion) return;
    if (autoplayPlugin.isPlaying()) {
      setUserPaused(true);
      autoplayPlugin.stop();
    } else {
      setUserPaused(false);
      if (!carousel.loop && emblaApi && !emblaApi.canScrollNext()) {
        emblaApi.scrollTo(0);
      }
      autoplayPlugin.play();
    }
    syncAutoplayState();
  }, [autoplayPlugin, carousel.loop, emblaApi, reducedMotion, syncAutoplayState]);

  const pauseForHover = useCallback(() => {
    if (!autoplayPlugin || reducedMotion || userPaused) return;
    autoplayPlugin.stop();
    syncAutoplayState();
  }, [autoplayPlugin, reducedMotion, syncAutoplayState, userPaused]);

  const resumeAfterHover = useCallback(() => {
    if (!autoplayPlugin || reducedMotion || userPaused) return;
    autoplayPlugin.play();
    syncAutoplayState();
  }, [autoplayPlugin, reducedMotion, syncAutoplayState, userPaused]);

  const hasMultipleSlides = scrollSnaps.length > 1;

  const onCarouselKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!emblaApi || !hasMultipleSlides) return;
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) {
          return;
        }
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        emblaApi.scrollPrev();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        emblaApi.scrollNext();
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        emblaApi.scrollTo(0);
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        emblaApi.scrollTo(Math.max(scrollSnaps.length - 1, 0));
      }
    },
    [emblaApi, hasMultipleSlides, scrollSnaps.length],
  );

  return (
    <div
      role="region"
      aria-roledescription={copy.roleDescription}
      onKeyDown={onCarouselKeyDown}
      onMouseEnter={pauseForHover}
      onMouseLeave={resumeAfterHover}
      {...(labelledBy ? { "aria-labelledby": labelledBy } : { "aria-label": label })}
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className={cn("flex", options.variant === "cards" && "-ml-4")}>
          {slides.map((slide, index) => (
            <div
              key={isValidElement(slide) ? slide.key : index}
              role="group"
              aria-roledescription={copy.slideRoleDescription}
              aria-label={copy.slide(index + 1, slides.length)}
              className={cn(
                "min-w-0 shrink-0",
                options.variant === "cards"
                  ? cn(
                      "flex basis-full pl-4",
                      slides.length > 1 && "md:basis-1/2",
                      slides.length > 2 && "lg:basis-1/3",
                    )
                  : "w-full min-w-full",
              )}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {(carousel.showArrows || carousel.showDots || carousel.autoplay) && hasMultipleSlides ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          {carousel.showArrows ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="touch-target cursor-pointer rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={copy.previous}
                disabled={!canScrollPrev}
                onClick={() => emblaApi?.scrollPrev()}
              >
                <ArrowIcon direction="left" />
              </button>
              <button
                type="button"
                className="touch-target cursor-pointer rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={copy.next}
                disabled={!canScrollNext}
                onClick={() => emblaApi?.scrollNext()}
              >
                <ArrowIcon direction="right" />
              </button>
            </div>
          ) : (
            <span />
          )}

          {carousel.showDots ? (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={cn(
                    "touch-target cursor-pointer rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    "after:block after:h-2.5 after:rounded-full after:transition-[width,background-color] motion-reduce:after:transition-none",
                    index === selectedIndex
                      ? "after:w-7 after:bg-foreground"
                      : "after:w-2.5 after:bg-foreground",
                  )}
                  aria-label={copy.goTo(index + 1)}
                  aria-current={index === selectedIndex ? "true" : undefined}
                  onClick={() => emblaApi?.scrollTo(index)}
                />
              ))}
            </div>
          ) : null}

          {carousel.autoplay ? (
            <button
              type="button"
              className="touch-target cursor-pointer gap-2 rounded-md px-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={reducedMotion ? copy.reducedMotion : undefined}
              title={reducedMotion ? copy.reducedMotion : undefined}
              disabled={reducedMotion}
              onClick={toggleAutoplay}
            >
              <PlaybackIcon playing={isPlaying} />
              <span>{isPlaying ? copy.pause : copy.play}</span>
            </button>
          ) : null}
        </div>
      ) : null}

      <p className="sr-only" aria-live={isPlaying ? "off" : "polite"} aria-atomic="true">
        {copy.slide(selectedIndex + 1, Math.max(scrollSnaps.length, 1))}
      </p>
    </div>
  );
}
