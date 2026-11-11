import { Client } from "datocms/lib/cma-client-node";

/**
 * Empty states e avisos de sistema no singleton `ui_string`.
 * Campo vazio = texto padrão em `src/lib/i18n/*-copy.ts`.
 *
 * Os api keys entram em `UI_STRINGS_FIELD_NAMES`. O teste
 * `ui-strings-fields.test.ts` falha se divergirem.
 */

type Spec = { key: string; label: string; multiline?: boolean; hint?: string };

const FIELDS: Spec[] = [
  { key: "collection_empty", label: "Collection empty" },
  { key: "wishlist_empty_title", label: "Wishlist empty title" },
  {
    key: "wishlist_empty_description",
    label: "Wishlist empty description",
    multiline: true,
  },
  { key: "wishlist_empty_cta", label: "Wishlist empty CTA" },
  { key: "products_empty", label: "Products listing empty" },
  {
    key: "pagination_page_of",
    label: "Pagination page of",
    hint: "Use {current} e {total}.",
  },
  { key: "video_default_label", label: "Video default label" },
  { key: "captions_default_label", label: "Captions default label" },
  {
    key: "order_confirmation_tracking_notice",
    label: "Order confirmation tracking notice",
    multiline: true,
  },
];

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

function stringPayload(spec: Spec) {
  const hint = [spec.hint, "Deixe vazio para usar o texto padrão do site."].filter(Boolean).join(" ");
  return spec.multiline
    ? {
        label: spec.label,
        hint,
        field_type: "text" as const,
        localized: true as const,
        validators: { length: { max: 400 } },
        appearance: { editor: "textarea", parameters: { placeholder: null }, addons: [] },
      }
    : {
        label: spec.label,
        hint,
        field_type: "string" as const,
        localized: true as const,
        validators: { length: { max: 160 } },
        appearance: { editor: "single_line", parameters: { heading: false, placeholder: null }, addons: [] },
      };
}

export default async function emptyStateUiStrings(client: Client): Promise<void> {
  const model = await client.itemTypes.find("ui_string");
  const fieldsets = await client.fieldsets.list(model.id);
  const fieldset =
    fieldsets.find((fs) => fs.title === "Empty states") ??
    (await client.fieldsets.create(model.id, {
      title: "Empty states",
      hint: "Listas vazias, paginação e avisos de sistema. Vazio = texto padrão do código.",
      collapsible: true,
      start_collapsed: false,
    }));

  for (const spec of FIELDS) {
    const payload = stringPayload(spec);
    const existing = await findField(client, `ui_string::${spec.key}`);
    if (existing) {
      await client.fields.update(existing.id, payload);
    } else {
      await client.fields.create(model.id, {
        ...payload,
        api_key: spec.key,
        fieldset: { type: "fieldset", id: fieldset.id },
      });
    }
  }
}
