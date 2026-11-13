/**
 * Removes redundant Search / Busca / Búsqueda links from `navigation.footer_menu`
 * (header search icon already covers discovery — Parkinson).
 *
 * Idempotent: re-run is a no-op when no matching links remain.
 *
 *   npx datocms cma:script scripts/clean-footer-search.ts --profile=default
 *   npx datocms cma:script scripts/clean-footer-search.ts --profile=staging
 */
import { buildBlockRecord } from "@datocms/cma-client-node";
import type { Client } from "datocms/lib/cma-client-node";
import {
  type BlockPayload,
  type Raw,
  asLocalized,
  blockAttr,
  blockId,
  field,
  publishIfDraftModel,
  ref,
} from "./lib/dato-script-helpers";

const SEARCH_SLUGS = new Set(["search", "busca", "busqueda"]);
const SEARCH_LABELS = new Set(["search", "busca", "búsqueda", "busqueda"]);

function isSearchNavLink(link: Raw, label: Raw): boolean {
  if (typeof link === "string") {
    const path = link.trim().toLowerCase().replace(/\/+$/, "") || "/";
    const segments = path.split("/").filter(Boolean);
    const last = segments[segments.length - 1] ?? "";
    if (SEARCH_SLUGS.has(last) || SEARCH_SLUGS.has(path.replace(/^\//, ""))) return true;
  }
  if (typeof label === "string") {
    const normalized = label.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
    if (SEARCH_LABELS.has(normalized) || SEARCH_LABELS.has(label.trim().toLowerCase())) return true;
  }
  return false;
}

function cleanFooterTree(
  blocks: Raw[],
  modularTypeId: string,
): { kept: BlockPayload[]; removed: number; rewritten: number } {
  let removed = 0;
  let rewritten = 0;
  const kept: BlockPayload[] = [];

  for (const block of blocks) {
    const id = blockId(block);
    if (!id) continue;
    if (isSearchNavLink(blockAttr(block, "nav_item_link"), blockAttr(block, "nav_item_label"))) {
      removed += 1;
      continue;
    }

    const submenuRaw = blockAttr(block, "submenu");
    if (!Array.isArray(submenuRaw) || submenuRaw.length === 0) {
      kept.push(id);
      continue;
    }

    const nested = cleanFooterTree(submenuRaw, modularTypeId);
    removed += nested.removed;
    if (nested.removed === 0 && nested.rewritten === 0) {
      kept.push(id);
      continue;
    }

    rewritten += 1;
    kept.push(
      buildBlockRecord({
        id,
        item_type: ref(modularTypeId),
        nav_item_label: blockAttr(block, "nav_item_label"),
        nav_item_link: blockAttr(block, "nav_item_link"),
        nav_item_link_aria: blockAttr(block, "nav_item_link_aria"),
        open_in_new_tab: blockAttr(block, "open_in_new_tab") ?? false,
        submenu: nested.kept,
      }),
    );
  }

  return { kept, removed, rewritten };
}

export default async function cleanFooterSearch(client: Client): Promise<void> {
  const site = await client.site.find();
  console.log(`Site ${site.id} (${site.name}) — locales: ${site.locales.join(", ")}`);
  console.log(`Environment: ${process.env.DATOCMS_ENVIRONMENT ?? "(default / profile)"}`);

  const modular = await client.itemTypes.find("nav_item_modular");
  const [navigation] = await client.items.list({ filter: { type: "navigation" }, nested: true });
  if (!navigation) {
    throw new Error("Singleton navigation not found.");
  }

  const footer = asLocalized<Raw[]>(field(navigation, "footer_menu"));
  let totalRemoved = 0;
  let totalRewritten = 0;

  const nextFooter = Object.fromEntries(
    site.locales.map((locale) => {
      const { kept, removed, rewritten } = cleanFooterTree(footer[locale] ?? [], modular.id);
      totalRemoved += removed;
      totalRewritten += rewritten;
      if (removed > 0 || rewritten > 0) {
        console.log(`  ${locale}: removed ${removed} search link(s), rewritten ${rewritten} parent(s)`);
      } else {
        console.log(`  ${locale}: sem links de busca no footer`);
      }
      return [locale, kept];
    }),
  );

  if (totalRemoved === 0 && totalRewritten === 0) {
    console.log("Concluído — nada a alterar.");
    return;
  }

  await client.items.update(navigation.id, { footer_menu: nextFooter });
  await publishIfDraftModel(client, await client.items.find(navigation.id), "navigation");
  console.log(
    `Concluído. Removidos ${totalRemoved} link(s) de busca; ${totalRewritten} bloco(s) pai actualizados.`,
  );
}
