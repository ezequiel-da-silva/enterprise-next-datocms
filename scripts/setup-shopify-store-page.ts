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

type Localized<T> = Record<string, T>;
type ItemRef = { type: "item_type"; id: string };
/** Any CMA field value; `cma:script` rejects the top type annotation, so this is its equivalent. */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Raw = {} | null | undefined;

function field(item: object, key: string): Raw {
  return (item as Record<string, Raw>)[key];
}

function copyFor(locale: string): LocaleCopy {
  return COPY[locale] ?? COPY.en;
}

function storePath(locale: string): string {
  const c = copyFor(locale);
  return `/${c.appLocale}/${c.slug}`;
}

function asLocalized<T>(value: Raw): Localized<T> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Localized<T>) : {};
}

type BlockPayload = string | ReturnType<typeof buildBlockRecord>;

/** Nested blocks come back JSON:API-shaped (`attributes`, `relationships`, `__itemTypeId`). */
function blockId(block: Raw): string | null {
  const id = block && typeof block === "object" ? field(block, "id") : null;
  return typeof id === "string" ? id : null;
}

function blockTypeId(block: Raw): string | null {
  if (!block || typeof block !== "object") return null;
  const direct = field(block, "__itemTypeId");
  if (typeof direct === "string") return direct;
  const rel = field(block, "relationships");
  const itemType = rel && typeof rel === "object" ? field(rel, "item_type") : field(block, "item_type");
  const data = itemType && typeof itemType === "object" ? (field(itemType, "data") ?? itemType) : null;
  const id = data && typeof data === "object" ? field(data, "id") : null;
  return typeof id === "string" ? id : null;
}

function blockAttr(block: Raw, key: string): Raw {
  if (!block || typeof block !== "object") return null;
  const attrs = field(block, "attributes");
  return attrs && typeof attrs === "object" ? field(attrs, key) : field(block, key);
}

async function publishIfDraftModel(client: Client, item: { id: string; meta: object }, label: string) {
  if (typeof field(item.meta, "status") !== "string") return;
  await client.items.publish(item.id);
  console.log(`  publicado: ${label}`);
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
  const ref = (id: string): ItemRef => ({ type: "item_type", id });

  /** `carousel_options` is validated with size eq 1 even when the display is not a carousel. */
  const carouselOptions = () => [
    buildBlockRecord({
      item_type: ref(carouselSetting.id),
      autoplay: false,
      autoplay_interval: 5,
      loop: true,
      show_arrows: true,
      show_dots: true,
    }),
  ];

  const header = (title: string, description?: string) =>
    buildBlockRecord({
      item_type: ref(textHeader.id),
      title,
      has_description: Boolean(description),
      description: description ?? null,
      has_section_id: false,
      section_id: null,
    });

  const listingBlock = (locale: string) => {
    const c = copyFor(locale);
    return buildBlockRecord({
      item_type: ref(listingSection.id),
      text_header_section: [header(c.listingTitle, c.listingDescription)],
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
      carousel_options: carouselOptions(),
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

  const titleIn = (raw: Raw, locale: string): string | null => {
    const value = typeof raw === "string" ? raw : asLocalized<Raw>(raw)[locale];
    return typeof value === "string" && value.trim() ? value.trim() : null;
  };

  const highlightsBlock = (locale: string) =>
    buildBlockRecord({
      item_type: ref(featureGrid.id),
      text_header_section: [header(copyFor(locale).highlightsTitle)],
      advanced_options: false,
      variant: null,
      carousel_options: carouselOptions(),
      items_feature_grid: highlightProducts.map((p) =>
        buildBlockRecord({
          item_type: ref(card.id),
          card_source: "product",
          source_product: p.id,
          source_collection: null,
          title_card: titleIn(p.title, locale),
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
  const ourSlugs = new Set(Object.values(COPY).map((c) => c.slug));
  let page: { id: string } | null = null;
  for await (const candidate of client.items.listPagedIterator({ filter: { type: "page" } })) {
    const slugs = Object.values(asLocalized<Raw>(field(candidate, "slug")));
    if (slugs.some((s) => typeof s === "string" && ourSlugs.has(s))) {
      page = candidate;
      break;
    }
  }

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

  // --- Navigation ---------------------------------------------------------
  const [navigation] = await client.items.list({ filter: { type: "navigation" }, nested: true });
  if (!navigation) {
    console.warn("  navigation não encontrada — menu não alterado.");
  } else {
    const nestedMenu = asLocalized<Raw[]>(field(navigation, "menu_links"));

    let added = 0;
    let removed = 0;
    const nextMenu = Object.fromEntries(
      locales.map((l) => {
        const kept: BlockPayload[] = [];
        let seenStore = false;
        for (const block of nestedMenu[l] ?? []) {
          const id = blockId(block);
          if (!id) continue;
          const link = blockAttr(block, "nav_item_link");
          if (typeof link === "string" && link.replace(/\/$/, "") === storePath(l)) {
            if (seenStore) {
              removed += 1;
              continue;
            }
            seenStore = true;
          }
          kept.push(id);
        }
        if (seenStore) return [l, kept];
        added += 1;
        return [
          l,
          [
            ...kept,
            buildBlockRecord({
              item_type: ref(navItem.id),
              nav_item_label: copyFor(l).navLabel,
              nav_item_link: storePath(l),
              nav_item_link_aria: copyFor(l).navLabel,
              open_in_new_tab: false,
              submenu: [],
            }),
          ],
        ];
      }),
    );

    if (added > 0 || removed > 0) {
      await client.items.update(navigation.id, { menu_links: nextMenu });
      if (added > 0) console.log("  item de menu adicionado");
      if (removed > 0) console.log(`  itens de menu duplicados removidos: ${removed}`);
      await publishIfDraftModel(client, await client.items.find(navigation.id), "navigation");
    } else {
      console.log("  menu já tem o link da loja");
    }
  }

  // --- Global settings ----------------------------------------------------
  const [settings] = await client.items.list({ filter: { type: "global_setting" } });
  if (!settings) {
    console.warn("  global_setting não encontrado — products_page não definido.");
  } else {
    const current = field(settings, "products_page");
    const force = process.env.STORE_PAGE_FORCE_PRODUCTS_PAGE === "1";
    if (current === page.id) {
      console.log("  products_page já aponta para a loja");
    } else if (current && !force) {
      console.warn(
        `  products_page já aponta para ${String(current)} — mantido (STORE_PAGE_FORCE_PRODUCTS_PAGE=1 para substituir).`,
      );
    } else {
      await client.items.update(settings.id, { products_page: page.id });
      console.log("  products_page definido");
      await publishIfDraftModel(client, await client.items.find(settings.id), "global_setting");
    }
  }

  console.log(`Concluído. Página: ${locales.map(storePath).join(" · ")}`);
}
