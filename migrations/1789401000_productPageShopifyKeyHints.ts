import { Client } from "datocms/lib/cma-client-node";

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

/**
 * Handle e product ID são chaves Shopify (URL / upsert). O editor não deve alterá-los;
 * o token CMA do webhook continua a escrever. Título editorial fica fora deste fieldset.
 */
export default async function productPageShopifyKeyHints(client: Client): Promise<void> {
  const productPage = await client.itemTypes.find("product_page");
  const fieldsets = await client.fieldsets.list(productPage.id);
  const keysFieldset =
    fieldsets.find((fs) => fs.title === "Shopify identifiers") ??
    (await client.fieldsets.create(productPage.id, {
      title: "Shopify identifiers",
      hint: "Preenchido pelo webhook Shopify. Não editar — handle e ID definem a URL do PDP e o upsert.",
      collapsible: true,
      start_collapsed: false,
    }));

  const handle = await findField(client, "product_page::shopify_handle");
  if (handle) {
    await client.fields.update(handle.id, {
      label: "Shopify handle",
      hint: "Não editar. Segmento de URL /{locale}/products/{handle}. Fonte: webhook Shopify (create/update). Alterar aqui não atualiza a Shopify e o próximo webhook pode repor o valor.",
      fieldset: { id: keysFieldset.id, type: "fieldset" },
    });
  }

  const shopifyId = await findField(client, "product_page::shopify_product_id");
  if (shopifyId) {
    await client.fields.update(shopifyId.id, {
      label: "Shopify product ID",
      hint: "Não editar. ID numérico do produto na Shopify. Fonte: webhook. O título editorial (acima) é que sincroniza Dato → Shopify.",
      fieldset: { id: keysFieldset.id, type: "fieldset" },
    });
  }

  const title = await findField(client, "product_page::title");
  if (title) {
    await client.fields.update(title.id, {
      hint: "Título editorial (h1 no site). Locale en sincroniza para o título do produto na Shopify ao publicar. pt-BR e es ficam só no Dato.",
    });
  }
}
