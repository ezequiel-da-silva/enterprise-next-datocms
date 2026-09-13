import { Client } from "datocms/lib/cma-client-node";

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

export default async function legalPageSeoHintsAndLinks(client: Client): Promise<void> {
  const legal = await client.itemTypes.find("legal_page");
  const page = await client.itemTypes.find("page");

  await client.itemTypes.update(legal.id, {
    name: "🏛️ Legal Page",
    hint: "Documentos legais (privacy, terms, refund). URL: /{locale}/{slug}. O slug não é localizado — o título e o corpo sim. Ligue estes URLs em Navigation → Legal links (ex.: /privacy-policy).",
  });

  const title = await findField(client, "legal_page::title");
  if (title) {
    await client.fields.update(title.id, {
      hint: "Título da página (h1 no Next se o corpo não tiver heading nível 1).",
    });
  }

  const slug = await findField(client, "legal_page::slug");
  if (slug) {
    await client.fields.update(slug.id, {
      hint: "Segmento de URL partilhado por todos os idiomas (ex.: privacy-policy → /en/privacy-policy e /pt/privacy-policy).",
    });
  }

  const contentPayload = {
    label: "Content",
    hint: "Corpo do documento. Sem blocos. Pode ligar a Pages e a outras Legal Pages. Evite um segundo h1 se o título da ficha já for o heading da página.",
    field_type: "structured_text" as const,
    localized: true as const,
    validators: {
      required: {},
      structured_text_blocks: { item_types: [] },
      structured_text_inline_blocks: { item_types: [] },
      structured_text_links: {
        item_types: [page.id, legal.id],
        on_publish_with_unpublished_references_strategy: "fail" as const,
        on_reference_unpublish_strategy: "delete_references" as const,
        on_reference_delete_strategy: "delete_references" as const,
      },
    },
    appearance: {
      editor: "structured_text",
      parameters: {
        nodes: ["blockquote", "code", "heading", "link", "list", "thematicBreak"],
        marks: ["strong", "emphasis", "code", "highlight", "strikethrough"],
        heading_levels: [1, 2, 3, 4],
        blocks_start_collapsed: false,
      },
      addons: [],
    },
  };

  const content = await findField(client, "legal_page::content");
  if (content) {
    await client.fields.update(content.id, contentPayload);
  }

  const seoPayload = {
    label: "SEO settings/social",
    hint: "Título, descrição e noIndex desta página legal. Vazio usa o título do registo.",
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

  const existingSeo = await findField(client, "legal_page::seo_settings_social");
  if (existingSeo) {
    await client.fields.update(existingSeo.id, seoPayload);
  } else {
    await client.fields.create(legal.id, {
      ...seoPayload,
      api_key: "seo_settings_social",
    });
  }
}
