import { Client } from "datocms/lib/cma-client-node";

/**
 * `contentPage` is a GraphQL union: every member that selects `textHeaderSection`
 * must return the same type. Other organisms use Modular Content (`[TextHeaderRecord!]!`).
 * `single_block` (`TextHeaderRecord`) cannot share that field name in PAGE_BY_SLUG.
 */
export default async function (client: Client): Promise<void> {
  const textSection = await client.itemTypes.find("text_section");
  const textHeader = await client.itemTypes.find("text_header");

  try {
    const existing = await client.fields.find("text_section::text_header_section");
    if (existing.field_type !== "rich_text") {
      await client.fields.destroy(existing.id);
    } else {
      await client.fields.update(existing.id, {
        validators: {
          rich_text_blocks: { item_types: [textHeader.id] },
          size: { eq: 1 },
        },
      });
      return;
    }
  } catch {
    /* field missing — create below */
  }

  await client.fields.create(textSection.id, {
    label: "Text header section",
    api_key: "text_header_section",
    hint: "Título (h2), descrição opcional e id da secção. Um cabeçalho por bloco.",
    field_type: "rich_text" as const,
    localized: false as const,
    validators: {
      rich_text_blocks: { item_types: [textHeader.id] },
      size: { eq: 1 },
    },
    appearance: {
      editor: "rich_text",
      parameters: { start_collapsed: false },
      addons: [],
    },
  });
}
