import { Client } from "datocms/lib/cma-client-node";

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

/**
 * Remove `body` (ST só-Dato, redundante). `lead` → `description` (texto, Shopify ↔ Dato).
 * Fieldset Editorial → Shopify content (title + description).
 */
export default async function productPageDropBodyRenameLeadToDescription(client: Client): Promise<void> {
  const productPage = await client.itemTypes.find("product_page");

  await client.itemTypes.update(productPage.id, {
    hint: "Ficha sincronizada da Shopify (webhook). Title e description (texto) nos dois sentidos; SEO no Dato. Preço, stock, imagem e checkout: Storefront. URL: /{locale}/products/{shopify_handle}.",
  });

  const body = await findField(client, "product_page::body");
  if (body) {
    await client.fields.destroy(body.id);
  }

  const fieldsets = await client.fieldsets.list(productPage.id);
  const copySet =
    fieldsets.find((fs) => fs.title === "Shopify content") ??
    fieldsets.find((fs) => fs.title === "Editorial") ??
    (await client.fieldsets.create(productPage.id, {
      title: "Shopify content",
      hint: "Título e descrição: Dato ↔ Shopify. Traduzir pt-BR e es aqui.",
      collapsible: false,
      start_collapsed: false,
    }));

  if (copySet.title !== "Shopify content") {
    await client.fieldsets.update(copySet.id, {
      title: "Shopify content",
      hint: "Título e descrição: Dato ↔ Shopify. Traduzir pt-BR e es aqui.",
    });
  }

  const descriptionExisting =
    (await findField(client, "product_page::description")) ?? (await findField(client, "product_page::lead"));
  if (descriptionExisting) {
    await client.fields.update(descriptionExisting.id, {
      api_key: "description",
      label: "Description",
      hint: "Descrição do produto (texto simples). Locale en sincroniza com a Descrição da Shopify; pt-BR e es via Translations. O HTML da Admin é convertido a texto.",
      fieldset: { id: copySet.id, type: "fieldset" },
    });
  }

  const title = await findField(client, "product_page::title");
  if (title) {
    await client.fields.update(title.id, {
      fieldset: { id: copySet.id, type: "fieldset" },
    });
  }

  const seo = await findField(client, "product_page::seo");
  if (seo) {
    await client.fields.update(seo.id, {
      hint: "Meta da ficha neste idioma. Vazio usa o título + description. Imagem OG opcional; senão o Next usa a featured image da Shopify.",
    });
  }
}
