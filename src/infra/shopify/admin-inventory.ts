import { logError } from "@/infra/observability/log-error";
import { SHOPIFY_ADMIN_API_VERSION } from "@/infra/shopify/api-version";
import { resolveAdminAccessToken } from "@/lib/shopify/admin-access-token";

/** Needs `read_inventory` + `read_products` (already in `shopify.app.toml`). */
const INVENTORY_ITEM_PRODUCT_QUERY = /* GraphQL */ `
  query InventoryItemProduct($id: ID!) {
    inventoryItem(id: $id) {
      variant {
        product { handle }
      }
    }
  }
`;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

/** Product handle for an `inventory_levels/update` payload; `null` on any failure. */
export async function productHandleForInventoryItem(inventoryItemId: string): Promise<string | null> {
  if (!/^\d+$/.test(inventoryItemId)) return null;
  const auth = await resolveAdminAccessToken();
  if (!auth.ok) return null;

  try {
    const response = await fetch(`https://${auth.domain}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/graphql.json`, {
      method: "POST",
      headers: { "content-type": "application/json", "X-Shopify-Access-Token": auth.token },
      body: JSON.stringify({
        query: INVENTORY_ITEM_PRODUCT_QUERY,
        variables: { id: `gid://shopify/InventoryItem/${inventoryItemId}` },
      }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const json: unknown = await response.json().catch(() => null);
    const item = asRecord(asRecord(asRecord(json)?.data)?.inventoryItem);
    const handle = asRecord(asRecord(item?.variant)?.product)?.handle;
    return typeof handle === "string" && handle.trim() ? handle.trim() : null;
  } catch (err) {
    logError("shopify.admin-inventory", "Admin GraphQL failed", { error: err });
    return null;
  }
}
