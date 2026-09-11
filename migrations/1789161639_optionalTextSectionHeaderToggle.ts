import { Client } from "datocms/lib/cma-client-node";

const CONDITIONAL_FIELDS_PLUGIN_ID = "O5EH-66PR_-A8e5j2M9g1A";

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

export default async function (client: Client): Promise<void> {
  const textSection = await client.itemTypes.find("text_section");
  const header = await client.fields.find("text_section::text_header_section");

  const togglePayload = {
    label: "Has text header?",
    hint: "Ative para mostrar título, descrição e/ou ID de âncora antes do corpo da secção.",
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

  const existingToggle = await findField(client, "text_section::has_text_header");
  const toggle = existingToggle
    ? await client.fields.update(existingToggle.id, togglePayload)
    : await client.fields.create(textSection.id, {
        ...togglePayload,
        api_key: "has_text_header",
      });

  await client.fields.update(header.id, {
    hint: "Opcional. Quando ativado, define título (h2), descrição e/ou ID da secção.",
    validators: {
      rich_text_blocks: {
        item_types: [
          (await client.itemTypes.find("text_header")).id,
        ],
      },
      size: { max: 1 },
    },
  });

  const body = await client.fields.find("text_section::body");
  await client.itemTypes.rawReorderFieldsAndFieldsets(textSection.id, {
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
        id: body.id,
        type: "field",
        attributes: { position: 2 },
        relationships: { fieldset: { data: null } },
      },
    ],
  });
}