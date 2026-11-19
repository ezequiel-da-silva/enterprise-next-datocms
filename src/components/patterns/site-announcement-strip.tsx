type SiteAnnouncementStripProps = {
  text: string | null | undefined;
};

/** Thin trust line above sticky chrome; scrolls away with the page. */
export function SiteAnnouncementStrip({ text }: SiteAnnouncementStripProps) {
  const line = text?.trim();
  if (!line) return null;

  return (
    <div
      data-ui-section="SiteAnnouncementStrip"
      className="flex h-8 items-center justify-center border-b border-border/60 bg-muted/60 px-4 text-center text-xs text-muted-foreground"
      role="note"
    >
      <p className="truncate">{line}</p>
    </div>
  );
}
