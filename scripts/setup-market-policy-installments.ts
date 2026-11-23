/**
 * Adds optional installment display fields on `market_policy` (BR buy-box hint).
 *
 * Idempotent: creates each field only when missing.
 *
 *   npx datocms cma:script scripts/setup-market-policy-installments.ts --profile=staging
 *   npx datocms cma:script scripts/setup-market-policy-installments.ts --profile=default
 *
 * Suggested BR values: installment_count=10, installment_multiplier=1 (interest-free display).
 * Copy is indicative only — real card rates live in Shopify Payments / checkout.
 */
import { ApiError, type ApiTypes } from "@datocms/cma-client-node";
import type { Client } from "datocms/lib/cma-client-node";

const MODEL = "market_policy";

const FIELDS = [
  {
    api_key: "installment_count" as const,
    label: "Installment count",
    field_type: "integer" as const,
    hint: "Max display installments on the BR PDP (2–12). Leave empty to hide the hint.",
    validators: { number_range: { min: 2, max: 12 } },
  },
  {
    api_key: "installment_multiplier" as const,
    label: "Installment multiplier",
    field_type: "float" as const,
    hint: "Indicative factor on the product price before dividing by count. Use 1 for interest-free display.",
    validators: { number_range: { min: 1 } },
  },
];

async function fieldExists(client: Client, apiKey: string): Promise<boolean> {
  try {
    await client.fields.find(`${MODEL}::${apiKey}`);
    return true;
  } catch (error) {
    if (error instanceof ApiError && (error.response.status === 404 || error.response.status === 422)) {
      return false;
    }
    throw error;
  }
}

export default async function setupMarketPolicyInstallments(client: Client): Promise<void> {
  const site = await client.site.find();
  console.log(`Site ${site.id} (${site.name})`);

  const model = await client.itemTypes.find(MODEL);

  for (const field of FIELDS) {
    if (await fieldExists(client, field.api_key)) {
      console.log(`  campo já existe: ${MODEL}::${field.api_key}`);
      continue;
    }

    const body = {
      label: field.label,
      api_key: field.api_key,
      field_type: field.field_type,
      localized: false,
      hint: field.hint,
      validators: field.validators,
      appearance: {
        editor: field.field_type === "integer" ? ("integer" as const) : ("float" as const),
        parameters: {},
        addons: [],
      },
    } as ApiTypes.FieldCreateSchema;

    try {
      await client.fields.create(model.id, body);
      console.log(`  campo criado: ${MODEL}::${field.api_key}`);
    } catch (error) {
      if (error instanceof ApiError && error.response.status === 422) {
        console.log(`  campo já existe (422): ${MODEL}::${field.api_key}`);
        continue;
      }
      throw error;
    }
  }
}
