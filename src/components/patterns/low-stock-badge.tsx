import { shouldShowLowStock } from "@/lib/shopify/low-stock";

type LowStockBadgeProps = {
  quantityAvailable: number | null | undefined;
  message: string;
};

export function LowStockBadge({ quantityAvailable, message }: LowStockBadgeProps) {
  if (!shouldShowLowStock(quantityAvailable)) return null;
  return (
    <p className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400" role="status">
      <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
      {message}
    </p>
  );
}
