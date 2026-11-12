/**
 * Creates (or completes) the promotional “Best of” landing:
 *
 * - `page` Best of / Melhores / Lo mejor with `hero_page` + two `feature_grid`s
 *   (featured snowboards products; gift card + Hydrogen collection)
 * - `navigation.menu_links`: top-level item per locale
 *
 * Idempotent. `BEST_OF_FORCE=1` rebuilds hero + grids.
 *
 *   npx datocms cma:script scripts/setup-best-of-landing.ts --profile=default
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
  ensureNavLink,
  field,
  findPageBySlug,
  publishIfDraftModel,
  ref,
  textHeaderBlock,
  textIn,
} from "./lib/dato-script-helpers";
import { SNOWBOARD_HERO_UPLOAD } from "./lib/home-hero-uploads";

/** Preferred snowboard handles (skip if not published). */
const BOARD_HANDLES = [
  "the-complete-snowboard",
  "the-collection-snowboard-hydrogen",
  "the-collection-snowboard-oxygen",
  "the-videographer-snowboard",
] as const;

const GIFT_CARD_HANDLE = "gift-card";
const EXPLORE_COLLECTION_HANDLE = "hydrogen";

/** Shared snowboard hero uploads — avoids a new upload for this seed. */
const HERO_UPLOAD = SNOWBOARD_HERO_UPLOAD;

type LocaleCopy = {
  title: string;
  slug: string;
  appLocale: "en" | "pt" | "es";
  navLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaLabel: string;
  boardsTitle: string;
  boardsDescription: string;
  exploreTitle: string;
  exploreDescription: string;
  seoDescription: string;
};

const COPY: Record<string, LocaleCopy> = {
  en: {
    title: "Best of",
    slug: "best-of",
    appLocale: "en",
    navLabel: "Best of",
    heroTitle: "Best boards of the season",
    heroSubtitle: "A curated pick of snowboards — and a gift card when you need something easy to give.",
    ctaLabel: "Shop all",
    boardsTitle: "Featured boards",
    boardsDescription: "Standouts from the catalog, ready for the next run.",
    exploreTitle: "Also explore",
    exploreDescription: "Gift cards and more from the Hydrogen collection.",
    seoDescription: "Curated snowboards and gift cards from our best-of picks.",
  },
  "pt-BR": {
    title: "Melhores",
    slug: "melhores",
    appLocale: "pt",
    navLabel: "Melhores",
    heroTitle: "As melhores pranchas da temporada",
    heroSubtitle: "Uma seleção de snowboards — e um cartão-presente quando precisares de algo fácil de oferecer.",
    ctaLabel: "Ver loja",
    boardsTitle: "Pranchas em destaque",
    boardsDescription: "Destaques do catálogo, prontas para a próxima descida.",
    exploreTitle: "Explorar também",
    exploreDescription: "Cartões-presente e mais da coleção Hydrogen.",
    seoDescription: "Snowboards e cartões-presente selecionados dos nossos melhores.",
  },
  es: {
    title: "Lo mejor",
    slug: "lo-mejor",
    appLocale: "es",
    navLabel: "Lo mejor",
    heroTitle: "Las mejores tablas de la temporada",
    heroSubtitle: "Una selección de snowboards — y una tarjeta regalo cuando necesites algo fácil de regalar.",
    ctaLabel: "Ver tienda",
    boardsTitle: "Tablas destacadas",
    boardsDescription: "Destacados del catálogo, listas para la próxima bajada.",
    exploreTitle: "Explora también",
    exploreDescription: "Tarjetas regalo y más de la colección Hydrogen.",
    seoDescription: "Snowboards y tarjetas regalo de nuestra selección lo mejor.",
  },
};

function copyFor(locale: string): LocaleCopy {
  return COPY[locale] ?? COPY.en;
}

function pagePath(locale: string): string {
  const c = copyFor(locale);
  return `/${c.appLocale}/${c.slug}`;
}

function navPath(locale: string): string {
  return `/${copyFor(locale).slug}`;
}

function plainStructuredText(paragraph: string) {
  return {
    schema: "dast" as const,
    document: {
      type: "root" as const,
      children: [
        {
          type: "paragraph" as const,
          children: [{ type: "span" as const, value: paragraph }],
        },
      ],
    },
  };
}

type CatalogHit = { id: string; handle: string; title: Raw };

async function loadPublishedByHandle(
  client: Client,
  type: "product_page" | "collection_page",
): Promise<Map<string, CatalogHit>> {
  const map = new Map<string, CatalogHit>();
  for await (const record of client.items.listPagedIterator({
    filter: { type },
    version: "published",
  })) {
    const handle = field(record, "shopify_handle");
    if (typeof handle !== "string" || !handle.trim()) continue;
    map.set(handle.trim().toLowerCase(), {
      id: record.id,
      handle: handle.trim(),
      title: field(record, "title"),
    });
  }
  return map;
}

export default async function setupBestOfLanding(client: Client): Promise<void> {
  const site = await client.site.find();
  const locales = site.locales;
  const force = process.env.BEST_OF_FORCE === "1";
  console.log(`Site ${site.id} (${site.name}) — locales: ${locales.join(", ")}`);

  const [pageModel, textHeader, featureGrid, card, heroSection, heroImage, link, navItem, carouselSetting, shopPage] =
    await Promise.all([
      client.itemTypes.find("page"),
      client.itemTypes.find("text_header"),
      client.itemTypes.find("feature_grid"),
      client.itemTypes.find("card"),
      client.itemTypes.find("hero_section"),
      client.itemTypes.find("hero_image_block"),
      client.itemTypes.find("link"),
      client.itemTypes.find("nav_item_modular"),
      client.itemTypes.find("carousel_setting"),
      findPageBySlug(client, new Set(["shop", "loja", "tienda"])),
    ]);

  if (!shopPage) {
    console.warn("  página Shop não encontrada — CTA do hero sem link interno.");
  }

  const products = await loadPublishedByHandle(client, "product_page");
  const collections = await loadPublishedByHandle(client, "collection_page");

  const boards = BOARD_HANDLES.map((h) => products.get(h)).filter((p): p is CatalogHit => Boolean(p));
  const giftCard = products.get(GIFT_CARD_HANDLE) ?? null;
  const exploreCollection = collections.get(EXPLORE_COLLECTION_HANDLE) ?? null;

  console.log(`  boards: ${boards.map((b) => b.handle).join(", ") || "(nenhum)"}`);
  console.log(`  gift-card: ${giftCard ? giftCard.handle : "(ausente)"}`);
  console.log(`  collection: ${exploreCollection ? exploreCollection.handle : "(ausente)"}`);

  const productCard = (locale: string, product: CatalogHit) =>
    buildBlockRecord({
      item_type: ref(card.id),
      card_source: "product",
      source_product: product.id,
      source_collection: null,
      title_card: textIn(product.title, locale) ?? product.handle,
      has_icon: false,
      icon_card: null,
      has_description: false,
      description_card: null,
      has_image: false,
      image_card: null,
      has_link: false,
      link_card: null,
    });

  const collectionCard = (locale: string, collection: CatalogHit) =>
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
    });

  const boardsGrid = (locale: string) => {
    const c = copyFor(locale);
    return buildBlockRecord({
      item_type: ref(featureGrid.id),
      text_header_section: [textHeaderBlock(textHeader.id, c.boardsTitle, c.boardsDescription)],
      advanced_options: false,
      variant: null,
      carousel_options: carouselOptions(carouselSetting.id),
      items_feature_grid: boards.map((p) => productCard(locale, p)),
    });
  };

  const exploreGrid = (locale: string) => {
    const c = copyFor(locale);
    const items: ReturnType<typeof buildBlockRecord>[] = [];
    if (giftCard) items.push(productCard(locale, giftCard));
    if (exploreCollection) items.push(collectionCard(locale, exploreCollection));
    return buildBlockRecord({
      item_type: ref(featureGrid.id),
      text_header_section: [textHeaderBlock(textHeader.id, c.exploreTitle, c.exploreDescription)],
      advanced_options: false,
      variant: null,
      carousel_options: carouselOptions(carouselSetting.id),
      items_feature_grid: items,
    });
  };

  const heroBlock = (locale: string) => {
    const c = copyFor(locale);
    return buildBlockRecord({
      item_type: ref(heroSection.id),
      layout_hero: "image_side",
      title_hero: c.heroTitle,
      subtitle_hero: plainStructuredText(c.heroSubtitle),
      show_button: Boolean(shopPage),
      button_hero: shopPage
        ? [
            buildBlockRecord({
              item_type: ref(link.id),
              cta_label: c.ctaLabel,
              type_content: "page",
              external_link: "",
              internal_link_page: shopPage.id,
              internal_link_post: null,
              internal_link_category: null,
              internal_link_author: null,
              internal_link_product: null,
              internal_link_collection: null,
              open_in_new_tab: false,
              cta_link_aria: c.ctaLabel,
            }),
          ]
        : [],
      show_image_hero: true,
      image_hero: buildBlockRecord({
        item_type: ref(heroImage.id),
        asset_mobile: { upload_id: HERO_UPLOAD.mobile },
        asset_desktop: { upload_id: HERO_UPLOAD.desktop },
      }),
      show_image_overlay: false,
      image_overlay: null,
    });
  };

  const contentBlocks = (locale: string): ReturnType<typeof buildBlockRecord>[] => {
    const blocks: ReturnType<typeof buildBlockRecord>[] = [];
    if (boards.length > 0) blocks.push(boardsGrid(locale));
    if (giftCard || exploreCollection) blocks.push(exploreGrid(locale));
    return blocks;
  };

  const slugs = new Set(Object.values(COPY).map((c) => c.slug));
  let page = await findPageBySlug(client, slugs);

  if (!page) {
    page = await client.items.create({
      item_type: ref(pageModel.id),
      title: Object.fromEntries(locales.map((l) => [l, copyFor(l).title])),
      slug: Object.fromEntries(locales.map((l) => [l, copyFor(l).slug])),
      hero_page: Object.fromEntries(locales.map((l) => [l, heroBlock(l)])),
      content_page: Object.fromEntries(locales.map((l) => [l, contentBlocks(l)])),
      seo_settings_social: Object.fromEntries(
        locales.map((l) => [
          l,
          {
            title: copyFor(l).title,
            description: copyFor(l).seoDescription,
            image: null,
            twitter_card: null,
            no_index: false,
          },
        ]),
      ),
    });
    console.log(`  página criada: ${page.id}`);
  } else {
    console.log(`  página existente: ${page.id}`);
  }

  const full = await client.items.find(page.id, { nested: true });
  const content = asLocalized<Raw[]>(field(full, "content_page"));
  const heroes = asLocalized<Raw>(field(full, "hero_page"));

  let contentChanged = false;
  let heroChanged = false;

  const nextContent = Object.fromEntries(
    locales.map((l) => {
      const kept: BlockPayload[] = [];
      let gridCount = 0;
      for (const block of content[l] ?? []) {
        const id = blockId(block);
        if (!id) continue;
        if (blockTypeId(block) === featureGrid.id) {
          if (force) {
            contentChanged = true;
            continue;
          }
          gridCount += 1;
        }
        kept.push(id);
      }
      if (force || gridCount === 0) {
        const fresh = contentBlocks(l);
        if (fresh.length > 0) {
          kept.push(...fresh);
          contentChanged = true;
        }
      }
      return [l, kept];
    }),
  );

  const nextHero = Object.fromEntries(
    locales.map((l) => {
      const current = heroes[l];
      if (!force && current) return [l, blockId(current) ?? current];
      heroChanged = true;
      return [l, heroBlock(l)];
    }),
  );

  if (contentChanged || heroChanged) {
    await client.items.update(page.id, {
      ...(heroChanged ? { hero_page: nextHero } : {}),
      ...(contentChanged ? { content_page: nextContent } : {}),
      title: Object.fromEntries(locales.map((l) => [l, copyFor(l).title])),
      slug: Object.fromEntries(locales.map((l) => [l, copyFor(l).slug])),
      seo_settings_social: Object.fromEntries(
        locales.map((l) => [
          l,
          {
            title: copyFor(l).title,
            description: copyFor(l).seoDescription,
            image: null,
            twitter_card: null,
            no_index: false,
          },
        ]),
      ),
    });
    if (heroChanged) console.log("  hero_page atualizado");
    if (contentChanged) console.log("  content_page (feature grids) atualizado");
  } else {
    console.log("  hero e grids já presentes (BEST_OF_FORCE=1 para reescrever)");
  }

  await publishIfDraftModel(client, await client.items.find(page.id), "página best-of");

  await ensureNavLink(client, {
    navItemTypeId: navItem.id,
    locales,
    pathFor: navPath,
    labelFor: (l) => copyFor(l).navLabel,
    name: "best-of",
  });

  console.log(`Concluído. Página: ${locales.map(pagePath).join(" · ")}`);
}
