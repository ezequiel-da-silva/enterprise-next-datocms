import { Skeleton } from "@/components/atoms/skeleton";

export function HomeCmsSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Carregando conteúdo do CMS"
      className="rounded-lg border border-border p-6"
    >
      <Skeleton className="h-6 w-48" />
      <Skeleton className="mt-4 h-4 w-full max-w-md" />
      <Skeleton className="mt-2 h-4 w-full max-w-sm" />
    </section>
  );
}
