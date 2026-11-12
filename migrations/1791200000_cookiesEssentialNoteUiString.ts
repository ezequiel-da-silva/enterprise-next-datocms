import { Client } from "datocms/lib/cma-client-node";

/**
 * Nota curta no banner de cookies (`ui_string.cookies_essential_note`).
 * Campo vazio = texto padrão em `src/lib/i18n/consent-copy.ts`.
 *
 * Seed após aplicar (só campos vazios):
 *   npx datocms cma:script scripts/seed-ui-strings.ts --profile=staging|default
 */

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

export default async function cookiesEssentialNoteUiString(client: Client): Promise<void> {
  const model = await client.itemTypes.find("ui_string");
  const fieldsets = await client.fieldsets.list(model.id);
  const fieldset =
    fieldsets.find((fs) => fs.title === "🍪 Cookies") ??
    (await client.fieldsets.create(model.id, {
      title: "🍪 Cookies",
      hint: "Banner de consentimento (LGPD/GDPR). Texto legal: revise antes de publicar.",
      collapsible: true,
      start_collapsed: false,
    }));

  const payload = {
    label: "Essential cookies note",
    hint: "Microcopy sob a descrição (ex.: cookies essenciais sempre ativos). Vazio = texto padrão do código.",
    field_type: "string" as const,
    localized: true as const,
    validators: { length: { max: 160 } },
    appearance: { editor: "single_line", parameters: { heading: false, placeholder: null }, addons: [] },
  };

  const existing = await findField(client, "ui_string::cookies_essential_note");
  if (existing) {
    await client.fields.update(existing.id, payload);
  } else {
    await client.fields.create(model.id, {
      ...payload,
      api_key: "cookies_essential_note",
      fieldset: { type: "fieldset", id: fieldset.id },
    });
  }
}
