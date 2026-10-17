import { Client } from "datocms/lib/cma-client-node";

/**
 * Campo `pdp_low_stock` no singleton `ui_string` (mensagem de estoque baixo na PDP).
 * Placeholder: `{count}`. Vazio = texto padrão em `src/lib/i18n/pdp-copy.ts`.
 *
 * Depois de aplicar: adicionar `pdpLowStock` a `UI_STRINGS_FIELD_NAMES` em
 * `src/lib/i18n/ui-strings-fields.ts`, rodar `npm run codegen:from-dato`, e preencher no admin se quiser.
 */

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

export default async function pdpLowStockUiString(client: Client): Promise<void> {
  const model = await client.itemTypes.find("ui_string");
  const fieldsets = await client.fieldsets.list(model.id);
  const cartFieldset = fieldsets.find((fs) => fs.title === "🛒 Cart");
  const payload = {
    label: "PDP low stock message",
    hint: "Use {count} para a quantidade. Deixe vazio para usar o texto padrão do site.",
    field_type: "string" as const,
    localized: true as const,
    validators: { length: { max: 160 } },
    appearance: { editor: "single_line", parameters: { heading: false, placeholder: null }, addons: [] },
  };
  const existing = await findField(client, "ui_string::pdp_low_stock");
  if (existing) {
    await client.fields.update(existing.id, payload);
  } else {
    await client.fields.create(model.id, {
      ...payload,
      api_key: "pdp_low_stock",
      fieldset: cartFieldset ? { type: "fieldset", id: cartFieldset.id } : undefined,
    });
  }
}
