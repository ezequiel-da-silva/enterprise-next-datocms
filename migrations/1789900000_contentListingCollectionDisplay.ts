import { Client } from "datocms/lib/cma-client-node";

const FIELD_DEPENDENCIES_PLUGIN_ID = "eFlp-ENNSyyi9oDVYogO0w";

function stringSelectAppearance(
  options: Array<{ label: string; value: string; hint: string }>,
  dependencies: Record<string, string[]>,
) {
  return {
    editor: "string_select" as const,
    parameters: { options },
    addons: [
      {
        id: FIELD_DEPENDENCIES_PLUGIN_ID,
        parameters: { dependencies: JSON.stringify(dependencies) },
      },
    ],
  };
}

/**
 * Alinha `source_collection` ao `category_display` (all / selected / none):
 * a coleção só aparece e só filtra no modo selected.
 */
export default async function contentListingCollectionDisplay(client: Client): Promise<void> {
  const categoryDisplay = await client.fields.find("content_listing_section::category_display");
  await client.fields.update(categoryDisplay.id, {
    label: "Filter display",
    hint: "Blog: categorias. Shopify: coleção. all = catálogo completo; selected = filtro escolhido; none = sem pílulas/filtro.",
    appearance: stringSelectAppearance(
      [
        {
          label: "Mostrar todas",
          value: "all",
          hint: "Blog: pílulas de todas as categorias. Shopify: todos os produtos publicados.",
        },
        {
          label: "Apenas selecionadas",
          value: "selected",
          hint: "Blog: categorias abaixo. Shopify: a coleção abaixo.",
        },
        {
          label: "Ocultar filtro",
          value: "none",
          hint: "Sem pílulas de categoria e sem filtro por coleção; lista o catálogo completo.",
        },
      ],
      {
        all: ["all_categories_label"],
        selected: ["all_categories_label", "selected_categories", "source_collection"],
        none: [],
      },
    ),
  });

  const contentSource = await client.fields.find("content_listing_section::content_source");
  await client.fields.update(contentSource.id, {
    hint: "Blog mostra posts/categorias; Shopify mostra produtos/coleção.",
    appearance: stringSelectAppearance(
      [
        {
          label: "Blog",
          value: "blog",
          hint: "Posts; categorias no modo automático ou posts escolhidos no manual.",
        },
        {
          label: "Shopify",
          value: "shopify",
          hint: "Produtos; Filter display escolhe o catálogo ou uma coleção; no manual, produtos escolhidos.",
        },
      ],
      {
        blog: [
          "all_categories_label",
          "category_display",
          "selected_categories",
          "show_sort_tabs",
          "manual_posts",
        ],
        shopify: ["category_display", "source_collection", "selected_products"],
      },
    ),
  });

  const sourceCollection = await client.fields.find("content_listing_section::source_collection");
  await client.fields.update(sourceCollection.id, {
    label: "Source collection",
    hint: "Shopify + automático + Filter display = selecionadas. Obrigatório nesse modo; all/none ignoram este campo.",
  });
}
