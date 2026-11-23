/**
 * Editor gates on `product_page` snowboard fields:
 * - Fieldset "Snowboard specs" with Shopify boundary hint
 * - `draft_saving_active` so incomplete drafts can save
 * - `required` on profile, flex, terrain, rider_level, size_chart (publish fails without them)
 *
 * Idempotent. Requires fields from `setup-snowboard-specs-model.ts`.
 *
 *   npx datocms cma:script scripts/setup-product-page-publish-gates.ts --profile=staging
 */
import { ApiError } from "@datocms/cma-client-node";
import type { Client } from "datocms/lib/cma-client-node";

const MODEL = "product_page";
const FIELDSET_TITLE = "Snowboard specs";
const FIELDSET_HINT =
  "Ficha técnica da prancha. Preço e stock moram na Shopify — não os duplique aqui. Obrigatório para publicar.";

const REQUIRED_FIELDS = ["profile", "flex", "terrain", "rider_level", "size_chart"] as const;
const OPTIONAL_IN_SET = ["core_material", "badge", "base_image"] as const;

async function findField(client: Client, apiKey: string) {
  try {
    return await client.fields.find(`${MODEL}::${apiKey}`);
  } catch (error) {
    if (error instanceof ApiError && (error.response.status === 404 || error.response.status === 422)) {
      return null;
    }
    throw error;
  }
}

export default async function setupProductPagePublishGates(client: Client): Promise<void> {
  const site = await client.site.find();
  console.log(`Site ${site.id} (${site.name})`);

  const model = await client.itemTypes.find(MODEL);
  await client.itemTypes.update(model.id, {
    draft_mode_active: true,
    draft_saving_active: true,
    hint:
      "Copy editorial + specs snowboard. Preço, stock e imagens de catálogo: Shopify. Specs + size_chart são obrigatórios para publicar (drafts podem ficar incompletos).",
  });
  console.log(`  draft_saving_active=true`);

  const fieldsets = await client.fieldsets.list(model.id);
  let fieldset = fieldsets.find((fs) => fs.title === FIELDSET_TITLE);
  if (!fieldset) {
    fieldset = await client.fieldsets.create(model.id, {
      title: FIELDSET_TITLE,
      hint: FIELDSET_HINT,
      collapsible: true,
      start_collapsed: false,
    });
    console.log(`  fieldset criado: ${FIELDSET_TITLE}`);
  } else {
    await client.fieldsets.update(fieldset.id, { hint: FIELDSET_HINT });
    console.log(`  fieldset ok: ${FIELDSET_TITLE}`);
  }

  for (const apiKey of [...REQUIRED_FIELDS, ...OPTIONAL_IN_SET]) {
    const field = await findField(client, apiKey);
    if (!field) {
      console.log(`  skip missing ${apiKey} (corra setup-snowboard-specs-model.ts)`);
      continue;
    }

    const isRequired = (REQUIRED_FIELDS as readonly string[]).includes(apiKey);
    const hintExtra =
      apiKey === "size_chart"
        ? " Obrigatório para publicar. JSON: [{ length, riderWeightKg, waistWidthMm }]."
        : " Obrigatório para publicar.";
    const hint = `${field.hint?.trim() || apiKey}.${isRequired ? hintExtra : ""} Preço/stock: Shopify.`.trim();

    if (isRequired) {
      await client.fields.update(field.id, {
        fieldset: { type: "fieldset", id: fieldset.id },
        hint,
        validators: { ...(field.validators ?? {}), required: {} },
      });
    } else {
      await client.fields.update(field.id, {
        fieldset: { type: "fieldset", id: fieldset.id },
        hint,
      });
    }
    console.log(`  gated ${apiKey}`);
  }
}
