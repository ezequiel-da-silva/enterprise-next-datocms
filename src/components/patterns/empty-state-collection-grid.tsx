import type { EmptyStateCollection } from "@/lib/storefront/empty-state-collection";
import { cn } from "@/lib/cn";
import Image from "next/image";
import Link from "next/link";

type EmptyStateCollectionGridProps = {
  collections: EmptyStateCollection[];
  /** `drawer` = single column for the quick-cart panel width. */
  layout?: "page" | "drawer";
  /** Called when a collection link is activated (e.g. close the cart drawer). */
  onNavigate?: () => void;
};

/**
 * Compact suggestion grid for empty cart / wishlist. Sync presentational
 * (safe to import from Client Components).
 */
export function EmptyStateCollectionGrid({
  collections,
  layout = "page",
  onNavigate,
}: EmptyStateCollectionGridProps) {
  if (collections.length === 0) return null;

  const isDrawer = layout === "drawer";

  return (
    <ul
      className={cn(
        "m-0 grid list-none p-0",
        isDrawer ? "grid-cols-1 gap-3" : "grid-cols-1 gap-4 sm:grid-cols-3",
      )}
    >
      {collections.map((collection) => (
        <li key={collection.handle}>
          <Link
            href={collection.href}
            onClick={onNavigate}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-foreground/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <div className="relative aspect-[4/3] w-full bg-muted">
              {collection.image?.url ? (
                <Image
                  src={collection.image.url}
                  alt={collection.image.altText?.trim() || collection.title}
                  width={collection.image.width && collection.image.width > 0 ? collection.image.width : 600}
                  height={collection.image.height && collection.image.height > 0 ? collection.image.height : 450}
                  sizes={isDrawer ? "24rem" : "(max-width: 640px) 100vw, 33vw"}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <p
              className={cn(
                "font-semibold text-foreground group-hover:text-primary",
                isDrawer ? "p-2.5 text-sm" : "p-3 text-sm",
              )}
            >
              {collection.title}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
