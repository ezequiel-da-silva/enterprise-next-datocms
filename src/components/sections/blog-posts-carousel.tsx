"use client";

import { Button } from "@/components/atoms/button";
import { PostCard } from "@/components/patterns/post-card";
import { useCarouselConfig } from "@/components/ui/carousel/use-carousel-config";
import type { AppLocale } from "@/constants/i18n";
import type { PostCardRecord } from "@/infra/datocms/types-blog";
import type { CarouselSetting } from "@/lib/datocms/resolve-carousel-setting";
import { latestPostsCopy } from "@/lib/i18n/latest-posts-copy";
import { cn } from "@/lib/cn";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState, type KeyboardEvent } from "react";

const CARD_SIZES = "(max-width: 767px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 360px";

type BlogPostsCarouselProps = {
  posts: PostCardRecord[];
  locale: AppLocale;
  headingLevel: "h2" | "h3";
  setting: CarouselSetting;
};

export function BlogPostsCarousel({ posts, locale, headingLevel, setting }: BlogPostsCarouselProps) {
  const copy = latestPostsCopy(locale);
  const { options, plugins, autoplayPlugin } = useCarouselConfig(setting);
  const [emblaRef, emblaApi] = useEmblaCarousel(options, plugins);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const sync = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setSnapCount(emblaApi.scrollSnapList().length);
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setIsPlaying(autoplayPlugin?.isPlaying() ?? false);
  }, [autoplayPlugin, emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const frame = requestAnimationFrame(sync);
    emblaApi.on("select", sync).on("reInit", sync);
    return () => {
      cancelAnimationFrame(frame);
      emblaApi.off("select", sync).off("reInit", sync);
    };
  }, [emblaApi, sync]);

  useEffect(() => {
    if (!autoplayPlugin || !emblaApi) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const reduced = media.matches;
      setReducedMotion(reduced);
      if (reduced || userPaused) autoplayPlugin.stop();
      else autoplayPlugin.play();
      setIsPlaying(autoplayPlugin.isPlaying());
    };
    const frame = requestAnimationFrame(update);
    media.addEventListener("change", update);
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", update);
      autoplayPlugin.stop();
    };
  }, [autoplayPlugin, emblaApi, userPaused]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!emblaApi || snapCount < 2) return;
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "A" || target.isContentEditable) {
          return;
        }
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        emblaApi.scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        emblaApi.scrollNext();
      } else if (event.key === "Home") {
        event.preventDefault();
        emblaApi.scrollTo(0);
      } else if (event.key === "End") {
        event.preventDefault();
        emblaApi.scrollTo(snapCount - 1);
      }
    },
    [emblaApi, snapCount],
  );

  const pauseForHover = () => {
    if (!autoplayPlugin || reducedMotion || userPaused) return;
    autoplayPlugin.stop();
    setIsPlaying(false);
  };

  const resumeAfterHover = () => {
    if (!autoplayPlugin || reducedMotion || userPaused) return;
    autoplayPlugin.play();
    setIsPlaying(autoplayPlugin.isPlaying());
  };

  const toggleAutoplay = () => {
    if (!autoplayPlugin || reducedMotion) return;
    if (autoplayPlugin.isPlaying()) {
      setUserPaused(true);
      autoplayPlugin.stop();
    } else {
      setUserPaused(false);
      autoplayPlugin.play();
    }
    setIsPlaying(autoplayPlugin.isPlaying());
  };

  const hasMultipleSnaps = snapCount > 1;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={copy.carousel}
      onKeyDown={onKeyDown}
      onMouseEnter={pauseForHover}
      onMouseLeave={resumeAfterHover}
    >
      <div ref={emblaRef} className="overflow-hidden">
        <ul className="-ml-4 flex list-none p-0">
          {posts.map((post, index) => (
            <li
              key={post.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} / ${posts.length}`}
              className={cn(
                "min-w-0 shrink-0 basis-full pl-4 md:basis-1/2 lg:basis-1/3",
              )}
            >
              <PostCard post={post} locale={locale} headingLevel={headingLevel} sizes={CARD_SIZES} />
            </li>
          ))}
        </ul>
      </div>

      {hasMultipleSnaps && (setting.showArrows || setting.showDots || setting.autoplay) ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          {setting.showArrows ? (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="touch-target rounded-full"
                aria-label={copy.previousSlide}
                disabled={!canScrollPrev}
                onClick={() => emblaApi?.scrollPrev()}
              >
                <span aria-hidden>←</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="touch-target rounded-full"
                aria-label={copy.nextSlide}
                disabled={!canScrollNext}
                onClick={() => emblaApi?.scrollNext()}
              >
                <span aria-hidden>→</span>
              </Button>
            </div>
          ) : <span />}

          {setting.showDots ? (
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from({ length: snapCount }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  className={cn(
                    "touch-target cursor-pointer rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring after:block after:h-2.5 after:rounded-full",
                    index === selectedIndex
                      ? "after:w-7 after:bg-foreground"
                      : "after:w-2.5 after:bg-muted-foreground",
                  )}
                  aria-label={copy.goToSlide(index + 1)}
                  aria-current={index === selectedIndex ? "true" : undefined}
                  onClick={() => emblaApi?.scrollTo(index)}
                />
              ))}
            </div>
          ) : null}

          {setting.autoplay ? (
            <Button
              type="button"
              variant="ghost"
              className="touch-target-text"
              disabled={reducedMotion}
              aria-label={reducedMotion ? copy.reducedMotion : undefined}
              title={reducedMotion ? copy.reducedMotion : undefined}
              onClick={toggleAutoplay}
            >
              {isPlaying ? copy.pause : copy.play}
            </Button>
          ) : null}
        </div>
      ) : null}

      <p className="sr-only" aria-live={isPlaying ? "off" : "polite"}>
        {`${selectedIndex + 1} / ${Math.max(snapCount, 1)}`}
      </p>
    </div>
  );
}
