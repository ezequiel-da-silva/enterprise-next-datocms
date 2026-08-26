"use client";

import type { ReviewFormProps } from "@/components/molecules/review-form";
import dynamic from "next/dynamic";

/**
 * Folha cliente importada de forma estática pelo bloco RSC (a página continua SSG).
 * `next/dynamic` aqui — não no router ST nem no Server Component — parte
 * react-hook-form + Zod para um chunk próprio.
 */
const ReviewForm = dynamic(
  () => import("@/components/molecules/review-form").then((mod) => mod.ReviewForm),
  {
    ssr: true,
    loading: () => (
      <div
        className="mx-auto min-h-[28rem] max-w-xl rounded-2xl border border-border bg-card p-6 shadow-sm"
        aria-hidden
      />
    ),
  },
);

export function ReviewFormLazy(props: ReviewFormProps) {
  return <ReviewForm {...props} />;
}
