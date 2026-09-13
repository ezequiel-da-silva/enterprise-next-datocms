import { Client } from "datocms/lib/cma-client-node";

/** Espelha o fieldset "🚀 SEO settings" de `page` (mesmos validators/appearance) em `legal_page`. */
const SEO_SOCIAL = {
  label: "SEO Settings & Social",
  field_type: "seo" as const,
  localized: true as const,
  validators: {
    title_length: { max: 60 },
    description_length: { max: 160 },
  },
  appearance: {
    addons: [],
    editor: "seo",
    parameters: {
      fields: ["title", "description", "image", "no_index", "twitter_card"],
      previews: ["google", "twitter", "facebook", "linkedin", "slack", "telegram", "whatsapp"],
    },
  },
};

const SEO_ANALYSIS = {
  label: "SEO/Readability Analysis",
  field_type: "json" as const,
  localized: true as const,
  validators: {},
  appearance: {
    addons: [],
    editor: "json",
    parameters: {},
  },
};

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

export default async function legalPageSeoSettingsFieldset(client: Client): Promise<void> {
  const legal = await client.itemTypes.find("legal_page");

  const fieldsets = await client.fieldsets.list(legal.id);
  const seoFieldset =
    fieldsets.find((fs) => fs.title === "🚀 SEO settings") ??
    (await client.fieldsets.create(legal.id, {
      title: "🚀 SEO settings",
      hint: null,
      collapsible: false,
      start_collapsed: false,
    }));

  const general = fieldsets.find((fs) => fs.title === "📝 General settings");
  const contentSet = fieldsets.find((fs) => fs.title === "✍️ Content");

  const existingSocial = await findField(client, "legal_page::seo_settings_social");
  const social = existingSocial
    ? await client.fields.update(existingSocial.id, SEO_SOCIAL)
    : await client.fields.create(legal.id, { ...SEO_SOCIAL, api_key: "seo_settings_social" });

  const existingAnalysis = await findField(client, "legal_page::seo_analysis");
  const analysis = existingAnalysis
    ? await client.fields.update(existingAnalysis.id, SEO_ANALYSIS)
    : await client.fields.create(legal.id, { ...SEO_ANALYSIS, api_key: "seo_analysis" });

  const title = await client.fields.find("legal_page::title");
  const slug = await client.fields.find("legal_page::slug");
  const content = await client.fields.find("legal_page::content");

  const fieldsetRef = (id: string | undefined) =>
    id ? { data: { id, type: "fieldset" as const } } : { data: null };

  await client.itemTypes.rawReorderFieldsAndFieldsets(legal.id, {
    data: [
      ...(general ? [{ id: general.id, type: "fieldset" as const, attributes: { position: 1 } }] : []),
      ...(contentSet ? [{ id: contentSet.id, type: "fieldset" as const, attributes: { position: 2 } }] : []),
      { id: seoFieldset.id, type: "fieldset" as const, attributes: { position: 3 } },
      {
        id: title.id,
        type: "field" as const,
        attributes: { position: 0 },
        relationships: { fieldset: fieldsetRef(general?.id) },
      },
      {
        id: slug.id,
        type: "field" as const,
        attributes: { position: 1 },
        relationships: { fieldset: fieldsetRef(general?.id) },
      },
      {
        id: content.id,
        type: "field" as const,
        attributes: { position: 0 },
        relationships: { fieldset: fieldsetRef(contentSet?.id) },
      },
      {
        id: social.id,
        type: "field" as const,
        attributes: { position: 0 },
        relationships: { fieldset: fieldsetRef(seoFieldset.id) },
      },
      {
        id: analysis.id,
        type: "field" as const,
        attributes: { position: 1 },
        relationships: { fieldset: fieldsetRef(seoFieldset.id) },
      },
    ],
  });
}
