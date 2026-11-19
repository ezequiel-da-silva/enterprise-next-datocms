import { Client } from "datocms/lib/cma-client-node";

/**
 * Header announcement + footer trust strings on `ui_string`.
 *
 * Seed empty fields:
 *   npx datocms cma:script scripts/seed-ui-strings.ts --profile=staging|default
 */

type Spec = { key: string; label: string; hint?: string };

const FIELDS: Spec[] = [
  {
    key: "chrome_announcement_free_shipping",
    label: "Chrome announcement free shipping",
    hint: "Use {amount} for the formatted threshold. Empty = code default.",
  },
  {
    key: "chrome_announcement_free_shipping_flat",
    label: "Chrome announcement free shipping flat",
    hint: "Shown when shipping rate is free and no threshold is set.",
  },
  {
    key: "chrome_announcement_returns",
    label: "Chrome announcement returns",
    hint: "Fallback trust line when free shipping is not advertised.",
  },
  {
    key: "footer_brand_tagline",
    label: "Footer brand tagline",
    hint: "Short positioning sentence under the footer logo.",
  },
  {
    key: "footer_secure_checkout",
    label: "Footer secure checkout",
    hint: "Checkout trust note (e.g. Shopify).",
  },
  {
    key: "footer_payments_label",
    label: "Footer payments label",
    hint: "Accessible name for the payment method badges row.",
  },
];

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

export default async function chromeFooterUiStrings(client: Client): Promise<void> {
  const model = await client.itemTypes.find("ui_string");
  const fieldsets = await client.fieldsets.list(model.id);
  const fieldset =
    fieldsets.find((fs) => fs.title === "Chrome & footer") ??
    (await client.fieldsets.create(model.id, {
      title: "Chrome & footer",
      hint: "Header announcement strip and footer trust copy.",
      collapsible: true,
      start_collapsed: false,
    }));

  for (const spec of FIELDS) {
    const pointer = `ui_string::${spec.key}`;
    if (await findField(client, pointer)) {
      console.log(`  já existe: ${pointer}`);
      continue;
    }
    await client.fields.create(model.id, {
      label: spec.label,
      api_key: spec.key,
      field_type: "string",
      localized: true,
      fieldset: { type: "fieldset", id: fieldset.id },
      hint: spec.hint ?? null,
      validators: { length: { max: 200 } },
      appearance: { editor: "single_line", parameters: { heading: false, placeholder: null }, addons: [] },
    });
    console.log(`  criado: ${pointer}`);
  }
}
