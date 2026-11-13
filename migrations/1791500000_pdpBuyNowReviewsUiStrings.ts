import { Client } from "datocms/lib/cma-client-node";

/**
 * Buy now + PDP product reviews chrome on `ui_string`.
 * Empty field = built-in text in `src/lib/i18n/pdp-copy.ts`.
 *
 *   npx datocms cma:script scripts/seed-ui-strings.ts --profile=staging|default
 */

type Spec = { key: string; label: string; hint?: string };

const FIELDS: Spec[] = [
  { key: "pdp_buy_now", label: "PDP buy now" },
  { key: "pdp_buying", label: "PDP buying (pending)" },
  { key: "pdp_reviews_title", label: "PDP reviews title" },
  { key: "pdp_verified_rider", label: "PDP verified rider badge" },
  {
    key: "pdp_reviews_aggregate_template",
    label: "PDP reviews aggregate template",
    hint: "Use {average} and {count}.",
  },
];

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

export default async function pdpBuyNowReviewsUiStrings(client: Client): Promise<void> {
  const model = await client.itemTypes.find("ui_string");
  const fieldsets = await client.fieldsets.list(model.id);
  const fieldset =
    fieldsets.find((fs) => fs.title === "🏂 PDP") ??
    (await client.fieldsets.create(model.id, {
      title: "🏂 PDP",
      hint: "Ficha da prancha, stock, buy now e avaliações. Vazio = texto padrão do código.",
      collapsible: true,
      start_collapsed: false,
    }));

  for (const spec of FIELDS) {
    const hint = [spec.hint, "Deixe vazio para usar o texto padrão do site."].filter(Boolean).join(" ");
    const payload = {
      label: spec.label,
      hint,
      field_type: "string" as const,
      localized: true as const,
      validators: { length: { max: 160 } },
      appearance: { editor: "single_line", parameters: { heading: false, placeholder: null }, addons: [] },
    };
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
