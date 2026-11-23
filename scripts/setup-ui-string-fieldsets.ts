/**
 * Consolidates `ui_string` fieldsets for editor ergonomics.
 *
 * Targets:
 * - 🛒 Cart — all `cart_*` (+ free-shipping meter)
 * - Checkout & trust — `pdp_checkout_trust`, `pdp_payment_hint`
 * - 🌐 Global chrome — announcement + footer trust (renames Chrome & footer)
 * - 🏂 PDP — stock/spec labels; moves `pdp_low_stock` out of Cart
 *
 * Idempotent fieldset create + field reassignment.
 *
 *   npx datocms cma:script scripts/setup-ui-string-fieldsets.ts --profile=staging
 */
import { ApiError } from "@datocms/cma-client-node";
import type { Client } from "datocms/lib/cma-client-node";

const MODEL = "ui_string";

type FieldsetSpec = {
  title: string;
  hint: string;
  aliases?: string[];
  fields: string[];
};

const GROUPS: FieldsetSpec[] = [
  {
    title: "🛒 Cart",
    hint: "Copy do drawer/página do carrinho. Preço e stock vêm da Shopify — estes textos só rotulam a UI.",
    aliases: ["Cart"],
    fields: [
      "cart_title",
      "cart_add_to_cart",
      "cart_adding",
      "cart_added",
      "cart_view_cart",
      "cart_sold_out",
      "cart_error_generic",
      "cart_error_rate_limit",
      "cart_empty",
      "cart_continue_shopping",
      "cart_quantity",
      "cart_each",
      "cart_update",
      "cart_remove",
      "cart_subtotal",
      "cart_checkout",
      "cart_checkout_note",
      "cart_checkout_unavailable",
      "cart_close_drawer",
      "cart_free_shipping_remaining",
      "cart_free_shipping_unlocked",
      "cart_recently_viewed_title",
      "cart_link_label_one",
      "cart_link_label_other",
    ],
  },
  {
    title: "Checkout & trust",
    hint: "Microcopy de confiança no buy box / checkout. Não inventar taxas — Shopify Payments mostra as reais.",
    fields: ["pdp_checkout_trust", "pdp_payment_hint"],
  },
  {
    title: "🌐 Global chrome",
    hint: "Announcement strip e rodapé. Frete/threshold vêm de market_policy.",
    aliases: ["Chrome & footer"],
    fields: [
      "chrome_announcement_free_shipping",
      "chrome_announcement_free_shipping_flat",
      "chrome_announcement_returns",
      "footer_brand_tagline",
      "footer_payments_label",
      "footer_secure_checkout",
    ],
  },
  {
    title: "🏂 PDP",
    hint: "Rótulos da ficha de produto. Specs e size_chart moram em product_page; preço/stock na Shopify.",
    fields: ["pdp_low_stock"],
  },
];

async function ensureFieldset(
  client: Client,
  modelId: string,
  title: string,
  hint: string,
  aliases: string[] = [],
) {
  const list = await client.fieldsets.list(modelId);
  const byTitle = list.find((fs) => fs.title === title);
  if (byTitle) {
    if (byTitle.hint !== hint) {
      await client.fieldsets.update(byTitle.id, { hint, collapsible: true });
    }
    console.log(`  fieldset ok: ${title}`);
    return byTitle.id;
  }
  const byAlias = list.find((fs) => aliases.includes(fs.title));
  if (byAlias) {
    await client.fieldsets.update(byAlias.id, { title, hint, collapsible: true });
    console.log(`  fieldset renomeado → ${title}`);
    return byAlias.id;
  }
  const created = await client.fieldsets.create(modelId, {
    title,
    hint,
    collapsible: true,
    start_collapsed: false,
  });
  console.log(`  fieldset criado: ${title}`);
  return created.id;
}

async function moveField(client: Client, apiKey: string, fieldsetId: string) {
  try {
    const field = await client.fields.find(`${MODEL}::${apiKey}`);
    const currentId =
      field.fieldset && typeof field.fieldset === "object" && "id" in field.fieldset
        ? String((field.fieldset as { id: string }).id)
        : null;
    if (currentId === fieldsetId) return;
    await client.fields.update(field.id, {
      fieldset: { type: "fieldset", id: fieldsetId },
    });
    console.log(`  moved ${apiKey}`);
  } catch (error) {
    if (error instanceof ApiError && (error.response.status === 404 || error.response.status === 422)) {
      console.log(`  skip missing ${apiKey}`);
      return;
    }
    throw error;
  }
}

export default async function setupUiStringFieldsets(client: Client): Promise<void> {
  const site = await client.site.find();
  console.log(`Site ${site.id} (${site.name})`);
  const model = await client.itemTypes.find(MODEL);

  await client.itemTypes.update(model.id, {
    hint:
      "Textos de interface. Deixe vazio para o fallback do código. Preço, stock e frete real moram na Shopify / market_policy — não inventar números aqui.",
  });

  for (const group of GROUPS) {
    const fieldsetId = await ensureFieldset(
      client,
      model.id,
      group.title,
      group.hint,
      group.aliases ?? [],
    );
    for (const apiKey of group.fields) {
      await moveField(client, apiKey, fieldsetId);
    }
  }

  // Drop empty duplicate "Cart" fieldset if present after merge into 🛒 Cart.
  const fieldsets = await client.fieldsets.list(model.id);
  const bareCart = fieldsets.find((fs) => fs.title === "Cart");
  if (bareCart) {
    const fields = await client.fields.list(model.id);
    const stillUsed = fields.some(
      (f) =>
        f.fieldset &&
        typeof f.fieldset === "object" &&
        "id" in f.fieldset &&
        String((f.fieldset as { id: string }).id) === bareCart.id,
    );
    if (!stillUsed) {
      await client.fieldsets.destroy(bareCart.id);
      console.log(`  fieldset removido: Cart (duplicado)`);
    }
  }
}
