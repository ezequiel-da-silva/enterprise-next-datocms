import { Client } from "datocms/lib/cma-client-node";

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
    return client.fields.update(existing.id, payload as never);
  }
  return client.fields.create(ownerId, { ...payload, api_key: apiKey } as never);
}

/**
 * Converte o bloco de posts existente numa listagem genérica Blog/Shopify.
 *
 * O modelo blog_posts_section é renomeado in-place para preservar todos os
 * blocos editoriais existentes. products_section ainda não tem instâncias em
 * develop, por isso é removido depois de sair dos validators de Page.
 */
export default async function unifyContentListingSection(client: Client): Promise<void> {
  let blogSection;
  try {
    blogSection = await client.itemTypes.find("content_listing_section");
  } catch {
    blogSection = await client.itemTypes.find("blog_posts_section");
  }
  const productPage = await client.itemTypes.find("product_page");
  const collectionPage = await client.itemTypes.find("collection_page");

  await client.itemTypes.update(blogSection.id, {
    name: "Content listing section",
    api_key: "content_listing_section",
    hint: "Lista conteúdo de Blog ou Shopify. Escolha a fonte e depois use modo automático ou seleção manual.",
  });

  await upsertField(
    client,
    "content_listing_section::content_source",
    blogSection.id,
    "content_source",
    {
      label: "Content source",
      hint: "Blog mostra posts/categorias; Shopify mostra produtos/coleção.",
      field_type: "string" as const,
      localized: false as const,
      default_value: "blog",
      validators: {},
      appearance: {
        editor: "string_select" as const,
        parameters: {
          options: [
            {
              label: "Blog",
              value: "blog",
              hint: "Posts; categorias no modo automático ou posts escolhidos no manual.",
            },
            {
              label: "Shopify",
              value: "shopify",
              hint: "Produtos; coleção opcional no modo automático ou produtos escolhidos no manual.",
            },
          ],
        },
        addons: [
          {
            id: FIELD_DEPENDENCIES_PLUGIN_ID,
            parameters: {
              dependencies: JSON.stringify({
                blog: [
                  "all_categories_label",
                  "category_display",
                  "selected_categories",
                  "show_sort_tabs",
                  "manual_posts",
                ],
                shopify: ["source_collection", "selected_products"],
              }),
            },
          },
        ],
      },
    },
  );

  await upsertField(
    client,
    "content_listing_section::source_collection",
    blogSection.id,
    "source_collection",
    {
      label: "Source collection",
      hint: "Shopify + automático. Opcional: vazio lista todos os product_page publicados.",
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
    },
  );

  await upsertField(
    client,
    "content_listing_section::selected_products",
    blogSection.id,
    "selected_products",
    {
      label: "Selected products",
      hint: "Shopify + manual. Escolha product_page na ordem de apresentação; preço e imagem vêm da Storefront.",
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
    },
  );

  const fetchMode = await client.fields.find("content_listing_section::fetch_mode");
  await client.fields.update(fetchMode.id, {
    label: "Fetch mode",
    hint: "Automático usa categoria/coleção; manual usa os itens selecionados para a fonte escolhida.",
    default_value: "auto",
    appearance: {
      editor: "string_select",
      parameters: {
        options: [
          {
            label: "Automático",
            value: "auto",
            hint: "Consulta o catálogo e aplica o filtro opcional da fonte.",
          },
          {
            label: "Seleção manual",
            value: "manual",
            hint: "Mostra os posts ou produtos escolhidos abaixo.",
          },
        ],
      },
      addons: [
        {
          id: FIELD_DEPENDENCIES_PLUGIN_ID,
          parameters: {
            dependencies: JSON.stringify({
              auto: [
                "all_categories_label",
                "category_display",
                "selected_categories",
                "show_sort_tabs",
                "source_collection",
                "has_limit",
                "limit",
              ],
              manual: ["manual_posts", "selected_products", "has_limit", "limit"],
            }),
          },
        },
      ],
    },
  });

  let offset = 0;
  while (true) {
    const blocks = await client.items.list({
      filter: { type: blogSection.id },
      page: { limit: 30, offset },
      version: "current",
      nested: true,
    });
    for (const block of blocks) {
      if (!(block as { content_source?: unknown }).content_source) {
        await client.items.update(block.id, { content_source: "blog" });
      }
    }
    if (blocks.length < 30) break;
    offset += blocks.length;
  }

  const pageContent = await client.fields.find("page::content_page");
  const productsSection = await client.itemTypes.find("products_section");
  const validators = (pageContent.validators ?? {}) as Record<string, unknown>;
  const rich = (validators.rich_text_blocks ?? {}) as { item_types?: string[] };
  const itemTypes = (rich.item_types ?? []).filter((id) => id !== productsSection.id);
  if (!itemTypes.includes(blogSection.id)) itemTypes.push(blogSection.id);
  await client.fields.update(pageContent.id, {
    validators: {
      ...validators,
      rich_text_blocks: { ...rich, item_types: itemTypes },
    },
  });

  await client.itemTypes.destroy(productsSection.id);
}
