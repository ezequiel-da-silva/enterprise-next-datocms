import { cn } from "@/lib/cn";
import type { ComponentPropsWithoutRef } from "react";

type SkeletonProps = ComponentPropsWithoutRef<"span">;

export function Skeleton({ className, "aria-hidden": ariaHidden = true, ...props }: SkeletonProps) {
  return (
    <span
      className={cn("block animate-pulse rounded-md bg-muted", className)}
      aria-hidden={ariaHidden}
      {...props}
    />
  );
}
