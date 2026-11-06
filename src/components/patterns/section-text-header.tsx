import type { TextHeader } from "@/lib/datocms/resolve-text-header";
import { cn } from "@/lib/cn";

type SectionTextHeaderProps = {
  header: TextHeader;
  headingId: string;
  align?: "left" | "center" | "right";
  className?: string;
  headingClassName?: string;
  descriptionClassName?: string;
};

export function SectionTextHeader({
  header,
  headingId,
  align = "left",
  className,
  headingClassName,
  descriptionClassName,
}: SectionTextHeaderProps) {
  if (!header.title && !header.description) return null;

  const alignClass =
    align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

  return (
    <header className={cn(alignClass, className)}>
      {header.title ? (
        <h2
          id={headingId}
          className={cn("type-heading text-balance text-foreground", headingClassName)}
        >
          {header.title}
        </h2>
      ) : null}
      {header.description ? (
        <p
          className={cn(
            "type-lead text-muted-foreground",
            header.title && "mt-2",
            descriptionClassName,
          )}
        >
          {header.description}
        </p>
      ) : null}
    </header>
  );
}
