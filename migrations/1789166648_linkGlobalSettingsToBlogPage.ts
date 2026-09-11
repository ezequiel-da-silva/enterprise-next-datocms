import { Client } from "datocms/lib/cma-client-node";

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

export default async function linkGlobalSettingsToBlogPage(client: Client): Promise<void> {
  const globalSetting = await client.itemTypes.find("global_setting");
  const page = await client.itemTypes.find("page");

  const payload = {
    label: "Blog page",
    hint: "Selecione a Page que funciona como índice do blog. O título, Hero, conteúdo, SEO e slug vêm desse registo; os artigos mantêm URLs estáveis em /{locale}/blog/{post}.",
    field_type: "link" as const,
    localized: false as const,
    validators: {
      item_item_type: {
        item_types: [page.id],
        on_publish_with_unpublished_references_strategy: "fail" as const,
        on_reference_unpublish_strategy: "fail" as const,
        on_reference_delete_strategy: "fail" as const,
      },
    },
    appearance: {
      editor: "link_embed",
      parameters: {},
      addons: [],
    },
  };

  const existing = await findField(client, "global_setting::blog_page");
  if (existing) {
    await client.fields.update(existing.id, payload);
    return;
  }

  await client.fields.create(globalSetting.id, {
    ...payload,
    api_key: "blog_page",
  });
}