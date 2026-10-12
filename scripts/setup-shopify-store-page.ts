/**
 * Creates (or completes) the Shopify store page and wires it into the site:
 *
 * - `page` "Loja" / "Shop" / "Tienda" with a `content_listing_section`
 *   (`shopify_listing_config`: auto + all products) and, when product pages exist,
 *   a `feature_grid` of up to 3 product cards (highlights).
 * - `navigation.menu_links`: appends a top-level item per locale (skipped if the link exists).
 * - `global_setting.products_page`: set when empty (`STORE_PAGE_FORCE_PRODUCTS_PAGE=1` overwrites).
 *
 * Idempotent: re-running finds the page by slug and skips blocks/items already present.
 *
 *   npx datocms cma:script scripts/setup-shopify-store-page.ts --profile=default
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
  navLabel: string;
  listingTitle: string;
  listingDescription: string;
  highlightsTitle: string;
  seoDescription: string;
};

const COPY: Record<string, LocaleCopy> = {
  en: {
    title: "Shop",
    slug: "shop",
    appLocale: "en",
    navLabel: "Shop",
    listingTitle: "All products",
    listingDescription: "Browse the full catalog.",
    highlightsTitle: "Highlights",
    seoDescription: "Browse our products and collections.",
  },
  "pt-BR": {
    title: "Loja",
    slug: "loja",
    appLocale: "pt",
    navLabel: "Loja",
    listingTitle: "Todos os produtos",
    listingDescription: "Explore o catálogo completo.",
    highlightsTitle: "Destaques",
    seoDescription: "Conheça os nossos produtos e coleções.",
  },
  es: {
    title: "Tienda",
    slug: "tienda",
    appLocale: "es",
    navLabel: "Tienda",
    listingTitle: "Todos los productos",
    listingDescription: "Explora el catálogo completo.",
    highlightsTitle: "Destacados",
    seoDescription: "Descubre nuestros productos y colecciones.",
  },
};

const HIGHLIGHT_COUNT = 3;

function copyFor(locale: string): LocaleCopy {
  return COPY[locale] ?? COPY.en;
}

function storePath(locale: string): string {
  const c = copyFor(locale);
  return `/${c.appLocale}/${c.slug}`;
}

export default async function setupShopifyStorePage(client: Client): Promise<void> {
  const site = await client.site.find();
  const locales = site.locales;
  console.log(`Site ${site.id} (${site.name}) — locales: ${locales.join(", ")}`);

  const [pageModel, textHeader, listingSection, shopifyConfig, featureGrid, card, navItem, carouselSetting] =
    await Promise.all([
      client.itemTypes.find("page"),
      client.itemTypes.find("text_header"),
      client.itemTypes.find("content_listing_section"),
      client.itemTypes.find("shopify_listing_config"),
      client.itemTypes.find("feature_grid"),
      client.itemTypes.find("card"),
      client.itemTypes.find("nav_item_modular"),
      client.itemTypes.find("carousel_setting"),
    ]);

  const listingBlock = (locale: string) => {
    const c = copyFor(locale);
    return buildBlockRecord({
      item_type: ref(listingSection.id),
      text_header_section: [textHeaderBlock(textHeader.id, c.listingTitle, c.listingDescription)],
      listing_config: buildBlockRecord({
        item_type: ref(shopifyConfig.id),
        fetch_mode: "auto",
        collection_filter: "all",
        source_collection: null,
        selected_products: [],
      }),
      display_type: "grid",
      has_limit: false,
      limit: null,
      initial_count: null,
      load_more_step: null,
      load_more_label: null,
      carousel_options: carouselOptions(carouselSetting.id),
    });
  };

  const highlightProducts: { id: string; title: Raw }[] = [];
  for await (const product of client.items.listPagedIterator({
    filter: { type: "product_page" },
    order_by: "_updated_at_DESC",
    version: "published",
  })) {
    highlightProducts.push({ id: product.id, title: field(product, "title") });
    if (highlightProducts.length >= HIGHLIGHT_COUNT) break;
  }

  const highlightsBlock = (locale: string) =>
    buildBlockRecord({
      item_type: ref(featureGrid.id),
      text_header_section: [textHeaderBlock(textHeader.id, copyFor(locale).highlightsTitle)],
      advanced_options: false,
      variant: null,
      carousel_options: carouselOptions(carouselSetting.id),
      items_feature_grid: highlightProducts.map((p) =>
        buildBlockRecord({
          item_type: ref(card.id),
          card_source: "product",
          source_product: p.id,
          source_collection: null,
          title_card: textIn(p.title, locale),
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

  // --- Page ---------------------------------------------------------------
  let page = await findPageBySlug(client, new Set(Object.values(COPY).map((c) => c.slug)));

  if (!page) {
    page = await client.items.create({
      item_type: ref(pageModel.id),
      title: Object.fromEntries(locales.map((l) => [l, copyFor(l).title])),
      slug: Object.fromEntries(locales.map((l) => [l, copyFor(l).slug])),
      hero_page: Object.fromEntries(locales.map((l) => [l, null])),
      content_page: Object.fromEntries(locales.map((l) => [l, [listingBlock(l)]])),
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
  }

  if (highlightProducts.length === 0) {
    console.log("  sem product_page publicados — destaques não criados (corra o backfill Shopify e repita).");
  }

  const full = await client.items.find(page.id, { nested: true });
  const content = asLocalized<Raw[]>(field(full, "content_page"));
  let gridsAdded = 0;
  let gridsRemoved = 0;
  const nextContent = Object.fromEntries(
    locales.map((l) => {
      const kept: BlockPayload[] = [];
      let seenGrid = false;
      for (const block of content[l] ?? []) {
        const id = blockId(block);
        if (!id) continue;
        if (blockTypeId(block) === featureGrid.id) {
          if (seenGrid) {
            gridsRemoved += 1;
            continue;
          }
          seenGrid = true;
        }
        kept.push(id);
      }
      if (!seenGrid && highlightProducts.length > 0) {
        kept.unshift(highlightsBlock(l));
        gridsAdded += 1;
      }
      return [l, kept];
    }),
  );

  if (gridsAdded > 0 || gridsRemoved > 0) {
    try {
      await client.items.update(page.id, { content_page: nextContent });
      if (gridsAdded > 0) console.log(`  destaques adicionados (${highlightProducts.length} produto(s))`);
      if (gridsRemoved > 0) console.log(`  destaques duplicados removidos: ${gridsRemoved}`);
    } catch (error) {
      console.warn("  destaques ignorados (o resto continua):", error instanceof Error ? error.message : error);
    }
  } else {
    console.log("  destaques já presentes");
  }

  await publishIfDraftModel(client, await client.items.find(page.id), "página");

  await ensureNavLink(client, {
    navItemTypeId: navItem.id,
    locales,
    pathFor: storePath,
    labelFor: (l) => copyFor(l).navLabel,
    name: "da loja",
  });

  await ensureGlobalSettingPage(client, {
    fieldKey: "products_page",
    pageId: page.id,
    force: process.env.STORE_PAGE_FORCE_PRODUCTS_PAGE === "1",
    forceEnvName: "STORE_PAGE_FORCE_PRODUCTS_PAGE",
  });

  console.log(`Concluído. Página: ${locales.map(storePath).join(" · ")}`);
}
