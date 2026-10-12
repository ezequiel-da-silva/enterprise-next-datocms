/**
 * Shared helpers for `datocms cma:script` setup scripts (file mode).
 * `cma:script` rejects the top type annotation, so `Raw` stands in for "any CMA field value".
 */
import { buildBlockRecord } from "@datocms/cma-client-node";
import type { Client } from "datocms/lib/cma-client-node";

export type Localized<T> = Record<string, T>;
export type ItemRef = { type: "item_type"; id: string };
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Raw = {} | null | undefined;
export type BlockPayload = string | ReturnType<typeof buildBlockRecord>;

export function ref(id: string): ItemRef {
  return { type: "item_type", id };
}

export function field(item: object, key: string): Raw {
  return (item as Record<string, Raw>)[key];
}

export function asLocalized<T>(value: Raw): Localized<T> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Localized<T>) : {};
}

/** Nested blocks come back JSON:API-shaped (`attributes`, `relationships`, `__itemTypeId`). */
export function blockId(block: Raw): string | null {
  const id = block && typeof block === "object" ? field(block, "id") : null;
  return typeof id === "string" ? id : null;
}

export function blockTypeId(block: Raw): string | null {
  if (!block || typeof block !== "object") return null;
  const direct = field(block, "__itemTypeId");
  if (typeof direct === "string") return direct;
  const rel = field(block, "relationships");
  const itemType = rel && typeof rel === "object" ? field(rel, "item_type") : field(block, "item_type");
  const data = itemType && typeof itemType === "object" ? (field(itemType, "data") ?? itemType) : null;
  const id = data && typeof data === "object" ? field(data, "id") : null;
  return typeof id === "string" ? id : null;
}

export function blockAttr(block: Raw, key: string): Raw {
  if (!block || typeof block !== "object") return null;
  const attrs = field(block, "attributes");
  return attrs && typeof attrs === "object" ? field(attrs, key) : field(block, key);
}

/** Localized string field value for one locale, trimmed; `null` when empty. */
export function textIn(raw: Raw, locale: string): string | null {
  const value = typeof raw === "string" ? raw : asLocalized<Raw>(raw)[locale];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function publishIfDraftModel(client: Client, item: { id: string; meta: object }, label: string) {
  if (typeof field(item.meta, "status") !== "string") return;
  await client.items.publish(item.id);
  console.log(`  publicado: ${label}`);
}

/** `carousel_options` is validated with size eq 1 even when the display is not a carousel. */
export function carouselOptions(carouselSettingId: string) {
  return [
    buildBlockRecord({
      item_type: ref(carouselSettingId),
      autoplay: false,
      autoplay_interval: 5,
      loop: true,
      show_arrows: true,
      show_dots: true,
    }),
  ];
}

export function textHeaderBlock(textHeaderId: string, title: string, description?: string) {
  return buildBlockRecord({
    item_type: ref(textHeaderId),
    title,
    has_description: Boolean(description),
    description: description ?? null,
    has_section_id: false,
    section_id: null,
  });
}

/** First `page` record whose slug (any locale) is in `slugs`. */
export async function findPageBySlug(client: Client, slugs: Set<string>): Promise<{ id: string } | null> {
  for await (const candidate of client.items.listPagedIterator({ filter: { type: "page" } })) {
    const values = Object.values(asLocalized<Raw>(field(candidate, "slug")));
    if (values.some((s) => typeof s === "string" && slugs.has(s))) return candidate;
  }
  return null;
}

/**
 * Appends a top-level `navigation.menu_links` item per locale pointing at `pathFor(locale)`,
 * removing duplicates of that link. Skips locales that already have it.
 */
export async function ensureNavLink(
  client: Client,
  options: {
    navItemTypeId: string;
    locales: string[];
    pathFor: (locale: string) => string;
    labelFor: (locale: string) => string;
    name: string;
    /** Links to drop (e.g. a previous path for the same page). */
    stalePathsFor?: (locale: string) => string[];
  },
): Promise<void> {
  const [navigation] = await client.items.list({ filter: { type: "navigation" }, nested: true });
  if (!navigation) {
    console.warn("  navigation não encontrada — menu não alterado.");
    return;
  }
  const nestedMenu = asLocalized<Raw[]>(field(navigation, "menu_links"));
  let added = 0;
  let removed = 0;
  const nextMenu = Object.fromEntries(
    options.locales.map((l) => {
      const kept: BlockPayload[] = [];
      let seen = false;
      for (const block of nestedMenu[l] ?? []) {
        const id = blockId(block);
        if (!id) continue;
        const raw = blockAttr(block, "nav_item_link");
        const link = typeof raw === "string" ? raw.replace(/\/$/, "") : null;
        if (link && link !== options.pathFor(l) && options.stalePathsFor?.(l).includes(link)) {
          removed += 1;
          continue;
        }
        if (link === options.pathFor(l)) {
          if (seen) {
            removed += 1;
            continue;
          }
          seen = true;
        }
        kept.push(id);
      }
      if (seen) return [l, kept];
      added += 1;
      const label = options.labelFor(l);
      return [
        l,
        [
          ...kept,
          buildBlockRecord({
            item_type: ref(options.navItemTypeId),
            nav_item_label: label,
            nav_item_link: options.pathFor(l),
            nav_item_link_aria: label,
            open_in_new_tab: false,
            submenu: [],
          }),
        ],
      ];
    }),
  );

  if (added === 0 && removed === 0) {
    console.log(`  menu já tem o link ${options.name}`);
    return;
  }
  await client.items.update(navigation.id, { menu_links: nextMenu });
  if (added > 0) console.log(`  item de menu adicionado (${options.name})`);
  if (removed > 0) console.log(`  itens de menu duplicados/antigos removidos: ${removed}`);
  await publishIfDraftModel(client, await client.items.find(navigation.id), "navigation");
}

/** Points a `global_setting` link field at `pageId` when empty (or when `force`). */
export async function ensureGlobalSettingPage(
  client: Client,
  options: { fieldKey: string; pageId: string; force: boolean; forceEnvName: string },
): Promise<void> {
  const [settings] = await client.items.list({ filter: { type: "global_setting" } });
  if (!settings) {
    console.warn(`  global_setting não encontrado — ${options.fieldKey} não definido.`);
    return;
  }
  const current = field(settings, options.fieldKey);
  if (current === options.pageId) {
    console.log(`  ${options.fieldKey} já aponta para a página`);
  } else if (current && !options.force) {
    console.warn(
      `  ${options.fieldKey} já aponta para ${String(current)} — mantido (${options.forceEnvName}=1 para substituir).`,
    );
  } else {
    await client.items.update(settings.id, { [options.fieldKey]: options.pageId });
    console.log(`  ${options.fieldKey} definido`);
    await publishIfDraftModel(client, await client.items.find(settings.id), "global_setting");
  }
}
