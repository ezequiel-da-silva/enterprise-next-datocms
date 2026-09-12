import { Client } from "datocms/lib/cma-client-node";

const CONDITIONAL_FIELDS_PLUGIN_ID = "O5EH-66PR_-A8e5j2M9g1A";

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
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

export default async function searchSectionAndSearchPage(client: Client): Promise<void> {
  const page = await client.itemTypes.find("page");
  const textHeader = await client.itemTypes.find("text_header");
  const globalSetting = await client.itemTypes.find("global_setting");

  const searchSection = await findOrCreateBlock(
    client,
    "search_section",
    "Search section",
    "Widget de busca da app (GET ?q= + query GraphQL no Next). Só copy e cabeçalho vêm do CMS — não é o DatoCMS Site Search.",
  );

  const headerPayload = {
    label: "Text header section",
    hint: "Opcional. Quando ativado, define título (h2), descrição e/ou ID da secção. O h1 da página vem do título/Hero da Page.",
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

  const headerExisting = await findField(client, "search_section::text_header_section");
  const header = headerExisting
    ? await client.fields.update(headerExisting.id, headerPayload)
    : await client.fields.create(searchSection.id, {
        ...headerPayload,
        api_key: "text_header_section",
      });

  const togglePayload = {
    label: "Has text header?",
    hint: "Ative para mostrar título, descrição e/ou ID de âncora antes do formulário de busca.",
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
          parameters: {
            invert: false,
            targetFieldsApiKey: ["text_header_section"],
          },
        },
      ],
    },
  };

  const toggleExisting = await findField(client, "search_section::has_text_header");
  const toggle = toggleExisting
    ? await client.fields.update(toggleExisting.id, togglePayload)
    : await client.fields.create(searchSection.id, {
        ...togglePayload,
        api_key: "has_text_header",
      });

  const introPayload = {
    label: "Intro",
    hint: "Texto curto acima do formulário. Sem blocos embutidos.",
    field_type: "structured_text" as const,
    localized: false as const,
    validators: {
      structured_text_blocks: { item_types: [] },
      structured_text_inline_blocks: { item_types: [] },
      structured_text_links: {
        item_types: [page.id],
        on_publish_with_unpublished_references_strategy: "fail" as const,
        on_reference_unpublish_strategy: "delete_references" as const,
        on_reference_delete_strategy: "delete_references" as const,
      },
    },
    appearance: {
      editor: "structured_text",
      parameters: {
        nodes: ["blockquote", "heading", "link", "list", "thematicBreak"],
        marks: ["strong", "emphasis", "code", "highlight"],
        heading_levels: [3, 4],
        blocks_start_collapsed: false,
      },
      addons: [],
    },
  };

  const introExisting = await findField(client, "search_section::intro");
  const intro = introExisting
    ? await client.fields.update(introExisting.id, introPayload)
    : await client.fields.create(searchSection.id, {
        ...introPayload,
        api_key: "intro",
      });

  const stringField = (label: string, hint: string, max: number) => ({
    label,
    hint,
    field_type: "string" as const,
    localized: false as const,
    validators: {
      length: { max },
    },
    appearance: {
      editor: "single_line",
      parameters: { heading: false },
      addons: [],
    },
  });

  const placeholderPayload = stringField(
    "Placeholder",
    "Placeholder do campo de busca. Vazio usa o texto padrão da app.",
    120,
  );
  const placeholderExisting = await findField(client, "search_section::placeholder");
  const placeholder = placeholderExisting
    ? await client.fields.update(placeholderExisting.id, placeholderPayload)
    : await client.fields.create(searchSection.id, {
        ...placeholderPayload,
        api_key: "placeholder",
      });

  const submitPayload = stringField(
    "Submit label",
    "Texto do botão. Vazio usa o rótulo padrão da app.",
    40,
  );
  const submitExisting = await findField(client, "search_section::submit_label");
  const submit = submitExisting
    ? await client.fields.update(submitExisting.id, submitPayload)
    : await client.fields.create(searchSection.id, {
        ...submitPayload,
        api_key: "submit_label",
      });

  const emptyHintPayload = stringField(
    "Empty hint",
    "Copy quando ainda não há termo de busca.",
    240,
  );
  const emptyHintExisting = await findField(client, "search_section::empty_hint");
  const emptyHint = emptyHintExisting
    ? await client.fields.update(emptyHintExisting.id, emptyHintPayload)
    : await client.fields.create(searchSection.id, {
        ...emptyHintPayload,
        api_key: "empty_hint",
      });

  const noResultsPayload = stringField(
    "No results",
    "Copy quando a busca não devolve hits. O Next interpola o termo.",
    240,
  );
  const noResultsExisting = await findField(client, "search_section::no_results");
  const noResults = noResultsExisting
    ? await client.fields.update(noResultsExisting.id, noResultsPayload)
    : await client.fields.create(searchSection.id, {
        ...noResultsPayload,
        api_key: "no_results",
      });

  await client.itemTypes.rawReorderFieldsAndFieldsets(searchSection.id, {
    data: [
      { id: toggle.id, type: "field", attributes: { position: 0 }, relationships: { fieldset: { data: null } } },
      { id: header.id, type: "field", attributes: { position: 1 }, relationships: { fieldset: { data: null } } },
      { id: intro.id, type: "field", attributes: { position: 2 }, relationships: { fieldset: { data: null } } },
      { id: placeholder.id, type: "field", attributes: { position: 3 }, relationships: { fieldset: { data: null } } },
      { id: submit.id, type: "field", attributes: { position: 4 }, relationships: { fieldset: { data: null } } },
      { id: emptyHint.id, type: "field", attributes: { position: 5 }, relationships: { fieldset: { data: null } } },
      { id: noResults.id, type: "field", attributes: { position: 6 }, relationships: { fieldset: { data: null } } },
    ],
  });

  const contentPage = await client.fields.find("page::content_page");
  const current = (contentPage.validators ?? {}) as Record<string, unknown>;
  const rich = (current.rich_text_blocks ?? {}) as { item_types?: string[] };
  const itemTypes = Array.isArray(rich.item_types) ? [...rich.item_types] : [];
  if (!itemTypes.includes(searchSection.id)) {
    itemTypes.push(searchSection.id);
    await client.fields.update(contentPage.id, {
      validators: {
        ...current,
        rich_text_blocks: { ...rich, item_types: itemTypes },
      },
    });
  }

  const searchPagePayload = {
    label: "Search page",
    hint: "Page de busca. O título, Hero, conteúdo, SEO e slug vêm desse registo; o widget é o bloco Search section. O Next usa esta referência para /busca e o SearchAction do JSON-LD.",
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

  const existingSearchPage = await findField(client, "global_setting::search_page");
  if (existingSearchPage) {
    await client.fields.update(existingSearchPage.id, searchPagePayload);
    return;
  }

  await client.fields.create(globalSetting.id, {
    ...searchPagePayload,
    api_key: "search_page",
  });
}
