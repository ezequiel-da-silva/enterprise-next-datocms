"use client";

import { Button } from "@/components/atoms/button";
import { trackSelectContent } from "@/lib/analytics/ecommerce";
import { ariaLabelIfLabelInName } from "@/lib/a11y/label-in-name";
import { cn } from "@/lib/cn";
import Link from "next/link";

type HeroTrackedPrimaryCtaProps = {
  href: string;
  label: string;
  contentId: string;
  newTab?: boolean;
  ariaLabel?: string | null;
};

const INHERIT_LINK =
  "inline-flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** Primary hero CTA with GA4 `select_content` (beacon-safe on navigate). */
export function HeroTrackedPrimaryCta({
  href,
  label,
  contentId,
  newTab = false,
  ariaLabel,
}: HeroTrackedPrimaryCtaProps) {
  const onClick = () => {
    trackSelectContent({
      content_type: "hero_cta",
      content_id: contentId,
      link_url: href,
    });
  };
  const aria = ariaLabelIfLabelInName(label, ariaLabel);

  return (
    <Button asChild variant="primary">
      {newTab || /^https?:\/\//i.test(href) ? (
        <a
          href={href}
          className={cn(INHERIT_LINK)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          {...aria}
        >
          {label}
        </a>
      ) : (
        <Link href={href} className={cn(INHERIT_LINK)} onClick={onClick} {...aria}>
          {label}
        </Link>
      )}
    </Button>
  );
}
