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

export default async function contactFormSectionAndContactPage(client: Client): Promise<void> {
  const page = await client.itemTypes.find("page");
  const textHeader = await client.itemTypes.find("text_header");
  const globalSetting = await client.itemTypes.find("global_setting");

  const contactSection = await findOrCreateBlock(
    client,
    "contact_form_section",
    "Contact form section",
    "Formulário de contacto da app (nome, e-mail, mensagem). Só copy e cabeçalho vêm do CMS — campos e envio ficam no código.",
  );

  const headerPayload = {
    label: "Text header section",
    hint: "Opcional. Quando ativado, define título (h2), descrição e/ou ID da secção.",
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

  const headerExisting = await findField(client, "contact_form_section::text_header_section");
  const header = headerExisting
    ? await client.fields.update(headerExisting.id, headerPayload)
    : await client.fields.create(contactSection.id, {
        ...headerPayload,
        api_key: "text_header_section",
      });

  const togglePayload = {
    label: "Has text header?",
    hint: "Ative para mostrar título, descrição e/ou ID de âncora antes do formulário.",
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

  const toggleExisting = await findField(client, "contact_form_section::has_text_header");
  const toggle = toggleExisting
    ? await client.fields.update(toggleExisting.id, togglePayload)
    : await client.fields.create(contactSection.id, {
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

  const introExisting = await findField(client, "contact_form_section::intro");
  const intro = introExisting
    ? await client.fields.update(introExisting.id, introPayload)
    : await client.fields.create(contactSection.id, {
        ...introPayload,
        api_key: "intro",
      });

  const successPayload = {
    label: "Success message",
    hint: "Copy após envio bem-sucedido. Vazio usa a mensagem padrão da app.",
    field_type: "string" as const,
    localized: false as const,
    validators: {
      length: { max: 240 },
    },
    appearance: {
      editor: "single_line",
      parameters: { heading: false },
      addons: [],
    },
  };

  const successExisting = await findField(client, "contact_form_section::success_message");
  const success = successExisting
    ? await client.fields.update(successExisting.id, successPayload)
    : await client.fields.create(contactSection.id, {
        ...successPayload,
        api_key: "success_message",
      });

  const privacyPayload = {
    label: "Privacy note",
    hint: "Nota curta abaixo do botão (privacidade / RGPD).",
    field_type: "string" as const,
    localized: false as const,
    validators: {
      length: { max: 400 },
    },
    appearance: {
      editor: "single_line",
      parameters: { heading: false },
      addons: [],
    },
  };

  const privacyExisting = await findField(client, "contact_form_section::privacy_note");
  const privacy = privacyExisting
    ? await client.fields.update(privacyExisting.id, privacyPayload)
    : await client.fields.create(contactSection.id, {
        ...privacyPayload,
        api_key: "privacy_note",
      });

  await client.itemTypes.rawReorderFieldsAndFieldsets(contactSection.id, {
    data: [
      {
        id: toggle.id,
        type: "field",
        attributes: { position: 0 },
        relationships: { fieldset: { data: null } },
      },
      {
        id: header.id,
        type: "field",
        attributes: { position: 1 },
        relationships: { fieldset: { data: null } },
      },
      {
        id: intro.id,
        type: "field",
        attributes: { position: 2 },
        relationships: { fieldset: { data: null } },
      },
      {
        id: success.id,
        type: "field",
        attributes: { position: 3 },
        relationships: { fieldset: { data: null } },
      },
      {
        id: privacy.id,
        type: "field",
        attributes: { position: 4 },
        relationships: { fieldset: { data: null } },
      },
    ],
  });

  const contentPage = await client.fields.find("page::content_page");
  const current = (contentPage.validators ?? {}) as Record<string, unknown>;
  const rich = (current.rich_text_blocks ?? {}) as { item_types?: string[] };
  const itemTypes = Array.isArray(rich.item_types) ? [...rich.item_types] : [];
  if (!itemTypes.includes(contactSection.id)) {
    itemTypes.push(contactSection.id);
    await client.fields.update(contentPage.id, {
      validators: {
        ...current,
        rich_text_blocks: { ...rich, item_types: itemTypes },
      },
    });
  }

  const contactPagePayload = {
    label: "Contact page",
    hint: "Page de contacto. O título, Hero, conteúdo, SEO e slug vêm desse registo; o formulário é o bloco Contact form section. O Next usa esta referência para /contato e JSON-LD ContactPage.",
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

  const existingContactPage = await findField(client, "global_setting::contact_page");
  if (existingContactPage) {
    await client.fields.update(existingContactPage.id, contactPagePayload);
    return;
  }

  await client.fields.create(globalSetting.id, {
    ...contactPagePayload,
    api_key: "contact_page",
  });
}
