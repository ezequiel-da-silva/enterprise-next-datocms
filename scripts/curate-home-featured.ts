/**
 * Curates Homepage “Featured boards” + snowboard hero imagery:
 *
 * - Locates `page` slug `home`
 * - Sets the first `content_listing_section` to Shopify `fetch_mode: manual`
 *   with explicit `selected_products` (whitelist handles)
 * - `has_limit` + limit 4 (Miller); drops duplicate listings
 * - Points `hero_page` image at snowboard/snow media (preferred best-of uploads or library match)
 * - Idempotent: re-run updates existing blocks in place
 *
 *   npx datocms cma:script scripts/curate-home-featured.ts --profile=default
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
  carouselOptions,
  field,
  findPageBySlug,
  publishIfDraftModel,
  ref,
  textHeaderBlock,
} from "./lib/dato-script-helpers";
import {
  HOME_FEATURED_BOARD_HANDLES,
  HOME_FEATURED_LISTING_LIMIT,
} from "./lib/home-featured-boards";
import { SNOWBOARD_HERO_UPLOAD, SNOWBOARD_UPLOAD_NAME_RE } from "./lib/home-hero-uploads";

type LocaleCopy = {
  listingTitle: string;
  listingDescription: string;
};

const COPY: Record<string, LocaleCopy> = {
  en: {
    listingTitle: "Featured boards",
    listingDescription: "Pick a board for the next run — prices confirmed at Shopify checkout.",
  },
  "pt-BR": {
    listingTitle: "Pranchas em destaque",
    listingDescription: "Escolhe a prancha para a próxima descida — preços confirmados no checkout Shopify.",
  },
  es: {
    listingTitle: "Tablas destacadas",
    listingDescription: "Elige una tabla para la próxima bajada — precios confirmados en el checkout de Shopify.",
  },
};

function copyFor(locale: string): LocaleCopy {
  return COPY[locale] ?? COPY.en;
}

async function loadPublishedProductIdsByHandle(client: Client): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for await (const record of client.items.listPagedIterator({
    filter: { type: "product_page" },
    version: "published",
  })) {
    const handle = field(record, "shopify_handle");
    if (typeof handle !== "string" || !handle.trim()) continue;
    map.set(handle.trim().toLowerCase(), record.id);
  }
  return map;
}

function existingHeaderIds(listingBlock: Raw): string[] {
  const headers = blockAttr(listingBlock, "text_header_section");
  if (!Array.isArray(headers)) return [];
  return headers.flatMap((h) => {
    const id = blockId(h);
    return id ? [id] : [];
  });
}

function existingConfigId(listingBlock: Raw): string | null {
  const config = blockAttr(listingBlock, "listing_config");
  return blockId(config);
}

async function uploadExists(client: Client, id: string): Promise<boolean> {
  try {
    await client.uploads.find(id);
    return true;
  } catch {
    return false;
  }
}

function uploadMatchesSnowboard(upload: object): boolean {
  const filename = field(upload, "filename");
  const basename = field(upload, "basename");
  const path = field(upload, "path");
  const meta = field(upload, "default_field_metadata");
  const alts: string[] = [];
  if (meta && typeof meta === "object" && !Array.isArray(meta)) {
    for (const localeMeta of Object.values(meta as Record<string, Raw>)) {
      if (!localeMeta || typeof localeMeta !== "object") continue;
      const alt = field(localeMeta, "alt");
      if (typeof alt === "string") alts.push(alt);
      const title = field(localeMeta, "title");
      if (typeof title === "string") alts.push(title);
    }
  }
  const haystack = [filename, basename, path, ...alts]
    .filter((v): v is string => typeof v === "string")
    .join(" ");
  return SNOWBOARD_UPLOAD_NAME_RE.test(haystack);
}

async function resolveSnowboardHeroUploads(
  client: Client,
): Promise<{ mobile: string; desktop: string } | null> {
  const preferredMobile = await uploadExists(client, SNOWBOARD_HERO_UPLOAD.mobile);
  const preferredDesktop = await uploadExists(client, SNOWBOARD_HERO_UPLOAD.desktop);
  if (preferredMobile && preferredDesktop) {
    console.log(
      `  hero uploads (preferred): mobile=${SNOWBOARD_HERO_UPLOAD.mobile} desktop=${SNOWBOARD_HERO_UPLOAD.desktop}`,
    );
    return { mobile: SNOWBOARD_HERO_UPLOAD.mobile, desktop: SNOWBOARD_HERO_UPLOAD.desktop };
  }

  let match: string | null = null;
  for await (const upload of client.uploads.listPagedIterator({})) {
    if (!uploadMatchesSnowboard(upload)) continue;
    match = upload.id;
    break;
  }
  if (!match) return null;
  console.log(`  hero upload (library match): ${match}`);
  return { mobile: match, desktop: match };
}

function nestedBlockIds(raw: Raw): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    const id = blockId(item);
    return id ? [id] : [];
  });
}

function curatedHero(
  existing: Raw,
  heroSectionId: string,
  heroImageId: string,
  uploads: { mobile: string; desktop: string },
): ReturnType<typeof buildBlockRecord> {
  const heroId = blockId(existing);
  const imageRaw = blockAttr(existing, "image_hero");
  const imageId = blockId(imageRaw);
  const buttonIds = nestedBlockIds(blockAttr(existing, "button_hero"));

  return buildBlockRecord({
    ...(heroId ? { id: heroId } : {}),
    item_type: ref(heroSectionId),
    layout_hero: blockAttr(existing, "layout_hero") ?? "image_side",
    title_hero: blockAttr(existing, "title_hero") ?? null,
    subtitle_hero: blockAttr(existing, "subtitle_hero") ?? null,
    show_button: blockAttr(existing, "show_button") ?? false,
    button_hero: buttonIds,
    show_image_hero: true,
    image_hero: buildBlockRecord({
      ...(imageId ? { id: imageId } : {}),
      item_type: ref(heroImageId),
      asset_mobile: { upload_id: uploads.mobile },
      asset_desktop: { upload_id: uploads.desktop },
    }),
    show_image_overlay: blockAttr(existing, "show_image_overlay") ?? false,
    image_overlay: blockAttr(existing, "image_overlay") ?? null,
  });
}

export default async function curateHomeFeatured(client: Client): Promise<void> {
  const site = await client.site.find();
  const locales = site.locales;
  console.log(`Site ${site.id} (${site.name}) — locales: ${locales.join(", ")}`);
  console.log(`Environment: ${process.env.DATOCMS_ENVIRONMENT ?? "(default / profile)"}`);

  const [textHeader, listingSection, shopifyConfig, carouselSetting, heroSection, heroImage] =
    await Promise.all([
      client.itemTypes.find("text_header"),
      client.itemTypes.find("content_listing_section"),
      client.itemTypes.find("shopify_listing_config"),
      client.itemTypes.find("carousel_setting"),
      client.itemTypes.find("hero_section"),
      client.itemTypes.find("hero_image_block"),
    ]);

  const page = await findPageBySlug(client, new Set(["home"]));
  if (!page) {
    throw new Error('Page with slug "home" not found — create/publish home before running this script.');
  }
  console.log(`  home page: ${page.id}`);

  const byHandle = await loadPublishedProductIdsByHandle(client);
  const selectedIds = HOME_FEATURED_BOARD_HANDLES.map((h) => byHandle.get(h)).filter(
    (id): id is string => Boolean(id),
  );
  const missing = HOME_FEATURED_BOARD_HANDLES.filter((h) => !byHandle.has(h));

  console.log(
    `  featured boards: ${selectedIds.length ? HOME_FEATURED_BOARD_HANDLES.filter((h) => byHandle.has(h)).join(", ") : "(nenhum publicado)"}`,
  );
  if (missing.length > 0) {
    console.warn(`  handles sem product_page publicada: ${missing.join(", ")}`);
  }
  if (selectedIds.length === 0) {
    throw new Error(
      "Nenhuma product_page publicada para a whitelist Featured — publique as fichas e reexecute.",
    );
  }

  const heroUploads = await resolveSnowboardHeroUploads(client);
  if (!heroUploads) {
    console.warn("  nenhum upload de snowboard/neve encontrado — hero_page não alterado");
  }

  const full = await client.items.find(page.id, { nested: true });
  const content = asLocalized<Raw[]>(field(full, "content_page"));
  const heroes = asLocalized<Raw>(field(full, "hero_page"));

  let listingsUpdated = 0;
  let listingsCreated = 0;
  let listingsDeduped = 0;
  let heroesUpdated = 0;

  const loadMoreFallback: Record<string, string> = {
    en: "Load more products",
    "pt-BR": "Carregar mais produtos",
    es: "Cargar más productos",
  };

  const curatedListing = (locale: string, existing: Raw | null): ReturnType<typeof buildBlockRecord> => {
    const c = copyFor(locale);
    const headerIds = existing ? existingHeaderIds(existing) : [];
    const configId = existing ? existingConfigId(existing) : null;
    const listingId = existing ? blockId(existing) : null;
    const existingLabel = existing ? blockAttr(existing, "load_more_label") : null;
    const loadMoreLabel =
      typeof existingLabel === "string" && existingLabel.trim()
        ? existingLabel.trim()
        : (loadMoreFallback[locale] ?? loadMoreFallback.en);

    const listingConfig = buildBlockRecord({
      ...(configId ? { id: configId } : {}),
      item_type: ref(shopifyConfig.id),
      fetch_mode: "manual",
      collection_filter: "all",
      source_collection: null,
      selected_products: selectedIds,
    });

    return buildBlockRecord({
      ...(listingId ? { id: listingId } : {}),
      item_type: ref(listingSection.id),
      text_header_section:
        headerIds.length > 0
          ? headerIds
          : [textHeaderBlock(textHeader.id, c.listingTitle, c.listingDescription)],
      listing_config: listingConfig,
      display_type: "grid",
      has_limit: true,
      limit: HOME_FEATURED_LISTING_LIMIT,
      initial_count: existing ? (blockAttr(existing, "initial_count") ?? null) : null,
      load_more_step: existing ? (blockAttr(existing, "load_more_step") ?? null) : null,
      load_more_label: loadMoreLabel,
      carousel_options: carouselOptions(carouselSetting.id),
    });
  };

  const nextContent = Object.fromEntries(
    locales.map((l) => {
      let listing: BlockPayload | null = null;
      const others: BlockPayload[] = [];

      for (const block of content[l] ?? []) {
        const id = blockId(block);
        if (!id) continue;
        const typeId = blockTypeId(block);
        if (typeId === listingSection.id) {
          if (listing) {
            listingsDeduped += 1;
            continue;
          }
          listing = curatedListing(l, block);
          listingsUpdated += 1;
          continue;
        }
        others.push(id);
      }

      if (!listing) {
        listing = curatedListing(l, null);
        listingsCreated += 1;
      }

      return [l, [listing, ...others]];
    }),
  );

  const nextHero = heroUploads
    ? Object.fromEntries(
        locales.map((l) => {
          const current = heroes[l];
          if (!current || !blockId(current)) {
            console.warn(`  hero ausente em ${l} — skip (não cria hero novo)`);
            return [l, current ?? null];
          }
          heroesUpdated += 1;
          return [l, curatedHero(current, heroSection.id, heroImage.id, heroUploads)];
        }),
      )
    : null;

  await client.items.update(page.id, {
    content_page: nextContent,
    ...(nextHero ? { hero_page: nextHero } : {}),
  });
  if (listingsCreated > 0) {
    console.log(`  listing criado (manual, limit ${HOME_FEATURED_LISTING_LIMIT}, ${listingsCreated} locale(s))`);
  }
  if (listingsUpdated > 0) {
    console.log(
      `  listing atualizado (manual, ${selectedIds.length} produtos, limit ${HOME_FEATURED_LISTING_LIMIT}, ${listingsUpdated} locale(s))`,
    );
  }
  if (listingsDeduped > 0) console.log(`  listings duplicados removidos: ${listingsDeduped}`);
  if (heroesUpdated > 0) console.log(`  hero_page imagem snowboard atualizada (${heroesUpdated} locale(s))`);

  await publishIfDraftModel(client, await client.items.find(page.id), "home");
  console.log(`Concluído. Featured boards + hero curados — verifica /en · /pt · /es`);
}
