/**
 * Updates only the pt-BR `hero_page.subtitle_hero` on the home page.
 * EN and ES blocks are resent unchanged. Idempotent.
 *
 *   npx datocms cma:script scripts/update-home-hero-pt.ts --profile=staging
 *   npx datocms cma:script scripts/update-home-hero-pt.ts --profile=default
 */
import { buildBlockRecord } from "@datocms/cma-client-node";
import type { Client } from "datocms/lib/cma-client-node";
import {
  asLocalized,
  blockAttr,
  blockId,
  blockTypeId,
  field,
  findPageBySlug,
  publishIfDraftModel,
  ref,
  type Raw,
} from "./lib/dato-script-helpers";

const PT = "pt-BR";
const DESIRED =
  "Escolha a prancha ideal para a próxima descida — frete e pagamento claros até o checkout.";

function plainStructuredText(paragraph: string) {
  return {
    schema: "dast" as const,
    document: {
      type: "root" as const,
      children: [{ type: "paragraph" as const, children: [{ type: "span" as const, value: paragraph }] }],
    },
  };
}

function collectText(node: Raw): string {
  if (!node || typeof node !== "object") return "";
  const value = field(node, "value");
  const own = typeof value === "string" ? value : "";
  const children = field(node, "children");
  const nested = Array.isArray(children) ? children.map((child) => collectText(child as Raw)).join(" ") : "";
  const document = field(node, "document");
  return `${own} ${nested} ${document ? collectText(document) : ""}`.replace(/\s+/g, " ").trim();
}

function uploadId(value: Raw): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (!value || typeof value !== "object") return null;
  const id = field(value, "upload_id") ?? field(value, "id");
  return typeof id === "string" ? id : null;
}

function nestedIds(raw: Raw): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    const id = blockId(item as Raw);
    return id ? [id] : [];
  });
}

function rebuildHero(existing: Raw, subtitle: Raw) {
  const id = blockId(existing);
  const typeId = blockTypeId(existing);
  if (!id || !typeId) return existing;
  const imageRaw = blockAttr(existing, "image_hero");
  const imageId = blockId(imageRaw);
  const imageType = blockTypeId(imageRaw);
  const mobile = uploadId(blockAttr(imageRaw, "asset_mobile"));
  const desktop = uploadId(blockAttr(imageRaw, "asset_desktop"));

  return buildBlockRecord({
    id,
    item_type: ref(typeId),
    layout_hero: blockAttr(existing, "layout_hero") ?? "image_side",
    title_hero: blockAttr(existing, "title_hero") ?? null,
    subtitle_hero: subtitle,
    show_button: blockAttr(existing, "show_button") ?? false,
    button_hero: nestedIds(blockAttr(existing, "button_hero")),
    show_image_hero: blockAttr(existing, "show_image_hero") ?? false,
    image_hero:
      imageId && imageType && mobile && desktop
        ? buildBlockRecord({
            id: imageId,
            item_type: ref(imageType),
            asset_mobile: { upload_id: mobile },
            asset_desktop: { upload_id: desktop },
          })
        : (blockAttr(existing, "image_hero") ?? null),
    show_image_overlay: blockAttr(existing, "show_image_overlay") ?? false,
    image_overlay: blockAttr(existing, "image_overlay") ?? null,
  });
}

export default async function updateHomeHeroPt(client: Client): Promise<void> {
  const site = await client.site.find();
  console.log(`Site ${site.id} (${site.name}) — locales: ${site.locales.join(", ")}`);

  const page = await findPageBySlug(client, new Set(["home"]));
  if (!page) throw new Error('Page slug "home" not found');

  const full = await client.items.find(page.id, { nested: true });
  const heroes = asLocalized<Raw>(field(full, "hero_page"));
  const current = heroes[PT];
  if (!current || !blockId(current)) {
    console.warn(`  hero_page ausente em ${PT} — nada alterado`);
    return;
  }

  const visible = collectText(blockAttr(current, "subtitle_hero"));
  if (visible === DESIRED) {
    console.log(`  ${PT} subtitle já alinhado — skip`);
    return;
  }

  console.log(`  ${PT}: "${visible || "(vazio)"}" → "${DESIRED}"`);

  const nextHero = Object.fromEntries(
    site.locales.map((locale) => {
      const block = heroes[locale];
      if (!block || !blockId(block)) return [locale, block ?? null];
      if (locale !== PT) return [locale, rebuildHero(block, blockAttr(block, "subtitle_hero") ?? null)];
      return [locale, rebuildHero(block, plainStructuredText(DESIRED))];
    }),
  );

  await client.items.update(page.id, { hero_page: nextHero });
  await publishIfDraftModel(client, await client.items.find(page.id), "home");
  console.log("Concluído. Subtítulo do hero pt-BR atualizado.");
}
