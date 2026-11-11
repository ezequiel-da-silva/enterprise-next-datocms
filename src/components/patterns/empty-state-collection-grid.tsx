import type { EmptyStateCollection } from "@/lib/storefront/empty-state-collection";
import Image from "next/image";
import Link from "next/link";

type EmptyStateCollectionGridProps = {
  collections: EmptyStateCollection[];
};

/**
 * Compact suggestion grid for empty cart / wishlist. Server Component (links only).
 */
export function EmptyStateCollectionGrid({ collections }: EmptyStateCollectionGridProps) {
  if (collections.length === 0) return null;

  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-3">
      {collections.map((collection) => (
        <li key={collection.handle}>
          <Link
            href={collection.href}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-foreground/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <div className="relative aspect-[4/3] w-full bg-muted">
              {collection.image?.url ? (
                <Image
                  src={collection.image.url}
                  alt={collection.image.altText?.trim() || collection.title}
                  width={collection.image.width && collection.image.width > 0 ? collection.image.width : 600}
                  height={collection.image.height && collection.image.height > 0 ? collection.image.height : 450}
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <p className="p-3 text-sm font-semibold text-foreground group-hover:text-primary">{collection.title}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
