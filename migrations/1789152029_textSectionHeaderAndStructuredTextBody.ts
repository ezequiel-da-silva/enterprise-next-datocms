import { Client } from "datocms/lib/cma-client-node";

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

export default async function (client: Client): Promise<void> {
  const textSection = await client.itemTypes.find("text_section");
  const textHeader = await client.itemTypes.find("text_header");
  const imageBlock = await client.itemTypes.find("image_block");
  const galleryBlock = await client.itemTypes.find("image_gallery_block");
  const videoBlock = await client.itemTypes.find("video_block");
  const page = await client.itemTypes.find("page");

  await client.itemTypes.update(textSection.id, {
    name: "Text section",
    hint: "Secção de prosa na Page: cabeçalho (h2) + Structured Text. Listas, citações e código pela toolbar — não por blocos extra.",
  });

  const headerExisting = await findField(client, "text_section::text_header_section");
  const headerPayload = {
    label: "Text header section",
    hint: "Título (h2), descrição opcional e id da secção. Um cabeçalho por bloco.",
    field_type: "single_block" as const,
    localized: false as const,
    validators: {
      required: {},
      single_block_blocks: { item_types: [textHeader.id] },
    },
    appearance: {
      editor: "framed_single_block",
      parameters: { start_collapsed: false },
      addons: [],
    },
  };
  if (headerExisting) {
    await client.fields.update(headerExisting.id, headerPayload);
  } else {
    await client.fields.create(textSection.id, {
      ...headerPayload,
      api_key: "text_header_section",
    });
  }

  const bodyExisting = await findField(client, "text_section::body");
  const bodyPayload = {
    label: "Body",
    hint: "Corpo da secção (Structured Text). Headings h3–h4; listas, citação e código na toolbar. Imagem, galeria ou vídeo como blocos embutidos.",
    field_type: "structured_text" as const,
    localized: false as const,
    validators: {
      required: {},
      structured_text_blocks: {
        item_types: [imageBlock.id, galleryBlock.id, videoBlock.id],
      },
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
        nodes: ["blockquote", "code", "heading", "link", "list", "thematicBreak"],
        marks: ["strong", "emphasis", "code", "highlight"],
        heading_levels: [3, 4],
        blocks_start_collapsed: false,
      },
      addons: [],
    },
  };
  if (bodyExisting) {
    await client.fields.update(bodyExisting.id, bodyPayload);
  } else {
    await client.fields.create(textSection.id, {
      ...bodyPayload,
      api_key: "body",
    });
  }

  const contentPage = await client.fields.find("page::content_page");
  const current = (contentPage.validators ?? {}) as Record<string, unknown>;
  const rich = (current.rich_text_blocks ?? {}) as { item_types?: string[] };
  const itemTypes = Array.isArray(rich.item_types) ? [...rich.item_types] : [];
  if (!itemTypes.includes(textSection.id)) {
    itemTypes.push(textSection.id);
    await client.fields.update(contentPage.id, {
      validators: {
        ...current,
        rich_text_blocks: { ...rich, item_types: itemTypes },
      },
    });
  }
}
