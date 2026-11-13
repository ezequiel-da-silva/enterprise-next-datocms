import { Client } from "datocms/lib/cma-client-node";

/**
 * Microcopy PT de pagamento na buy box (`ui_string.pdp_payment_hint`).
 * Campo vazio = texto padrão em `src/lib/i18n/pdp-copy.ts` (só PT tem default).
 *
 * Seed após aplicar (só campos vazios):
 *   npx datocms cma:script scripts/seed-ui-strings.ts --profile=staging|default
 */

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

export default async function pdpPaymentHintUiString(client: Client): Promise<void> {
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

  const payload = {
    label: "Payment hint (PT buy box)",
    hint: "Só mostrado em /pt. Sem taxas inventadas — remete ao checkout Shopify (PIX/parcelas se activos). Vazio = texto padrão do código.",
    field_type: "string" as const,
    localized: true as const,
    validators: { length: { max: 220 } },
    appearance: { editor: "single_line", parameters: { heading: false, placeholder: null }, addons: [] },
  };

  const existing = await findField(client, "ui_string::pdp_payment_hint");
  if (existing) {
    await client.fields.update(existing.id, payload);
  } else {
    await client.fields.create(model.id, {
      ...payload,
      api_key: "pdp_payment_hint",
      fieldset: { type: "fieldset", id: fieldset.id },
    });
  }
}
