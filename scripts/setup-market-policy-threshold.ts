/**
 * Adds optional `free_shipping_threshold` on `market_policy`.
 *
 * Idempotent: creates the field only when missing.
 *
 *   npx datocms cma:script scripts/setup-market-policy-threshold.ts --profile=staging
 *   npx datocms cma:script scripts/setup-market-policy-threshold.ts --profile=default
 */
import { ApiError, type ApiTypes } from "@datocms/cma-client-node";
import type { Client } from "datocms/lib/cma-client-node";

const MODEL = "market_policy";
const API_KEY = "free_shipping_threshold";

async function fieldExists(client: Client): Promise<boolean> {
  try {
    await client.fields.find(`${MODEL}::${API_KEY}`);
    return true;
  } catch (error) {
    if (error instanceof ApiError && (error.response.status === 404 || error.response.status === 422)) {
      return false;
    }
    throw error;
  }
}

export default async function setupMarketPolicyThreshold(client: Client): Promise<void> {
  const site = await client.site.find();
  console.log(`Site ${site.id} (${site.name})`);

  const model = await client.itemTypes.find(MODEL);
  if (await fieldExists(client)) {
    console.log(`  campo já existe: ${MODEL}::${API_KEY}`);
    return;
  }

  const body: ApiTypes.FieldCreateSchema = {
    label: "Free shipping threshold",
    api_key: API_KEY,
    field_type: "float",
    localized: false,
    hint: "Minimum cart subtotal (in this market currency) for free shipping. Leave empty to skip the progress meter.",
    validators: { number_range: { min: 0 } },
    appearance: { editor: "float", parameters: {}, addons: [] },
  };

  try {
    await client.fields.create(model.id, body);
    console.log(`  campo criado: ${MODEL}::${API_KEY}`);
  } catch (error) {
    if (error instanceof ApiError && error.response.status === 422) {
      console.log(`  campo já existe (422): ${MODEL}::${API_KEY}`);
      return;
    }
    throw error;
  }
}
