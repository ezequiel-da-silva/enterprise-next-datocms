import { HomeCmsSkeleton } from "@/components/patterns/home-cms-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <HomeCmsSkeleton />
    </div>
  );
}
