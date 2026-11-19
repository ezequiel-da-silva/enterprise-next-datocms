import { Client } from "datocms/lib/cma-client-node";

/**
 * Cart free-shipping meter + recently viewed headings on `ui_string`.
 *
 * Seed empty fields:
 *   npx datocms cma:script scripts/seed-ui-strings.ts --profile=staging|default
 */

type Spec = { key: string; label: string; hint?: string };

const FIELDS: Spec[] = [
  {
    key: "cart_free_shipping_remaining",
    label: "Cart free shipping remaining",
    hint: "Use {amount} for the formatted money still needed. Empty = code default.",
  },
  {
    key: "cart_free_shipping_unlocked",
    label: "Cart free shipping unlocked",
    hint: "Shown when the cart subtotal meets the free_shipping_threshold.",
  },
  {
    key: "cart_recently_viewed_title",
    label: "Recently viewed title",
    hint: "Heading for recently viewed products (cart empty / PDP).",
  },
];

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

export default async function cartFreeShippingUiStrings(client: Client): Promise<void> {
  const model = await client.itemTypes.find("ui_string");
  const fieldsets = await client.fieldsets.list(model.id);
  const fieldset =
    fieldsets.find((fs) => fs.title === "Cart") ??
    (await client.fieldsets.create(model.id, {
      title: "Cart",
      hint: "Quick cart drawer and cart page copy.",
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
