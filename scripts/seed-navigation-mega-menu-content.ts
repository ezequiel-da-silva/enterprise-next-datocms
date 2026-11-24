/**
 * Seeds categorized mega-menu content into `navigation.menu_links`:
 *
 * - One `navigation_mega_menu` per locale labelled Shop / Loja / Tienda
 * - Columns: Nível · Terreno · Coleções (heuristic buckets + fallbacks)
 * - Optional campaign CTA → Best of / Destaques
 * - Removes the flat Shop/Loja/Tienda modular nav item (avoids Hick duplication)
 *
 * Requires schema from `setup-navigation-mega-menu.ts`. Idempotent.
 * `MEGA_MENU_FORCE=1` rebuilds categories/campaign even when a mega already exists.
 *
 *   npx datocms cma:script scripts/seed-navigation-mega-menu-content.ts --profile=staging
 *   npx datocms cma:script scripts/seed-navigation-mega-menu-content.ts --profile=default
 */
import { buildBlockRecord } from "@datocms/cma-client-node";
import type { Client } from "datocms/lib/cma-client-node";
import {
  type BlockPayload,
  type Raw,
  asLocalized,
  blockAttr,
  blockId,
  blockTypeId,
  field,
  findPageBySlug,
  publishIfDraftModel,
  ref,
  textIn,
} from "./lib/dato-script-helpers";
import setupNavigationMegaMenu from "./setup-navigation-mega-menu";

type CatalogHit = { id: string; handle: string; title: Raw };

type LocaleUi = {
  megaLabel: string;
  levelTitle: string;
  terrainTitle: string;
  collectionsTitle: string;
  catalogLabel: string;
  highlightsLabel: string;
  viewAllLabel: string;
  campaignTitle: string;
  campaignDescription: string;
  campaignCta: string;
  appLocale: "en" | "pt" | "es";
};

const UI: Record<string, LocaleUi> = {
  en: {
    megaLabel: "Shop",
    levelTitle: "Level",
    terrainTitle: "Terrain",
    collectionsTitle: "Collections",
    catalogLabel: "Full catalog",
    highlightsLabel: "Season highlights",
    viewAllLabel: "View all collections",
    campaignTitle: "Best of the season",
    campaignDescription: "Curated boards and easy gift picks.",
    campaignCta: "See Best of",
    appLocale: "en",
  },
  "pt-BR": {
    megaLabel: "Loja",
    levelTitle: "Nível",
    terrainTitle: "Terreno",
    collectionsTitle: "Coleções",
    catalogLabel: "Catálogo completo",
    highlightsLabel: "Destaques da temporada",
    viewAllLabel: "Ver todas as coleções",
    campaignTitle: "Destaques da temporada",
    campaignDescription: "Pranchas selecionadas e opções fáceis de presentear.",
    campaignCta: "Ver Destaques",
    appLocale: "pt",
  },
  es: {
    megaLabel: "Tienda",
    levelTitle: "Nivel",
    terrainTitle: "Terreno",
    collectionsTitle: "Colecciones",
    catalogLabel: "Catálogo completo",
    highlightsLabel: "Destacados de la temporada",
    viewAllLabel: "Ver todas las colecciones",
    campaignTitle: "Destacados de la temporada",
    campaignDescription: "Tablas seleccionadas y regalos fáciles.",
    campaignCta: "Ver Destacados",
    appLocale: "es",
  },
};

const LEVEL_RE = /\b(beginner|intermediate|advanced|iniciante|intermedi[aá]rio|avan[cç]ad[oa]|nivel|level|rider)\b/i;
const TERRAIN_RE =
  /\b(powder|park|all[- ]?mountain|freestyle|freeride|piste|pista|terreno|terrain|backcountry)\b/i;
const SKIP_HANDLES = new Set(["frontpage", "home-page"]);
const SHOP_SLUGS = new Set(["shop", "loja", "tienda"]);
const MEGA_LABELS = new Set(["shop", "loja", "tienda"]);

function uiFor(locale: string): LocaleUi {
  return UI[locale] ?? UI.en;
}

function normalizePath(link: string | null): string | null {
  if (!link) return null;
  return link.replace(/\/$/, "") || "/";
}

function isFlatShopLink(link: string | null): boolean {
  const path = normalizePath(link);
  if (!path) return false;
  const segments = path.split("/").filter(Boolean);
  const last = segments[segments.length - 1]?.toLowerCase() ?? "";
  return SHOP_SLUGS.has(last);
}

async function loadCollections(client: Client): Promise<CatalogHit[]> {
  const out: CatalogHit[] = [];
  for await (const record of client.items.listPagedIterator({
    filter: { type: "collection_page" },
    version: "published",
  })) {
    const handle = field(record, "shopify_handle");
    if (typeof handle !== "string" || !handle.trim()) continue;
    const normalized = handle.trim().toLowerCase();
    if (SKIP_HANDLES.has(normalized)) continue;
    out.push({ id: record.id, handle: handle.trim(), title: field(record, "title") });
  }
  return out;
}

function collectionLabel(locale: string, hit: CatalogHit): string {
  return textIn(hit.title, locale) ?? hit.handle;
}

function pageLink(
  linkTypeId: string,
  label: string,
  pageId: string,
): ReturnType<typeof buildBlockRecord> {
  return buildBlockRecord({
    item_type: ref(linkTypeId),
    cta_label: label,
    type_content: "page",
    external_link: "",
    internal_link_page: pageId,
    internal_link_post: null,
    internal_link_category: null,
    internal_link_author: null,
    internal_link_product: null,
    internal_link_collection: null,
    open_in_new_tab: false,
    cta_link_aria: label,
  });
}

function collectionLink(
  linkTypeId: string,
  label: string,
  collectionId: string,
): ReturnType<typeof buildBlockRecord> {
  return buildBlockRecord({
    item_type: ref(linkTypeId),
    cta_label: label,
    type_content: "collection",
    external_link: "",
    internal_link_page: null,
    internal_link_post: null,
    internal_link_category: null,
    internal_link_author: null,
    internal_link_product: null,
    internal_link_collection: collectionId,
    open_in_new_tab: false,
    cta_link_aria: label,
  });
}

function categoryBlock(
  categoryTypeId: string,
  title: string,
  links: ReturnType<typeof buildBlockRecord>[],
): ReturnType<typeof buildBlockRecord> {
  return buildBlockRecord({
    item_type: ref(categoryTypeId),
    title,
    links,
  });
}

export default async function seedNavigationMegaMenuContent(client: Client): Promise<void> {
  const site = await client.site.find();
  const locales = site.locales;
  const force = process.env.MEGA_MENU_FORCE === "1";
  console.log(`Site ${site.id} (${site.name}) — locales: ${locales.join(", ")}`);
  console.log(`Environment: ${process.env.DATOCMS_ENVIRONMENT ?? "(default / profile)"}`);

  await setupNavigationMegaMenu(client);

  const [link, megaType, categoryType, campaignType] = await Promise.all([
    client.itemTypes.find("link"),
    client.itemTypes.find("navigation_mega_menu"),
    client.itemTypes.find("nav_mega_menu_category"),
    client.itemTypes.find("nav_mega_menu_campaign"),
  ]);

  const [shopPage, collectionsPage, bestOfPage] = await Promise.all([
    findPageBySlug(client, SHOP_SLUGS),
    findPageBySlug(client, new Set(["collections", "colecoes", "colecciones"])),
    findPageBySlug(client, new Set(["best-of", "melhores", "lo-mejor"])),
  ]);

  const collections = await loadCollections(client);
  console.log(`  collection_page: ${collections.map((c) => c.handle).join(", ") || "(nenhuma)"}`);
  if (!shopPage) console.warn("  página Shop ausente — fallbacks de Nível/Terreno limitados.");
  if (!collectionsPage) console.warn("  página Coleções ausente — sem “Ver todas”.");
  if (!bestOfPage) console.warn("  página Best of ausente — campaign sem CTA.");

  const [navigation] = await client.items.list({ filter: { type: "navigation" }, nested: true });
  if (!navigation) {
    throw new Error("Singleton navigation not found.");
  }

  const nestedMenu = asLocalized<Raw[]>(field(navigation, "menu_links"));
  let removedShop = 0;
  let wroteMega = 0;

  const nextMenu = Object.fromEntries(
    locales.map((l) => {
      const ui = uiFor(l);
      const kept: BlockPayload[] = [];
      let existingMegaId: string | null = null;

      for (const block of nestedMenu[l] ?? []) {
        const id = blockId(block);
        if (!id) continue;

        if (blockTypeId(block) === megaType.id) {
          const label = blockAttr(block, "label");
          const labelNorm = typeof label === "string" ? label.trim().toLowerCase() : "";
          if (!existingMegaId && (MEGA_LABELS.has(labelNorm) || !labelNorm)) {
            existingMegaId = id;
            continue;
          }
          kept.push(id);
          continue;
        }

        const linkPath = blockAttr(block, "nav_item_link");
        const linkStr = typeof linkPath === "string" ? linkPath : null;
        const label = blockAttr(block, "nav_item_label");
        const labelNorm = typeof label === "string" ? label.trim().toLowerCase() : "";
        if (isFlatShopLink(linkStr) || MEGA_LABELS.has(labelNorm)) {
          removedShop += 1;
          continue;
        }
        kept.push(id);
      }

      const levelHits = collections.filter(
        (c) => LEVEL_RE.test(c.handle) || LEVEL_RE.test(collectionLabel(l, c)),
      );
      const terrainHits = collections.filter(
        (c) => TERRAIN_RE.test(c.handle) || TERRAIN_RE.test(collectionLabel(l, c)),
      );
      const used = new Set([...levelHits, ...terrainHits].map((c) => c.id));
      const restHits = collections.filter((c) => !used.has(c.id)).slice(0, 6);

      const levelLinks: ReturnType<typeof buildBlockRecord>[] = [];
      if (levelHits.length > 0) {
        for (const hit of levelHits.slice(0, 6)) {
          levelLinks.push(collectionLink(link.id, collectionLabel(l, hit), hit.id));
        }
      } else {
        if (shopPage) levelLinks.push(pageLink(link.id, ui.catalogLabel, shopPage.id));
        if (bestOfPage) levelLinks.push(pageLink(link.id, ui.highlightsLabel, bestOfPage.id));
      }

      const terrainLinks: ReturnType<typeof buildBlockRecord>[] = [];
      if (terrainHits.length > 0) {
        for (const hit of terrainHits.slice(0, 6)) {
          terrainLinks.push(collectionLink(link.id, collectionLabel(l, hit), hit.id));
        }
      } else if (restHits.length > 0) {
        for (const hit of restHits.slice(0, 3)) {
          terrainLinks.push(collectionLink(link.id, collectionLabel(l, hit), hit.id));
        }
      } else if (shopPage) {
        terrainLinks.push(pageLink(link.id, ui.catalogLabel, shopPage.id));
      }

      const collectionLinks: ReturnType<typeof buildBlockRecord>[] = [];
      const pool = restHits.length > 0 ? restHits : collections.slice(0, 6);
      for (const hit of pool) {
        collectionLinks.push(collectionLink(link.id, collectionLabel(l, hit), hit.id));
      }
      if (collectionsPage) {
        collectionLinks.push(pageLink(link.id, ui.viewAllLabel, collectionsPage.id));
      }

      if (levelLinks.length === 0 && shopPage) {
        levelLinks.push(pageLink(link.id, ui.catalogLabel, shopPage.id));
      }
      if (terrainLinks.length === 0 && shopPage) {
        terrainLinks.push(pageLink(link.id, ui.catalogLabel, shopPage.id));
      }
      if (collectionLinks.length === 0 && collectionsPage) {
        collectionLinks.push(pageLink(link.id, ui.viewAllLabel, collectionsPage.id));
      }

      const categories = [
        categoryBlock(categoryType.id, ui.levelTitle, levelLinks),
        categoryBlock(categoryType.id, ui.terrainTitle, terrainLinks),
        categoryBlock(categoryType.id, ui.collectionsTitle, collectionLinks),
      ];

      const campaign =
        bestOfPage != null
          ? [
              buildBlockRecord({
                item_type: ref(campaignType.id),
                title: ui.campaignTitle,
                description: ui.campaignDescription,
                cta: [pageLink(link.id, ui.campaignCta, bestOfPage.id)],
                image: null,
              }),
            ]
          : [];

      // Always rewrite mega payload so columns/labels stay in sync (idempotent).
      // MEGA_MENU_FORCE is reserved for operators who want an explicit rebuild signal in logs.
      if (force) console.log(`  MEGA_MENU_FORCE=1 — reescrevendo mega (${l})`);

      wroteMega += 1;
      const megaPayload = buildBlockRecord({
        ...(existingMegaId ? { id: existingMegaId } : {}),
        item_type: ref(megaType.id),
        label: ui.megaLabel,
        categories,
        campaign,
      });

      // Commerce-first: mega Shop first, then remaining links (Coleções / Destaques / …).
      return [l, [megaPayload, ...kept]];
    }),
  );

  await client.items.update(navigation.id, { menu_links: nextMenu });
  console.log(`  mega-menu escrito (${wroteMega} locale(s)); Loja plana removida: ${removedShop}`);
  await publishIfDraftModel(client, await client.items.find(navigation.id), "navigation");
  console.log("Concluído. Mega-menu Loja/Shop/Tienda com Nível · Terreno · Coleções.");
}
