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
      all_locales_required: false,
      collection_appearance: "table",
      hint,
    });
  }
}

/**
 * Ficha editorial da coleção Shopify. Membership e grelha ficam na Storefront.
 */
export default async function collectionPageShopifyCopySeo(client: Client): Promise<void> {
  const page = await client.itemTypes.find("page");
  const globalSetting = await client.itemTypes.find("global_setting");

  const collectionPage = await findOrCreateModel(
    client,
    "collection_page",
    "🛍️ Collection page",
    "Ficha sincronizada da Shopify (webhook). Title e description (texto) nos dois sentidos; SEO no Dato. Produtos da coleção: Storefront. URL: /{locale}/collections/{shopify_handle}.",
  );

  const fieldsets = await client.fieldsets.list(collectionPage.id);
  const copySet =
    fieldsets.find((fs) => fs.title === "Shopify content") ??
    (await client.fieldsets.create(collectionPage.id, {
      title: "Shopify content",
      hint: "Título e descrição: Dato ↔ Shopify. Traduzir pt-BR e es aqui.",
      collapsible: false,
      start_collapsed: false,
    }));
  const keysSet =
    fieldsets.find((fs) => fs.title === "Shopify identifiers") ??
    (await client.fieldsets.create(collectionPage.id, {
      title: "Shopify identifiers",
      hint: "Chaves da Shopify. Não editar — o webhook repõe o valor.",
      collapsible: false,
      start_collapsed: false,
    }));
  const seoSet =
    fieldsets.find((fs) => fs.title === "🚀 SEO settings") ??
    (await client.fieldsets.create(collectionPage.id, {
      title: "🚀 SEO settings",
      hint: "Meta da listagem. Vazio usa o título + description.",
      collapsible: false,
      start_collapsed: false,
    }));

  const titlePayload = {
    label: "Title",
    hint: "Título editorial (h1). Locale en sincroniza para a Shopify ao publicar. pt-BR e es também, via Translations API.",
    field_type: "string" as const,
    localized: true as const,
    validators: { required: {} },
    appearance: {
      editor: "single_line",
      parameters: { heading: true },
      addons: [],
    },
  };
  const titleExisting = await findField(client, "collection_page::title");
  const title = titleExisting
    ? await client.fields.update(titleExisting.id, titlePayload)
    : await client.fields.create(collectionPage.id, { ...titlePayload, api_key: "title" });

  const descriptionPayload = {
    label: "Description",
    hint: "Descrição da coleção (texto simples). Locale en sincroniza com a Shopify; pt-BR e es via Translations. O HTML da Admin é convertido a texto.",
    field_type: "text" as const,
    localized: true as const,
    validators: {},
    appearance: {
      editor: "textarea",
      parameters: {},
      addons: [],
    },
  };
  const descriptionExisting = await findField(client, "collection_page::description");
  const description = descriptionExisting
    ? await client.fields.update(descriptionExisting.id, descriptionPayload)
    : await client.fields.create(collectionPage.id, { ...descriptionPayload, api_key: "description" });

  const handlePayload = {
    label: "Shopify handle",
    hint: "Não editar. Segmento de URL /{locale}/collections/{handle}. Fonte: webhook Shopify (collections/create e collections/update).",
    field_type: "slug" as const,
    localized: false as const,
    validators: { required: {}, unique: {} },
    appearance: {
      editor: "slug",
      parameters: { url_prefix: null },
      addons: [],
    },
  };
  const handleExisting = await findField(client, "collection_page::shopify_handle");
  const handle = handleExisting
    ? await client.fields.update(handleExisting.id, handlePayload)
    : await client.fields.create(collectionPage.id, { ...handlePayload, api_key: "shopify_handle" });

  const shopifyIdPayload = {
    label: "Shopify collection ID",
    hint: "Não editar. ID numérico da coleção na Shopify. Fonte: webhook.",
    field_type: "string" as const,
    localized: false as const,
    validators: { required: {}, unique: {} },
    appearance: {
      editor: "single_line",
      parameters: { heading: false },
      addons: [],
    },
  };
  const shopifyIdExisting = await findField(client, "collection_page::shopify_collection_id");
  const shopifyId = shopifyIdExisting
    ? await client.fields.update(shopifyIdExisting.id, shopifyIdPayload)
    : await client.fields.create(collectionPage.id, {
        ...shopifyIdPayload,
        api_key: "shopify_collection_id",
      });

  const seoPayload = {
    label: "SEO",
    hint: "Meta da listagem neste idioma. Vazio usa o título + description. Imagem OG opcional; senão o Next usa a imagem da coleção na Shopify.",
    field_type: "seo" as const,
    localized: true as const,
    validators: {
      title_length: { max: 60 },
      description_length: { max: 160 },
    },
    appearance: {
      editor: "seo",
      parameters: {
        fields: ["title", "description", "image", "no_index", "twitter_card"],
        previews: ["google", "twitter", "facebook", "linkedin", "slack", "telegram", "whatsapp"],
      },
      addons: [],
    },
  };
  const seoExisting = await findField(client, "collection_page::seo");
  const seo = seoExisting
    ? await client.fields.update(seoExisting.id, seoPayload)
    : await client.fields.create(collectionPage.id, { ...seoPayload, api_key: "seo" });

  await client.itemTypes.update(collectionPage.id, {
    title_field: { id: title.id, type: "field" },
  });

  const fieldsetRef = (id: string) => ({ data: { id, type: "fieldset" as const } });
  await client.itemTypes.rawReorderFieldsAndFieldsets(collectionPage.id, {
    data: [
      { id: copySet.id, type: "fieldset" as const, attributes: { position: 1 } },
      { id: keysSet.id, type: "fieldset" as const, attributes: { position: 2 } },
      { id: seoSet.id, type: "fieldset" as const, attributes: { position: 3 } },
      {
        id: title.id,
        type: "field" as const,
        attributes: { position: 0 },
        relationships: { fieldset: fieldsetRef(copySet.id) },
      },
      {
        id: description.id,
        type: "field" as const,
        attributes: { position: 1 },
        relationships: { fieldset: fieldsetRef(copySet.id) },
      },
      {
        id: handle.id,
        type: "field" as const,
        attributes: { position: 0 },
        relationships: { fieldset: fieldsetRef(keysSet.id) },
      },
      {
        id: shopifyId.id,
        type: "field" as const,
        attributes: { position: 1 },
        relationships: { fieldset: fieldsetRef(keysSet.id) },
      },
      {
        id: seo.id,
        type: "field" as const,
        attributes: { position: 0 },
        relationships: { fieldset: fieldsetRef(seoSet.id) },
      },
    ],
  });

  const collectionsPagePayload = {
    label: "Collections page",
    hint: "Page de índice de coleções. Título, Hero, conteúdo, SEO e slug vêm desse registo; as PLPs mantêm URLs estáveis em /{locale}/collections/{handle}.",
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
  const existingCollectionsPage = await findField(client, "global_setting::collections_page");
  if (existingCollectionsPage) {
    await client.fields.update(existingCollectionsPage.id, collectionsPagePayload);
    return;
  }
  await client.fields.create(globalSetting.id, {
    ...collectionsPagePayload,
    api_key: "collections_page",
  });
}
