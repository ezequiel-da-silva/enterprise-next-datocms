import Link from "next/link";

type SiteAnnouncementStripProps = {
  text: string | null | undefined;
  /** When set, the trust line navigates (e.g. refund policy). */
  href?: string | null;
};

/** Thin trust line above sticky chrome; scrolls away with the page. */
export function SiteAnnouncementStrip({ text, href }: SiteAnnouncementStripProps) {
  const line = text?.trim();
  if (!line) return null;

  const body = href?.trim() ? (
    <Link
      href={href.trim()}
      className="truncate underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {line}
    </Link>
  ) : (
    <p className="truncate">{line}</p>
  );

  return (
    <div
      data-ui-section="SiteAnnouncementStrip"
      className="flex h-8 items-center justify-center border-b border-border/60 bg-muted/60 px-4 text-center text-xs text-muted-foreground"
      role="note"
    >
      {body}
    </div>
  );
}
