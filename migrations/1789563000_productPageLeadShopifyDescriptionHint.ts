import { Client } from "datocms/lib/cma-client-node";

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

/** `lead` = descrição Shopify (texto), mesma regra de sync que o título. */
export default async function productPageLeadShopifyDescriptionHint(client: Client): Promise<void> {
  const lead = await findField(client, "product_page::lead");
  if (!lead) return;
  await client.fields.update(lead.id, {
    label: "Description",
    hint: "Descrição do produto (texto). Locale en sincroniza com a Descrição da Shopify; pt-BR e es via Translations (Markets). O HTML da Admin é convertido a texto. Para prosa rica só no site, usa Body.",
  });
}
