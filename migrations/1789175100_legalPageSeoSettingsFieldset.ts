import { Client } from "datocms/lib/cma-client-node";

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

export default async function legalPageSeoSettingsFieldset(client: Client): Promise<void> {
  const legal = await client.itemTypes.find("legal_page");
  const pageSocial = await client.fields.find("page::seo_settings_social");
  const pageAnalysis = await client.fields.find("page::seo_analysis");

  const fieldsets = await client.fieldsets.list(legal.id);
  let seoFieldset = fieldsets.find((fs) => fs.title === "🚀 SEO settings");
  if (!seoFieldset) {
    seoFieldset = await client.fieldsets.create(legal.id, {
      title: "🚀 SEO settings",
      hint: null,
      collapsible: false,
      start_collapsed: false,
    });
  }

  const general = fieldsets.find((fs) => fs.title === "📝 General settings");
  const contentSet = fieldsets.find((fs) => fs.title === "✍️ Content");

  const socialPayload = {
    label: pageSocial.label,
    hint: pageSocial.hint,
    field_type: "seo" as const,
    localized: true as const,
    validators: pageSocial.validators,
    appearance: pageSocial.appearance,
    default_value: pageSocial.default_value,
  };

  const existingSocial = await findField(client, "legal_page::seo_settings_social");
  const social = existingSocial
    ? await client.fields.update(existingSocial.id, socialPayload)
    : await client.fields.create(legal.id, {
        ...socialPayload,
        api_key: "seo_settings_social",
      });

  const analysisPayload = {
    label: pageAnalysis.label,
    hint: pageAnalysis.hint,
    field_type: "json" as const,
    localized: true as const,
    validators: pageAnalysis.validators,
    appearance: pageAnalysis.appearance,
    default_value: pageAnalysis.default_value,
  };

  const existingAnalysis = await findField(client, "legal_page::seo_analysis");
  const analysis = existingAnalysis
    ? await client.fields.update(existingAnalysis.id, analysisPayload)
    : await client.fields.create(legal.id, {
        ...analysisPayload,
        api_key: "seo_analysis",
      });

  const title = await client.fields.find("legal_page::title");
  const slug = await client.fields.find("legal_page::slug");
  const content = await client.fields.find("legal_page::content");

  const fieldsetRef = (id: string | undefined) =>
    id ? { data: { id, type: "fieldset" as const } } : { data: null };

  await client.itemTypes.rawReorderFieldsAndFieldsets(legal.id, {
    data: [
      ...(general
        ? [{ id: general.id, type: "fieldset" as const, attributes: { position: 1 } }]
        : []),
      ...(contentSet
        ? [{ id: contentSet.id, type: "fieldset" as const, attributes: { position: 2 } }]
        : []),
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
