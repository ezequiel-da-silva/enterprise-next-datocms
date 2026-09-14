import { Client } from "datocms/lib/cma-client-node";

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

export default async function productPageAndProductsPageLink(client: Client): Promise<void> {
  const page = await client.itemTypes.find("page");
  const globalSetting = await client.itemTypes.find("global_setting");

  const productPage = await findOrCreateModel(
    client,
    "product_page",
    "🛍️ Product page",
    "Ficha sincronizada a partir da Shopify (webhook). Título editorial no Dato; preço, stock e imagem vêm da Storefront API no Next. URL estável: /{locale}/products/{shopify_handle}.",
  );

  const titlePayload = {
    label: "Title",
    hint: "Título da ficha (h1). O webhook preenche todos os idiomas com o título Shopify; podes editar depois.",
    field_type: "string" as const,
    localized: true as const,
    validators: { required: {} },
    appearance: {
      editor: "single_line",
      parameters: { heading: true },
      addons: [],
    },
  };

  const titleExisting = await findField(client, "product_page::title");
  const title = titleExisting
    ? await client.fields.update(titleExisting.id, titlePayload)
    : await client.fields.create(productPage.id, { ...titlePayload, api_key: "title" });

  const handlePayload = {
    label: "Shopify handle",
    hint: "Handle do produto na Shopify (segmento de URL). Único, não localizado. Fonte de verdade: webhook products/create e products/update.",
    field_type: "slug" as const,
    localized: false as const,
    validators: { required: {}, unique: {} },
    appearance: {
      editor: "slug",
      parameters: { url_prefix: null },
      addons: [],
    },
  };

  const handleExisting = await findField(client, "product_page::shopify_handle");
  if (handleExisting) {
    await client.fields.update(handleExisting.id, handlePayload);
  } else {
    await client.fields.create(productPage.id, { ...handlePayload, api_key: "shopify_handle" });
  }

  const shopifyIdPayload = {
    label: "Shopify product ID",
    hint: "ID numérico do produto na Shopify (ex.: 123456789). Único. Usado para upsert no webhook.",
    field_type: "string" as const,
    localized: false as const,
    validators: { required: {}, unique: {} },
    appearance: {
      editor: "single_line",
      parameters: { heading: false },
      addons: [],
    },
  };

  const shopifyIdExisting = await findField(client, "product_page::shopify_product_id");
  if (shopifyIdExisting) {
    await client.fields.update(shopifyIdExisting.id, shopifyIdPayload);
  } else {
    await client.fields.create(productPage.id, { ...shopifyIdPayload, api_key: "shopify_product_id" });
  }

  await client.itemTypes.update(productPage.id, {
    title_field: { id: title.id, type: "field" },
  });

  const productsPagePayload = {
    label: "Products page",
    hint: "Page de catálogo. Título, Hero, conteúdo, SEO e slug vêm desse registo; os PDPs mantêm URLs estáveis em /{locale}/products/{handle}.",
    field_type: "link" as const,
    localized: false as const,
    validators: {
      item_item_type: {
        item_types: [page.id],
        on_publish_with_unpublished_references_strategy: "fail" as const,
        on_reference_unpublish_strategy: "fail" as const,
        on_reference_delete_strategy: "fail" as const,
      },
    },
    appearance: {
      editor: "link_embed",
      parameters: {},
      addons: [],
    },
  };

  const existingProductsPage = await findField(client, "global_setting::products_page");
  if (existingProductsPage) {
    await client.fields.update(existingProductsPage.id, productsPagePayload);
    return;
  }

  await client.fields.create(globalSetting.id, {
    ...productsPagePayload,
    api_key: "products_page",
  });
}
