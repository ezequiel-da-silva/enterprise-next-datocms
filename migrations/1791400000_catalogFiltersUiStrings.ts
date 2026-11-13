import { Client } from "datocms/lib/cma-client-node";

/**
 * Chrome de filtros do catálogo no singleton `ui_string`.
 * Campo vazio = texto padrão em `src/lib/i18n/catalog-filters-copy.ts`.
 *
 * Seed após aplicar (só campos vazios):
 *   npx datocms cma:script scripts/seed-ui-strings.ts --profile=staging|default
 */

type Spec = { key: string; label: string; multiline?: boolean; hint?: string };

const FIELDS: Spec[] = [
  { key: "catalog_clear_filters", label: "Catalog clear filters" },
  { key: "catalog_in_stock_only", label: "Catalog in stock only" },
  { key: "catalog_sort_label", label: "Catalog sort label" },
  { key: "catalog_sort_relevance", label: "Catalog sort relevance" },
  { key: "catalog_sort_price_asc", label: "Catalog sort price ascending" },
  { key: "catalog_sort_price_desc", label: "Catalog sort price descending" },
  {
    key: "catalog_results_template",
    label: "Catalog results template",
    hint: "Use {count}.",
  },
  {
    key: "catalog_filters_empty",
    label: "Catalog filters empty",
    multiline: true,
  },
  { key: "catalog_terrain_label", label: "Catalog terrain label" },
  { key: "catalog_profile_label", label: "Catalog profile label" },
];

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

function stringPayload(spec: Spec) {
  const hint = [spec.hint, "Deixe vazio para usar o texto padrão do site."].filter(Boolean).join(" ");
  return spec.multiline
    ? {
        label: spec.label,
        hint,
        field_type: "text" as const,
        localized: true as const,
        validators: { length: { max: 400 } },
        appearance: { editor: "textarea", parameters: { placeholder: null }, addons: [] },
      }
    : {
        label: spec.label,
        hint,
        field_type: "string" as const,
        localized: true as const,
        validators: { length: { max: 160 } },
        appearance: { editor: "single_line", parameters: { heading: false, placeholder: null }, addons: [] },
      };
}

export default async function catalogFiltersUiStrings(client: Client): Promise<void> {
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
