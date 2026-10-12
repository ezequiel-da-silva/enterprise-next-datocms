/**
 * Creates (or completes) the Shopify collections index page and wires it into the site:
 *
 * - `page` "Coleções" / "Collections" / "Colecciones" with a `feature_grid` of one
 *   `card` (`card_source: collection`) per published `collection_page`
 *   (`frontpage` / `home-page` skipped — Shopify storefront collections, not PLPs).
 * - `navigation.menu_links`: appends a top-level item per locale (skipped if the link exists).
 * - `global_setting.collections_page`: set when empty (`COLLECTIONS_PAGE_FORCE=1` overwrites).
 *
 * Idempotent: re-running finds the page by slug and keeps an existing grid.
 * `COLLECTIONS_PAGE_REBUILD=1` replaces the grid with the current list of collections.
 *
 *   npx datocms cma:script scripts/setup-shopify-collections-page.ts --profile=default
 */
import { buildBlockRecord } from "@datocms/cma-client-node";
import type { Client } from "datocms/lib/cma-client-node";
import {
  type BlockPayload,
  type Raw,
  asLocalized,
  blockId,
  blockTypeId,
  carouselOptions,
  ensureGlobalSettingPage,
  ensureNavLink,
  field,
  findPageBySlug,
  publishIfDraftModel,
  ref,
  textHeaderBlock,
  textIn,
} from "./lib/dato-script-helpers";

type LocaleCopy = {
  title: string;
  slug: string;
  appLocale: "en" | "pt" | "es";
  gridTitle: string;
  gridDescription: string;
  seoDescription: string;
};

const COPY: Record<string, LocaleCopy> = {
  en: {
    title: "Collections",
    slug: "collections",
    appLocale: "en",
    gridTitle: "Shop by collection",
    gridDescription: "Pick a collection to see its products.",
    seoDescription: "Browse our product collections.",
  },
  "pt-BR": {
    title: "Coleções",
    slug: "colecoes",
    appLocale: "pt",
    gridTitle: "Compre por coleção",
    gridDescription: "Escolha uma coleção para ver os produtos.",
    seoDescription: "Conheça as nossas coleções de produtos.",
  },
  es: {
    title: "Colecciones",
    slug: "colecciones",
    appLocale: "es",
    gridTitle: "Compra por colección",
    gridDescription: "Elige una colección para ver sus productos.",
    seoDescription: "Descubre nuestras colecciones de productos.",
  },
};

const SKIP_HANDLES = new Set(["frontpage", "home-page"]);

function copyFor(locale: string): LocaleCopy {
  return COPY[locale] ?? COPY.en;
}

function defaultPath(locale: string): string {
  const c = copyFor(locale);
  return `/${c.appLocale}/${c.slug}`;
}

export default async function setupShopifyCollectionsPage(client: Client): Promise<void> {
  const site = await client.site.find();
  const locales = site.locales;
  console.log(`Site ${site.id} (${site.name}) — locales: ${locales.join(", ")}`);

  const [pageModel, textHeader, featureGrid, card, navItem, carouselSetting] = await Promise.all([
    client.itemTypes.find("page"),
    client.itemTypes.find("text_header"),
    client.itemTypes.find("feature_grid"),
    client.itemTypes.find("card"),
    client.itemTypes.find("nav_item_modular"),
    client.itemTypes.find("carousel_setting"),
  ]);

  const collections: { id: string; title: Raw; handle: string }[] = [];
  for await (const record of client.items.listPagedIterator({
    filter: { type: "collection_page" },
    order_by: "_created_at_ASC",
    version: "published",
  })) {
    const handle = field(record, "shopify_handle");
    if (typeof handle !== "string" || SKIP_HANDLES.has(handle.toLowerCase())) continue;
    collections.push({ id: record.id, title: field(record, "title"), handle });
  }
  console.log(`  collection_page publicados: ${collections.length}`);
  if (collections.length === 0) {
    console.warn("  sem collection_page — corra `npm run shopify:backfill:collections`, publique e repita.");
  }

  const gridBlock = (locale: string) => {
    const c = copyFor(locale);
    return buildBlockRecord({
      item_type: ref(featureGrid.id),
      text_header_section: [textHeaderBlock(textHeader.id, c.gridTitle, c.gridDescription)],
      advanced_options: false,
      variant: null,
      carousel_options: carouselOptions(carouselSetting.id),
      items_feature_grid: collections.map((collection) =>
        buildBlockRecord({
          item_type: ref(card.id),
          card_source: "collection",
          source_product: null,
          source_collection: collection.id,
          title_card: textIn(collection.title, locale) ?? collection.handle,
          has_icon: false,
          icon_card: null,
          has_description: false,
          description_card: null,
          has_image: false,
          image_card: null,
          has_link: false,
          link_card: null,
        }),
      ),
    });
  };

  // --- Page ---------------------------------------------------------------
  let page = await findPageBySlug(client, new Set(Object.values(COPY).map((c) => c.slug)));

  if (!page) {
    page = await client.items.create({
      item_type: ref(pageModel.id),
      title: Object.fromEntries(locales.map((l) => [l, copyFor(l).title])),
      slug: Object.fromEntries(locales.map((l) => [l, copyFor(l).slug])),
      hero_page: Object.fromEntries(locales.map((l) => [l, null])),
      content_page: Object.fromEntries(locales.map((l) => [l, collections.length > 0 ? [gridBlock(l)] : []])),
      seo_settings_social: Object.fromEntries(
        locales.map((l) => [
          l,
          { title: copyFor(l).title, description: copyFor(l).seoDescription, image: null, twitter_card: null, no_index: false },
        ]),
      ),
    });
    console.log(`  página criada: ${page.id}`);
  } else {
    console.log(`  página existente: ${page.id}`);
    const rebuild = process.env.COLLECTIONS_PAGE_REBUILD === "1";
    const full = await client.items.find(page.id, { nested: true });
    const content = asLocalized<Raw[]>(field(full, "content_page"));
    let changed = false;
    const nextContent = Object.fromEntries(
      locales.map((l) => {
        const kept: BlockPayload[] = [];
        let seenGrid = false;
        for (const block of content[l] ?? []) {
          const id = blockId(block);
          if (!id) continue;
          if (blockTypeId(block) === featureGrid.id) {
            if (seenGrid || rebuild) {
              changed = true;
              continue;
            }
            seenGrid = true;
          }
          kept.push(id);
        }
        if (!seenGrid && collections.length > 0) {
          kept.unshift(gridBlock(l));
          changed = true;
        }
        return [l, kept];
      }),
    );
    if (changed) {
      await client.items.update(page.id, { content_page: nextContent });
      console.log(`  grelha de coleções atualizada (${collections.length} coleção(ões))`);
    } else {
      console.log("  grelha de coleções já presente (COLLECTIONS_PAGE_REBUILD=1 para refazer)");
    }
  }

  const published = await client.items.find(page.id);
  await publishIfDraftModel(client, published, "página");

  /** An existing page keeps its slugs (e.g. `collections` in every locale); links follow them. */
  const pageSlugs = asLocalized<Raw>(field(published, "slug"));
  const collectionsPath = (locale: string): string => {
    const slug = textIn(pageSlugs[locale], locale);
    return slug ? `/${copyFor(locale).appLocale}/${slug}` : defaultPath(locale);
  };

  await ensureNavLink(client, {
    navItemTypeId: navItem.id,
    locales,
    pathFor: collectionsPath,
    labelFor: (l) => copyFor(l).title,
    name: "das coleções",
    stalePathsFor: (l) => [defaultPath(l)],
  });

  await ensureGlobalSettingPage(client, {
    fieldKey: "collections_page",
    pageId: page.id,
    force: process.env.COLLECTIONS_PAGE_FORCE === "1",
    forceEnvName: "COLLECTIONS_PAGE_FORCE",
  });

  console.log(`Concluído. Página: ${locales.map(collectionsPath).join(" · ")}`);
}
