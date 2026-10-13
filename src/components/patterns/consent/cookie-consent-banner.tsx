"use client";

import { useEffect, useId, useRef } from "react";
import { Button } from "@/components/atoms/button";
import { Container } from "@/components/atoms/container";
import type { AppLocale } from "@/constants/i18n";
import type { ConsentState } from "@/lib/consent/consent-cookie";
import { consentCopy } from "@/lib/i18n/consent-copy";
import type { ShopifyPrivacyConfig } from "@/lib/shopify/customer-privacy-config";
import { setConsent, takeBannerFocusRequest, useConsent } from "./consent-store";
import { syncShopifyConsent } from "./shopify-customer-privacy";

type CookieConsentBannerProps = {
  locale: AppLocale;
  privacyPolicyUrl: string | null;
  shopifyPrivacy: ShopifyPrivacyConfig | null;
};

/**
 * Non-modal region pinned to the bottom: the page stays usable, so there is no focus trap. Both
 * choices have the same visual weight. Keeps `scroll-padding-bottom` in sync so focused elements
 * are not hidden underneath it.
 */
export function CookieConsentBanner({ locale, privacyPolicyUrl, shopifyPrivacy }: CookieConsentBannerProps) {
  const consent = useConsent();
  const copy = consentCopy(locale);
  const titleId = useId();
  const descriptionId = useId();
  const regionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const visible = consent === null;

  useEffect(() => {
    if (!visible) return;
    if (takeBannerFocusRequest()) headingRef.current?.focus();
    const region = regionRef.current;
    const root = document.documentElement;
    if (!region) return;
    const sync = () => {
      root.style.scrollPaddingBottom = `${region.offsetHeight}px`;
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(region);
    return () => {
      observer.disconnect();
      root.style.scrollPaddingBottom = "";
    };
  }, [visible]);

  if (!visible) return null;

  function choose(state: ConsentState) {
    const hadFocus = regionRef.current?.contains(document.activeElement) ?? false;
    setConsent(state);
    if (shopifyPrivacy) void syncShopifyConsent(shopifyPrivacy, state);
    if (hadFocus) document.getElementById("conteudo-principal")?.focus({ preventScroll: true });
  }

  return (
    <section
      ref={regionRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      data-cookie-consent=""
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/85"
    >
      <Container size="lg" name="CookieConsentBanner" className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 space-y-1">
          <h2 ref={headingRef} id={titleId} tabIndex={-1} className="text-sm font-semibold text-foreground outline-none">
            {copy.title}
          </h2>
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {copy.description}
            {privacyPolicyUrl ? (
              <>
                {" "}
                <a
                  href={privacyPolicyUrl}
                  className="font-medium text-foreground underline underline-offset-2 hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {copy.privacyPolicy}
                </a>
              </>
            ) : null}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="min-h-11" onClick={() => choose("denied")}>
            {copy.rejectNonEssential}
          </Button>
          <Button variant="outline" className="min-h-11" onClick={() => choose("granted")}>
            {copy.acceptAll}
          </Button>
        </div>
      </Container>
    </section>
  );
}
