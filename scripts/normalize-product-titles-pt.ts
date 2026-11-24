/**
 * Normalize `product_page.title` for `pt-BR` to commercial BR taxonomy:
 * - The Collection Snowboard: X → Coleção Snowboard: X
 * - The … Snowboard → Prancha de Snowboard: …
 *
 * EN / ES titles are never modified. Default is dry-run (`DRY_RUN` unset or ≠ `0`);
 * set `DRY_RUN=0` to update + publish.
 *
 *   npx datocms cma:script scripts/normalize-product-titles-pt.ts --profile=default
 *   DRY_RUN=0 npx datocms cma:script scripts/normalize-product-titles-pt.ts --profile=default
 */
import type { Client } from "datocms/lib/cma-client-node";
import {
  normalizeProductTitlePt,
  productTitlePtNeedsUpdate,
} from "../src/lib/i18n/normalize-product-title-pt";
import { asLocalized, field, publishIfDraftModel, type Raw } from "./lib/dato-script-helpers";

const PT = "pt-BR";

function localeString(titles: Record<string, Raw>, locale: string): string | null {
  const value = titles[locale];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export default async function normalizeProductTitlesPt(client: Client): Promise<void> {
  const dryRun = process.env.DRY_RUN !== "0";
  const site = await client.site.find();
  console.log(`Site ${site.id} (${site.name}) — normalize product titles pt-BR`);
  console.log(`Mode: ${dryRun ? "DRY_RUN (set DRY_RUN=0 to write)" : "WRITE + publish"}`);

  let scanned = 0;
  let wouldUpdate = 0;
  let updated = 0;
  let skipped = 0;

  for await (const record of client.items.listPagedIterator({
    filter: { type: "product_page" },
    version: "current",
  })) {
    scanned += 1;
    const titles = asLocalized<Raw>(field(record, "title"));
    const enResolved = localeString(titles, "en") ?? "";
    const ptCurrent = localeString(titles, PT);
    const handleRaw = field(record, "shopify_handle");
    const handle = typeof handleRaw === "string" ? handleRaw : null;

    const desired = normalizeProductTitlePt(enResolved || String(ptCurrent ?? ""), ptCurrent, handle);
    if (!productTitlePtNeedsUpdate(ptCurrent, desired) || !desired) {
      skipped += 1;
      continue;
    }

    wouldUpdate += 1;
    console.log(`  ${handle ?? record.id}: "${ptCurrent ?? "(empty)"}" → "${desired}"`);

    if (dryRun) continue;

    const nextTitle = { ...titles, [PT]: desired };
    await client.items.update(record.id, { title: nextTitle });
    try {
      await publishIfDraftModel(client, await client.items.find(record.id), `product ${handle ?? record.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/INVALID_DRAFT/i.test(message)) {
        console.warn(`  publish skipped (already published / no draft): ${handle ?? record.id}`);
      } else {
        throw error;
      }
    }
    updated += 1;
  }

  console.log(
    `Done. scanned=${scanned} skip=${skipped} ${dryRun ? `wouldUpdate=${wouldUpdate}` : `updated=${updated}`}`,
  );
}
