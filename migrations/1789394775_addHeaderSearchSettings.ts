import { Client } from "datocms/lib/cma-client-node";

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

export default async function addHeaderSearchSettings(client: Client): Promise<void> {
  const navigation = await client.itemTypes.find("navigation");
  const fieldsets = await client.fieldsets.list(navigation.id);
  const header = fieldsets.find((fieldset) => fieldset.title === "🧭 Header");

  const togglePayload = {
    label: "Show header search",
    hint: "Mostra uma barra de busca abaixo do menu principal.",
    field_type: "boolean" as const,
    localized: false as const,
    default_value: true,
    validators: {},
    appearance: {
      editor: "boolean",
      parameters: {},
      addons: [],
    },
  };
  const existingToggle = await findField(client, "navigation::show_header_search");
  const toggle = existingToggle
    ? await client.fields.update(existingToggle.id, togglePayload)
    : await client.fields.create(navigation.id, {
        ...togglePayload,
        api_key: "show_header_search",
      });

  const placeholderPayload = {
    label: "Header search placeholder",
    hint: "Texto exibido dentro da busca (localizado).",
    field_type: "string" as const,
    localized: true as const,
    validators: { length: { max: 100 } },
    appearance: {
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
      addons: [],
    },
  };
  const existingPlaceholder = await findField(client, "navigation::header_search_placeholder");
  const placeholder = existingPlaceholder
    ? await client.fields.update(existingPlaceholder.id, placeholderPayload)
    : await client.fields.create(navigation.id, {
        ...placeholderPayload,
        api_key: "header_search_placeholder",
      });

  const labelPayload = {
    label: "Header search button label",
    hint: "Rótulo do botão de busca (localizado).",
    field_type: "string" as const,
    localized: true as const,
    validators: { length: { max: 30 } },
    appearance: {
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
      addons: [],
    },
  };
  const existingLabel = await findField(client, "navigation::header_search_submit_label");
  const label = existingLabel
    ? await client.fields.update(existingLabel.id, labelPayload)
    : await client.fields.create(navigation.id, {
        ...labelPayload,
        api_key: "header_search_submit_label",
      });

  const currentFields = await client.fields.list(navigation.id);
  const untouched = currentFields
    .filter((field) => ![toggle.id, placeholder.id, label.id].includes(field.id))
    .map((field) => ({
      id: field.id,
      type: "field" as const,
      attributes: { position: field.position },
      relationships: {
        fieldset: {
          data: field.fieldset
            ? { id: field.fieldset.id, type: "fieldset" as const }
            : null,
        },
      },
    }));

  await client.itemTypes.rawReorderFieldsAndFieldsets(navigation.id, {
    data: [
      ...fieldsets.map((fieldset) => ({
        id: fieldset.id,
        type: "fieldset" as const,
        attributes: { position: fieldset.position },
      })),
      ...untouched,
      {
        id: toggle.id,
        type: "field",
        attributes: { position: 4 },
        relationships: {
          fieldset: { data: header ? { id: header.id, type: "fieldset" } : null },
        },
      },
      {
        id: placeholder.id,
        type: "field",
        attributes: { position: 5 },
        relationships: {
          fieldset: { data: header ? { id: header.id, type: "fieldset" } : null },
        },
      },
      {
        id: label.id,
        type: "field",
        attributes: { position: 6 },
        relationships: {
          fieldset: { data: header ? { id: header.id, type: "fieldset" } : null },
        },
      },
    ],
  });
}