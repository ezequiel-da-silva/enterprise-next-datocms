export const LOW_STOCK_THRESHOLD = 5;

/** Storefront `quantityAvailable` is null when inventory tracking is off. */
export function shouldShowLowStock(quantityAvailable: number | null | undefined): quantityAvailable is number {
  return (
    typeof quantityAvailable === "number" &&
    Number.isFinite(quantityAvailable) &&
    quantityAvailable > 0 &&
    quantityAvailable <= LOW_STOCK_THRESHOLD
  );
}
