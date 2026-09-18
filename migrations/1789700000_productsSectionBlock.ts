import { Client } from "datocms/lib/cma-client-node";

const CONDITIONAL_FIELDS_PLUGIN_ID = "O5EH-66PR_-A8e5j2M9g1A";
const FIELD_DEPENDENCIES_PLUGIN_ID = "eFlp-ENNSyyi9oDVYogO0w";

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

async function upsertField(
  client: Client,
  pointer: string,
  ownerId: string,
  apiKey: string,
  payload: object,
) {
  const existing = await findField(client, pointer);
  if (existing) {
    await client.fields.update(existing.id, payload as never);
    return;
  }
  await client.fields.create(ownerId, { ...payload, api_key: apiKey } as never);
}

async function findOrCreateBlock(client: Client, apiKey: string, name: string, hint: string) {
  try {
    const existing = await client.itemTypes.find(apiKey);
    await client.itemTypes.update(existing.id, { name, hint });
    return existing;
  } catch {
    return client.itemTypes.create({
      name,
      api_key: apiKey,
      modular_block: true,
      hint,
    });
  }
}

function stringSelect(
  label: string,
  hint: string,
  options: { label: string; value: string; hint: string }[],
  defaultValue: string,
  dependencies: string,
) {
  return {
    label,
    hint,
    field_type: "string" as const,
    localized: false as const,
    default_value: defaultValue,
    validators: {},
    appearance: {
      editor: "string_select" as const,
      parameters: { options },
      addons: [
        {
          id: FIELD_DEPENDENCIES_PLUGIN_ID,
          parameters: { dependencies },
        },
      ],
    },
  };
}

/**
 * Secção de listagem de produtos (espelho de blog_posts_section).
 * Membership da coleção e preço/imagem ficam na Shopify; o Dato escolhe o conjunto.
 */
export default async function productsSectionBlock(client: Client): Promise<void> {
  const page = await client.itemTypes.find("page");
  const textHeader = await client.itemTypes.find("text_header");
  const carouselSetting = await client.itemTypes.find("carousel_setting");
  const productPage = await client.itemTypes.find("product_page");
  const collectionPage = await client.itemTypes.find("collection_page");
  const globalSetting = await client.itemTypes.find("global_setting");

  const section = await findOrCreateBlock(
    client,
    "products_section",
    "🛍️ Products section",
    "Lista produtos da Shopify: automático (todos os product_page, ou uma coleção) ou seleção manual. Preço e imagem vêm da Storefront.",
  );

  const headerPayload = {
    label: "Text header section",
    hint: "Opcional. Título (h2), descrição e/ou ID da secção. O h1 da página vem do título/Hero da Page.",
    field_type: "rich_text" as const,
    localized: false as const,
    validators: {
      rich_text_blocks: { item_types: [textHeader.id] },
      size: { max: 1 },
    },
    appearance: {
      editor: "rich_text",
      parameters: { start_collapsed: false },
      addons: [],
    },
  };
  await upsertField(client, "products_section::text_header_section", section.id, "text_header_section", headerPayload);

  const fetchModePayload = stringSelect(
    "Fetch mode",
    "Auto: catálogo Dato + Storefront (opcionalmente filtrado por coleção). Manual: escolhe product_page.",
    [
      {
        label: "Automático (catálogo)",
        value: "auto",
        hint: "Usa os product_page publicados, ou os produtos da coleção Shopify ligada.",
      },
      {
        label: "Seleção manual",
        value: "manual",
        hint: "O editor escolhe quais product_page aparecem, na ordem dos links.",
      },
    ],
    "auto",
    JSON.stringify({
      auto: ["source_collection", "has_limit", "limit"],
      manual: ["selected_products", "has_limit", "limit"],
    }),
  );
  await upsertField(client, "products_section::fetch_mode", section.id, "fetch_mode", fetchModePayload);

  const sourceCollectionPayload = {
    label: "Source collection",
    hint: "Opcional, só no modo auto. Filtra pela coleção Shopify desta ficha (como filtrar posts por categoria). Vazio = todos os product_page.",
    field_type: "link" as const,
    localized: false as const,
    validators: {
      item_item_type: {
        item_types: [collectionPage.id],
        on_publish_with_unpublished_references_strategy: "fail" as const,
        on_reference_unpublish_strategy: "delete_references" as const,
        on_reference_delete_strategy: "delete_references" as const,
      },
    },
    appearance: {
      editor: "link_select" as const,
      parameters: {},
      addons: [],
    },
  };
  await upsertField(client, "products_section::source_collection", section.id, "source_collection", sourceCollectionPayload);

  const selectedPayload = {
    label: "Selected products",
    hint: "Modo manual. Liga product_page na ordem de apresentação. Preço e imagem continuam na Storefront.",
    field_type: "links" as const,
    localized: false as const,
    validators: {
      items_item_type: {
        item_types: [productPage.id],
        on_publish_with_unpublished_references_strategy: "fail" as const,
        on_reference_unpublish_strategy: "delete_references" as const,
        on_reference_delete_strategy: "delete_references" as const,
      },
      size: { max: 50 },
    },
    appearance: {
      editor: "links_select" as const,
      parameters: {},
      addons: [],
    },
  };
  await upsertField(client, "products_section::selected_products", section.id, "selected_products", selectedPayload);

  const hasLimitPayload = {
    label: "Has limit?",
    hint: "Ative para cortar a lista (grid/carrossel). Paginação e load more usam Initial count à parte.",
    field_type: "boolean" as const,
    localized: false as const,
    default_value: false,
    validators: {},
    appearance: {
      editor: "boolean",
      parameters: {},
      addons: [
        {
          id: CONDITIONAL_FIELDS_PLUGIN_ID,
          field_extension: "conditionalFields",
          parameters: { invert: false, targetFieldsApiKey: ["limit"] },
        },
      ],
    },
  };
  await upsertField(client, "products_section::has_limit", section.id, "has_limit", hasLimitPayload);

  const integerField = (label: string, hint: string, defaultValue: number) => ({
    label,
    hint,
    field_type: "integer" as const,
    localized: false as const,
    default_value: defaultValue,
    validators: { number_range: { min: 1, max: 100 } },
    appearance: { editor: "integer" as const, parameters: {}, addons: [] },
  });

  const limitPayload = integerField("Limit", "Teto de itens quando Has limit está ligado.", 6);
  await upsertField(client, "products_section::limit", section.id, "limit", limitPayload);

  const displayTypePayload = stringSelect(
    "Display type",
    "Como a lista aparece no site.",
    [
      { label: "Grelha", value: "grid", hint: "" },
      { label: "Carrossel", value: "carousel", hint: "" },
      { label: "Paginação", value: "pagination", hint: "" },
      { label: "Carregar mais", value: "load_more", hint: "" },
    ],
    "grid",
    JSON.stringify({
      grid: [],
      carousel: ["carousel_options"],
      pagination: ["initial_count"],
      load_more: ["initial_count", "load_more_step", "load_more_label"],
    }),
  );
  await upsertField(client, "products_section::display_type", section.id, "display_type", displayTypePayload);

  const initialPayload = integerField("Initial count", "Itens na primeira página / no primeiro clique de load more.", 6);
  await upsertField(client, "products_section::initial_count", section.id, "initial_count", initialPayload);

  const stepPayload = integerField("Load more step", "Quantos itens entram a cada clique.", 3);
  await upsertField(client, "products_section::load_more_step", section.id, "load_more_step", stepPayload);

  const loadMoreLabelPayload = {
    label: "Load more label",
    hint: "Texto do botão. Vazio usa o copy i18n da app.",
    field_type: "string" as const,
    localized: false as const,
    validators: { length: { max: 80 } },
    appearance: {
      editor: "single_line",
      parameters: { heading: false },
      addons: [],
    },
  };
  await upsertField(client, "products_section::load_more_label", section.id, "load_more_label", loadMoreLabelPayload);

  const carouselPayload = {
    label: "Carousel options",
    hint: "Só no display carrossel.",
    field_type: "rich_text" as const,
    localized: false as const,
    validators: {
      rich_text_blocks: { item_types: [carouselSetting.id] },
      size: { max: 1 },
    },
    appearance: {
      editor: "rich_text",
      parameters: { start_collapsed: false },
      addons: [],
    },
  };
  await upsertField(client, "products_section::carousel_options", section.id, "carousel_options", carouselPayload);

  await client.itemTypes.update(section.id, {
    collection_appearance: "table",
    hint: "Lista produtos da Shopify: automático (todos os product_page, ou uma coleção) ou seleção manual. Preço e imagem vêm da Storefront.",
  });

  const contentPage = await client.fields.find("page::content_page");
  const current = (contentPage.validators ?? {}) as Record<string, unknown>;
  const rich = (current.rich_text_blocks ?? {}) as { item_types?: string[] };
  const itemTypes = Array.isArray(rich.item_types) ? [...rich.item_types] : [];
  if (!itemTypes.includes(section.id)) {
    itemTypes.push(section.id);
    await client.fields.update(contentPage.id, {
      validators: {
        ...current,
        rich_text_blocks: { ...rich, item_types: itemTypes },
      },
    });
  }

  const collectionsIndex = await ensureCollectionsIndexPage(client, page.id);
  const settings = await client.items.list({
    filter: { type: globalSetting.id },
    page: { limit: 1 },
    version: "current",
  });
  const setting = settings[0];
  if (setting?.id && collectionsIndex && !(setting as { collections_page?: unknown }).collections_page) {
    await client.items.update(setting.id, {
      collections_page: collectionsIndex,
    });
    await client.items.publish(setting.id);
  }
}

async function ensureCollectionsIndexPage(client: Client, pageTypeId: string): Promise<string | null> {
  const existing = await client.items.list({
    filter: {
      type: pageTypeId,
      fields: { slug: { eq: "collections" } },
    },
    page: { limit: 1 },
    version: "current",
    nested: true,
  });
  if (existing[0]?.id) return existing[0].id;

  try {
    const created = await client.items.create({
      item_type: { type: "item_type", id: pageTypeId },
      title: { en: "Collections", "pt-BR": "Coleções", es: "Colecciones" },
      slug: { en: "collections", "pt-BR": "collections", es: "collections" },
    });
    await client.items.publish(created.id);
    return created.id;
  } catch {
    return existing[0]?.id ?? null;
  }
}
