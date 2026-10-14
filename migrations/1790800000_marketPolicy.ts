import { Client } from "datocms/lib/cma-client-node";

/**
 * Modelo `market_policy`: política de frete e devolução por mercado (um registo por país).
 * Alimenta `Offer.shippingDetails` e `Offer.hasMerchantReturnPolicy` no JSON-LD do produto
 * (substitui as variáveis `SEO_*`).
 *
 * Os valores TÊM de bater com o checkout e com as páginas de política da Shopify: o Google
 * compara o JSON-LD com a página. Campo opcional vazio omite o bloco correspondente.
 *
 * Os api keys espelham `MARKET_POLICY_FIELDS` em `src/lib/seo/merchant-policy.ts`; `merchant-policy.test.ts` guarda a paridade.
 */

const COUNTRIES = ["US", "BR", "ES"] as const;
const SHOPIFY_MATCH = "Tem de bater com o checkout e as políticas da Shopify.";

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

async function findOrCreateModel(client: Client, apiKey: string, name: string, hint: string) {
  try {
    const existing = await client.itemTypes.find(apiKey);
    await client.itemTypes.update(existing.id, { name, hint });
    return existing;
  } catch {
    return client.itemTypes.create({
      name,
      api_key: apiKey,
      modular_block: false,
      draft_mode_active: true,
      collection_appearance: "table",
      hint,
    });
  }
}

function integerField(label: string, hint: string, min: number, max: number) {
  return {
    label,
    hint,
    field_type: "integer" as const,
    localized: false as const,
    validators: { number_range: { min, max } },
    appearance: { editor: "integer", parameters: { placeholder: null }, addons: [] },
  };
}

async function upsertField(client: Client, modelId: string, apiKey: string, fieldsetId: string | null, payload: object) {
  const existing = await findField(client, `market_policy::${apiKey}`);
  if (existing) return client.fields.update(existing.id, payload as never);
  return client.fields.create(modelId, {
    ...payload,
    api_key: apiKey,
    ...(fieldsetId ? { fieldset: { type: "fieldset" as const, id: fieldsetId } } : {}),
  } as never);
}

export default async function marketPolicy(client: Client): Promise<void> {
  const model = await findOrCreateModel(
    client,
    "market_policy",
    "🚚 Market policy",
    "Frete e devolução por país, usados no JSON-LD do produto (rich results). Um registo por país. Deve refletir exatamente o checkout da Shopify.",
  );

  const fieldsets = await client.fieldsets.list(model.id);
  const ensureFieldset = async (title: string, hint: string) =>
    fieldsets.find((fs) => fs.title === title) ??
    client.fieldsets.create(model.id, { title, hint, collapsible: false, start_collapsed: false });

  const shipping = await ensureFieldset("📦 Shipping", "Opcional: sem taxa ou sem prazos, o bloco de envio não é publicado.");
  const returns = await ensureFieldset("↩️ Returns", "Opcional: sem prazo ou sem quem paga, o bloco de devolução não é publicado.");

  // `country` sits outside the fieldsets so it is the first thing editors see.
  const country = await upsertField(client, model.id, "country", null, {
    label: "Country",
    hint: "Mercado Shopify (código ISO). Um registo por país.",
    field_type: "string" as const,
    localized: false as const,
    validators: {
      required: {},
      unique: {},
      enum: { values: [...COUNTRIES] },
    },
    appearance: {
      editor: "string_select",
      parameters: {
        options: [
          { label: "United States (US)", value: "US", hint: "Mercado em inglês" },
          { label: "Brasil (BR)", value: "BR", hint: "Mercado em português" },
          { label: "España (ES)", value: "ES", hint: "Mercado em espanhol" },
        ],
      },
      addons: [],
    },
  });
  await client.itemTypes.update(model.id, { presentation_title_field: { type: "field", id: country.id } });

  await upsertField(client, model.id, "shipping_rate", shipping.id, {
    label: "Shipping rate",
    hint: `Valor do frete na moeda da oferta do mercado (ex.: 9.90). 0 = frete grátis. ${SHOPIFY_MATCH}`,
    field_type: "float" as const,
    localized: false as const,
    validators: { number_range: { min: 0, max: 10000 } },
    appearance: { editor: "float", parameters: { placeholder: null }, addons: [] },
  });
  await upsertField(
    client,
    model.id,
    "handling_days_min",
    shipping.id,
    integerField("Handling days (min)", "Dias úteis para preparar o pedido (mínimo).", 0, 60),
  );
  await upsertField(
    client,
    model.id,
    "handling_days_max",
    shipping.id,
    integerField("Handling days (max)", "Máximo. Vazio = igual ao mínimo.", 0, 60),
  );
  await upsertField(
    client,
    model.id,
    "transit_days_min",
    shipping.id,
    integerField("Transit days (min)", "Dias de transporte (mínimo).", 0, 60),
  );
  await upsertField(
    client,
    model.id,
    "transit_days_max",
    shipping.id,
    integerField("Transit days (max)", "Máximo. Vazio = igual ao mínimo.", 0, 60),
  );

  await upsertField(
    client,
    model.id,
    "return_days",
    returns.id,
    integerField("Return window (days)", `Prazo para devolução em dias. ${SHOPIFY_MATCH}`, 1, 365),
  );
  await upsertField(client, model.id, "return_fees", returns.id, {
    label: "Who pays return shipping",
    hint: `Quem paga o frete da devolução. ${SHOPIFY_MATCH}`,
    field_type: "string" as const,
    localized: false as const,
    validators: { enum: { values: ["free", "customer"] } },
    appearance: {
      editor: "string_select",
      parameters: {
        options: [
          { label: "Free returns (store pays)", value: "free", hint: "Devolução grátis para o cliente" },
          { label: "Customer pays", value: "customer", hint: "O cliente arca com o frete da devolução" },
        ],
      },
      addons: [],
    },
  });
}
