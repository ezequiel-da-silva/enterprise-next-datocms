/**
 * Adds optional Pix cash-discount display field on `market_policy` (BR buy-box hint).
 *
 * Idempotent: creates the field only when missing. Leaves values empty — editors set
 * `pix_discount_percent` to match Shopify Payments; never invent a storefront %.
 *
 *   npx datocms cma:script scripts/setup-market-policy-pix.ts --profile=staging
 *   npx datocms cma:script scripts/setup-market-policy-pix.ts --profile=default
 */
import { ApiError, type ApiTypes } from "@datocms/cma-client-node";
import type { Client } from "datocms/lib/cma-client-node";

const MODEL = "market_policy";
const API_KEY = "pix_discount_percent";

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

export default async function setupMarketPolicyPix(client: Client): Promise<void> {
  const site = await client.site.find();
  console.log(`Site ${site.id} (${site.name})`);

  const model = await client.itemTypes.find(MODEL);

  if (await fieldExists(client)) {
    console.log(`  campo já existe: ${MODEL}::${API_KEY}`);
    return;
  }

  const body = {
    label: "Pix discount percent",
    api_key: API_KEY,
    field_type: "integer" as const,
    localized: false,
    hint: "Optional BR buy-box Pix cash % (1–20). Leave empty to hide the Pix line. Must match Shopify — do not invent.",
    validators: { number_range: { min: 1, max: 20 } },
    appearance: {
      editor: "integer" as const,
      parameters: {},
      addons: [],
    },
  } as ApiTypes.FieldCreateSchema;

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
