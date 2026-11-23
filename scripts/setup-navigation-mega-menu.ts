/**
 * Adds navigation mega-menu blocks and allows them in `navigation::menu_links`.
 *
 * Blocks:
 * - `nav_mega_menu_campaign` — title, description, CTA (`link`), optional image
 * - `nav_mega_menu_category` — title + child `link` blocks (prefer collection_page)
 * - `navigation_mega_menu` — label + categories + optional campaign
 *
 * Idempotent. Does not rewrite existing menu content.
 *
 *   npx datocms cma:script scripts/setup-navigation-mega-menu.ts --profile=staging
 *   npx datocms cma:script scripts/setup-navigation-mega-menu.ts --profile=default
 */
import { ApiError, type ApiTypes } from "@datocms/cma-client-node";
import type { Client } from "datocms/lib/cma-client-node";

async function findItemType(client: Client, apiKey: string) {
  try {
    return await client.itemTypes.find(apiKey);
  } catch (error) {
    if (error instanceof ApiError && (error.response.status === 404 || error.response.status === 422)) {
      return null;
    }
    throw error;
  }
}

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch (error) {
    if (error instanceof ApiError && (error.response.status === 404 || error.response.status === 422)) {
      return null;
    }
    throw error;
  }
}

async function ensureBlock(client: Client, apiKey: string, name: string) {
  const existing = await findItemType(client, apiKey);
  if (existing) {
    console.log(`  block já existe: ${apiKey}`);
    return existing;
  }
  const created = await client.itemTypes.create({
    name,
    api_key: apiKey,
    modular_block: true,
    sortable: false,
    tree: false,
    singleton: false,
    draft_mode_active: false,
    all_locales_required: false,
    collection_appearance: "compact",
    hint: null,
  } as ApiTypes.ItemTypeCreateSchema);
  console.log(`  block criado: ${apiKey}`);
  return created;
}

async function ensureField(
  client: Client,
  ownerId: string,
  pointer: string,
  apiKey: string,
  body: Omit<ApiTypes.FieldCreateSchema, "api_key">,
) {
  const existing = await findField(client, pointer);
  if (existing) {
    console.log(`  campo já existe: ${pointer}`);
    return existing;
  }
  const created = await client.fields.create(ownerId, {
    ...body,
    api_key: apiKey,
  } as ApiTypes.FieldCreateSchema);
  console.log(`  campo criado: ${pointer}`);
  return created;
}

export default async function setupNavigationMegaMenu(client: Client): Promise<void> {
  const site = await client.site.find();
  console.log(`Site ${site.id} (${site.name})`);

  const link = await client.itemTypes.find("link");
  const navigation = await client.itemTypes.find("navigation");
  const navModular = await client.itemTypes.find("nav_item_modular");

  const campaign = await ensureBlock(client, "nav_mega_menu_campaign", "Mega menu campaign");
  const category = await ensureBlock(client, "nav_mega_menu_category", "Mega menu category");
  const mega = await ensureBlock(client, "navigation_mega_menu", "Navigation mega menu");

  // Labels inherit locale from localized parent `menu_links` (same as nav_item_*).
  await ensureField(client, campaign.id, "nav_mega_menu_campaign::title", "title", {
    label: "Title",
    hint: "Headline do banner de campanha no mega-menu.",
    field_type: "string",
    localized: false,
    validators: { required: {}, length: { max: 80 } },
    appearance: { editor: "single_line", parameters: { heading: false }, addons: [] },
  });

  await ensureField(client, campaign.id, "nav_mega_menu_campaign::description", "description", {
    label: "Description",
    hint: "Uma frase curta sob o título.",
    field_type: "text",
    localized: false,
    validators: { length: { max: 200 } },
    appearance: { editor: "textarea", parameters: {}, addons: [] },
  });

  await ensureField(client, campaign.id, "nav_mega_menu_campaign::cta", "cta", {
    label: "CTA",
    hint: "Botão do banner — preferir Type content = Collection (collection_page).",
    field_type: "rich_text",
    localized: false,
    validators: {
      rich_text_blocks: { item_types: [link.id] },
      size: { min: 1, max: 1 },
    },
    appearance: { editor: "rich_text", parameters: { start_collapsed: false }, addons: [] },
  });

  await ensureField(client, campaign.id, "nav_mega_menu_campaign::image", "image", {
    label: "Image",
    hint: "Imagem opcional do banner (recomendado ~600×800).",
    field_type: "file",
    localized: false,
    validators: {
      extension: { extensions: ["jpg", "jpeg", "png", "webp", "avif", "gif"] },
      required_alt_title: { alt: true, title: false },
    },
    appearance: { editor: "file", parameters: {}, addons: [] },
  });

  await ensureField(client, category.id, "nav_mega_menu_category::title", "title", {
    label: "Category title",
    hint: "Ex.: Boards, Bindings.",
    field_type: "string",
    localized: false,
    validators: { required: {}, length: { max: 60 } },
    appearance: { editor: "single_line", parameters: { heading: false }, addons: [] },
  });

  await ensureField(client, category.id, "nav_mega_menu_category::links", "links", {
    label: "Links",
    hint: "Use blocos Link com Type content = Collection para PLPs estáveis.",
    field_type: "rich_text",
    localized: false,
    validators: {
      rich_text_blocks: { item_types: [link.id] },
      size: { min: 1, max: 12 },
    },
    appearance: { editor: "rich_text", parameters: { start_collapsed: false }, addons: [] },
  });

  await ensureField(client, mega.id, "navigation_mega_menu::label", "label", {
    label: "Menu label",
    hint: "Rótulo no header (ex.: Shop).",
    field_type: "string",
    localized: false,
    validators: { required: {}, length: { max: 40 } },
    appearance: { editor: "single_line", parameters: { heading: false }, addons: [] },
  });

  await ensureField(client, mega.id, "navigation_mega_menu::categories", "categories", {
    label: "Categories",
    hint: "Colunas do mega-menu.",
    field_type: "rich_text",
    localized: false,
    validators: {
      rich_text_blocks: { item_types: [category.id] },
      size: { min: 1, max: 6 },
    },
    appearance: { editor: "rich_text", parameters: { start_collapsed: false }, addons: [] },
  });

  await ensureField(client, mega.id, "navigation_mega_menu::campaign", "campaign", {
    label: "Campaign banner",
    hint: "Slot opcional de campanha (imagem + CTA).",
    field_type: "rich_text",
    localized: false,
    validators: {
      rich_text_blocks: { item_types: [campaign.id] },
      size: { max: 1 },
    },
    appearance: { editor: "rich_text", parameters: { start_collapsed: true }, addons: [] },
  });

  const menuLinks = await client.fields.find("navigation::menu_links");
  const validators = menuLinks.validators;
  const currentTypes =
    validators &&
    "rich_text_blocks" in validators &&
    validators.rich_text_blocks &&
    Array.isArray(validators.rich_text_blocks.item_types)
      ? validators.rich_text_blocks.item_types
      : [];
  const nextTypes = [...new Set([...currentTypes, navModular.id, mega.id])];
  await client.fields.update(menuLinks.id, {
    hint:
      "Links do header. Use Navigation mega menu para categorias + banner; Nav item modular para links simples/flyouts.",
    validators: {
      rich_text_blocks: { item_types: nextTypes },
    },
  });
  console.log(`  menu_links atualizado (aceita navigation_mega_menu)`);
}
