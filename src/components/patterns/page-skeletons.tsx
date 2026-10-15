import { Container, type ContainerSize } from "@/components/atoms/container";
import { Skeleton } from "@/components/atoms/skeleton";
import { RouteLoadingLabel } from "@/components/patterns/route-loading-label";
import type { ReactNode } from "react";

/**
 * Route fallbacks for `loading.tsx`. Each mirrors the Container size and spacing of the real page so
 * the swap does not shift the layout. Blocks are `aria-hidden`; only the localized status text is read.
 */
function PageSkeleton({ name, size, children }: { name: string; size: ContainerSize; children: ReactNode }) {
  return (
    <Container size={size} name={name} className="py-12" role="status" aria-busy="true">
      <RouteLoadingLabel />
      {children}
    </Container>
  );
}

function HeaderSkeleton({ withDescription }: { withDescription: boolean }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-10 w-3/4" />
      {withDescription ? <Skeleton className="h-6 w-full max-w-xl" /> : null}
    </div>
  );
}

export function ProductPageSkeleton() {
  return (
    <PageSkeleton name="ProductPageSkeleton" size="sm">
      <HeaderSkeleton withDescription />
      <div className="mt-8 space-y-6">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <Skeleton className="h-8 w-32" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-11 w-full rounded-lg sm:w-48" />
      </div>
    </PageSkeleton>
  );
}

export function CollectionPageSkeleton() {
  return (
    <PageSkeleton name="CollectionPageSkeleton" size="lg">
      <HeaderSkeleton withDescription />
      <ul className="mt-10 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="overflow-hidden rounded-xl border border-border">
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </li>
        ))}
      </ul>
    </PageSkeleton>
  );
}

export function AccountPageSkeleton() {
  return (
    <PageSkeleton name="AccountPageSkeleton" size="sm">
      <HeaderSkeleton withDescription={false} />
      <div className="mt-8 space-y-10">
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-48" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </PageSkeleton>
  );
}
