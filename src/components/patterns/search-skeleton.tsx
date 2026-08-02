import { Skeleton } from "@/components/atoms/skeleton";

export function SearchSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando resultados" className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}
