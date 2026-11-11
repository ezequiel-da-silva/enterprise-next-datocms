import { Client } from "datocms/lib/cma-client-node";

/**
 * Textos da ficha de snowboard na PDP (`ui_string`).
 * Campo vazio = texto padrão em `src/lib/i18n/pdp-copy.ts`.
 *
 * Os api keys entram em `UI_STRINGS_FIELD_NAMES`. O teste
 * `ui-strings-fields.test.ts` falha se divergirem.
 */

type Spec = { key: string; label: string };

const FIELDS: Spec[] = [
  { key: "pdp_in_stock", label: "In stock" },
  { key: "pdp_sold_out", label: "Sold out" },
  { key: "pdp_view_image", label: "View image" },
  { key: "pdp_unavailable_suffix", label: "Unavailable option suffix" },
  { key: "pdp_checkout_trust", label: "Secure checkout note" },
  { key: "pdp_spec_profile", label: "Spec: camber profile" },
  { key: "pdp_spec_flex", label: "Spec: flex" },
  { key: "pdp_spec_terrain", label: "Spec: terrain" },
  { key: "pdp_spec_rider_level", label: "Spec: rider level" },
  { key: "pdp_spec_core", label: "Spec: core material" },
  { key: "pdp_size_guide_summary", label: "Size guide summary" },
  { key: "pdp_size_length", label: "Size guide: length" },
  { key: "pdp_size_weight", label: "Size guide: rider weight" },
  { key: "pdp_size_waist", label: "Size guide: waist width" },
];

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

function stringPayload(spec: Spec) {
  return {
    label: spec.label,
    hint: "Deixe vazio para usar o texto padrão do site.",
    field_type: "string" as const,
    localized: true as const,
    validators: { length: { max: 160 } },
    appearance: { editor: "single_line", parameters: { heading: false, placeholder: null }, addons: [] },
  };
}

export default async function pdpSnowboardUiStrings(client: Client): Promise<void> {
  const model = await client.itemTypes.find("ui_string");
  const fieldsets = await client.fieldsets.list(model.id);
  const fieldset =
    fieldsets.find((fs) => fs.title === "🏂 PDP") ??
    (await client.fieldsets.create(model.id, {
      title: "🏂 PDP",
      hint: "Ficha da prancha, stock e nota de checkout. Vazio = texto padrão do código.",
      collapsible: true,
      start_collapsed: false,
    }));

  for (const spec of FIELDS) {
    const payload = stringPayload(spec);
    const existing = await findField(client, `ui_string::${spec.key}`);
    if (existing) {
      await client.fields.update(existing.id, payload);
    } else {
      await client.fields.create(model.id, {
        ...payload,
        api_key: spec.key,
        fieldset: { type: "fieldset", id: fieldset.id },
      });
    }
  }
}
