import type { AppLocale } from "@/constants/i18n";
import { cn } from "@/lib/cn";
import { isSafeExternalHref, resolveLinkBlock } from "@/lib/datocms/link-block";
import Link from "next/link";
import type { ReactNode } from "react";

export type SmartLinkBlockRecord = Record<string, unknown> & { id?: string; __typename?: string };

export type SmartLinkTone = "default" | "inherit";

type SmartLinkProps = {
  record: SmartLinkBlockRecord;
  locale: AppLocale;
  className?: string;
  children?: ReactNode;
  /** `default`: link CTA com cor primária. `inherit`: herda estilos do pai (ex.: Button asChild). */
  tone?: SmartLinkTone;
};

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const TONE_CLASSES: Record<SmartLinkTone, string> = {
  default: cn(
    "inline-flex font-medium text-primary underline-offset-4 hover:underline",
    FOCUS_RING,
  ),
  inherit: cn("inline-flex items-center justify-center gap-2", FOCUS_RING),
};

/**
 * CTA a partir do bloco **Link** do DatoCMS (`type_content` + links internos ou `external_link`).
 */
export function SmartLink({ record, locale, className, children, tone = "default" }: SmartLinkProps) {
  const resolved = resolveLinkBlock(record, locale);
  if (!resolved) {
    return null;
  }

  const text = children ?? resolved.label;
  if (text == null || text === "") {
    return null;
  }

  const aria = resolved.ariaLabel?.trim() ? { "aria-label": resolved.ariaLabel.trim() } : {};
  const rel = resolved.newTab ? ("noopener noreferrer" as const) : undefined;
  const target = resolved.newTab ? ("_blank" as const) : undefined;
  const linkClass = cn(TONE_CLASSES[tone], className);

  if (resolved.kind === "external") {
    if (!isSafeExternalHref(resolved.href)) {
      return null;
    }
    return (
      <a href={resolved.href} className={linkClass} target="_blank" rel="noopener noreferrer" {...aria}>
        {text}
      </a>
    );
  }

  if (resolved.newTab) {
    return (
      <Link href={resolved.href} className={linkClass} target={target} rel={rel} {...aria}>
        {text}
      </Link>
    );
  }

  return (
    <Link href={resolved.href} className={linkClass} {...aria}>
      {text}
    </Link>
  );
}
