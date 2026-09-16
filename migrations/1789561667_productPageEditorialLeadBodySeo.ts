import { Client } from "datocms/lib/cma-client-node";

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

const LEAD = {
  label: "Lead",
  hint: "Uma ou duas frases sob o título, neste idioma. Copy da ficha — não vem da Shopify. Vazio: o PDP mostra só o h1.",
  field_type: "text" as const,
  localized: true as const,
  validators: {},
  appearance: {
    editor: "textarea",
    parameters: {},
    addons: [],
  },
};

function bodyPayload(pageId: string, productPageId: string) {
  return {
    label: "Body",
    hint: "Descrição editorial neste idioma. Não vem da Shopify. Sem blocos (FAQ/CTA depois). Evita h1 — o título da ficha já é o heading da página.",
    field_type: "structured_text" as const,
    localized: true as const,
    validators: {
      structured_text_blocks: { item_types: [] },
      structured_text_inline_blocks: { item_types: [] },
      structured_text_links: {
        item_types: [pageId, productPageId],
        on_publish_with_unpublished_references_strategy: "fail" as const,
        on_reference_unpublish_strategy: "delete_references" as const,
        on_reference_delete_strategy: "delete_references" as const,
      },
    },
    appearance: {
      editor: "structured_text",
      parameters: {
        nodes: ["heading", "link", "list", "thematicBreak"],
        marks: ["strong", "emphasis"],
        heading_levels: [2, 3, 4],
        blocks_start_collapsed: false,
      },
      addons: [],
    },
  };
}

const SEO = {
  label: "SEO",
  hint: "Meta da ficha neste idioma. Vazio usa o título + lead. Imagem OG opcional; senão o Next usa a featured image da Shopify.",
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

/**
 * Copy + SEO localizados no product_page. Preço, stock, imagens e checkout ficam na Shopify.
 */
export default async function productPageEditorialLeadBodySeo(client: Client): Promise<void> {
  const productPage = await client.itemTypes.find("product_page");
  const page = await client.itemTypes.find("page");

  await client.itemTypes.update(productPage.id, {
    hint: "Ficha sincronizada da Shopify (webhook). Título, lead, body e SEO no Dato (por idioma). Preço, stock, imagem e checkout: Storefront. URL: /{locale}/products/{shopify_handle}.",
  });

  const fieldsets = await client.fieldsets.list(productPage.id);
  const editorial =
    fieldsets.find((fs) => fs.title === "Editorial") ??
    (await client.fieldsets.create(productPage.id, {
      title: "Editorial",
      hint: "Copy da ficha neste idioma. Não vem da Shopify.",
      collapsible: false,
      start_collapsed: false,
    }));
  const seoSet =
    fieldsets.find((fs) => fs.title === "🚀 SEO settings") ??
    (await client.fieldsets.create(productPage.id, {
      title: "🚀 SEO settings",
      hint: "Meta da ficha. Vazio usa o título + lead.",
      collapsible: false,
      start_collapsed: false,
    }));
  const keysSet = fieldsets.find((fs) => fs.title === "Shopify identifiers");

  const title = await findField(client, "product_page::title");
  if (title) {
    await client.fields.update(title.id, {
      hint: "Título editorial (h1). Locale en sincroniza para a Shopify ao publicar. pt-BR e es também, via Translations API.",
      fieldset: { id: editorial.id, type: "fieldset" },
    });
  }

  const leadExisting = await findField(client, "product_page::lead");
  const lead = leadExisting
    ? await client.fields.update(leadExisting.id, LEAD)
    : await client.fields.create(productPage.id, { ...LEAD, api_key: "lead" });
  await client.fields.update(lead.id, { fieldset: { id: editorial.id, type: "fieldset" } });

  const bodyExisting = await findField(client, "product_page::body");
  const bodyAttrs = bodyPayload(page.id, productPage.id);
  const body = bodyExisting
    ? await client.fields.update(bodyExisting.id, bodyAttrs)
    : await client.fields.create(productPage.id, { ...bodyAttrs, api_key: "body" });
  await client.fields.update(body.id, { fieldset: { id: editorial.id, type: "fieldset" } });

  const seoExisting = await findField(client, "product_page::seo");
  const seo = seoExisting
    ? await client.fields.update(seoExisting.id, SEO)
    : await client.fields.create(productPage.id, { ...SEO, api_key: "seo" });
  await client.fields.update(seo.id, { fieldset: { id: seoSet.id, type: "fieldset" } });

  const handle = await findField(client, "product_page::shopify_handle");
  const shopifyId = await findField(client, "product_page::shopify_product_id");

  const fieldsetRef = (id: string | undefined) =>
    id ? { data: { id, type: "fieldset" as const } } : { data: null };

  await client.itemTypes.rawReorderFieldsAndFieldsets(productPage.id, {
    data: [
      { id: editorial.id, type: "fieldset" as const, attributes: { position: 1 } },
      ...(keysSet ? [{ id: keysSet.id, type: "fieldset" as const, attributes: { position: 2 } }] : []),
      { id: seoSet.id, type: "fieldset" as const, attributes: { position: 3 } },
      ...(title
        ? [
            {
              id: title.id,
              type: "field" as const,
              attributes: { position: 0 },
              relationships: { fieldset: fieldsetRef(editorial.id) },
            },
          ]
        : []),
      {
        id: lead.id,
        type: "field" as const,
        attributes: { position: 1 },
        relationships: { fieldset: fieldsetRef(editorial.id) },
      },
      {
        id: body.id,
        type: "field" as const,
        attributes: { position: 2 },
        relationships: { fieldset: fieldsetRef(editorial.id) },
      },
      ...(handle
        ? [
            {
              id: handle.id,
              type: "field" as const,
              attributes: { position: 0 },
              relationships: { fieldset: fieldsetRef(keysSet?.id) },
            },
          ]
        : []),
      ...(shopifyId
        ? [
            {
              id: shopifyId.id,
              type: "field" as const,
              attributes: { position: 1 },
              relationships: { fieldset: fieldsetRef(keysSet?.id) },
            },
          ]
        : []),
      {
        id: seo.id,
        type: "field" as const,
        attributes: { position: 0 },
        relationships: { fieldset: fieldsetRef(seoSet.id) },
      },
    ],
  });
}
