import { Client } from "datocms/lib/cma-client-node";

/**
 * Size + price facet headings on `ui_string` (catalog filters).
 *
 * Seed após aplicar (só campos vazios):
 *   npx datocms cma:script scripts/seed-ui-strings.ts --profile=staging|default
 */

type Spec = { key: string; label: string; hint?: string };

const FIELDS: Spec[] = [
  {
    key: "catalog_size_label",
    label: "Catalog size label",
    hint: "Facet heading for board length (Size).",
  },
  {
    key: "catalog_price_label",
    label: "Catalog price label",
    hint: "Facet heading for price bands (Price).",
  },
];

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

export default async function catalogSizePriceFacetUiStrings(client: Client): Promise<void> {
  const model = await client.itemTypes.find("ui_string");
  const fieldsets = await client.fieldsets.list(model.id);
  const fieldset =
    fieldsets.find((fs) => fs.title === "Catalog filters") ??
    (await client.fieldsets.create(model.id, {
      title: "Catalog filters",
      hint: "Facets e ordenação nas PLPs / listagens Shopify. Vazio = texto padrão do código.",
      collapsible: true,
      start_collapsed: false,
    }));

  for (const spec of FIELDS) {
    const hint = [spec.hint, "Deixe vazio para usar o texto padrão do site."].filter(Boolean).join(" ");
    const payload = {
      label: spec.label,
      hint,
      field_type: "string" as const,
      localized: true as const,
      validators: { length: { max: 160 } },
      appearance: {
        editor: "single_line",
        parameters: { heading: false, placeholder: null },
        addons: [],
      },
    };
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
