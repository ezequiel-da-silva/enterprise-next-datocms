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
  align = "center",
  className,
  headingClassName,
  descriptionClassName,
}: SectionTextHeaderProps) {
  if (!header.title && !header.description) return null;

  const alignClass =
    align === "left" ? "text-left" : align === "right" ? "text-right" : "mx-auto max-w-3xl text-center";

  return (
    <header className={cn(alignClass, className)}>
      {header.title ? (
        <h2
          id={headingId}
          className={cn(
            "text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl",
            headingClassName,
          )}
        >
          {header.title}
        </h2>
      ) : null}
      {header.description ? (
        <p
          className={cn(
            "text-base text-muted-foreground",
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
