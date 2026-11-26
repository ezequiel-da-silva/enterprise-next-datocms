/**
 * Normalize `product_page.title` for `en`: drop mock trailing junk tokens
 * (e.g. "Liquid snow" → "Liquid") without changing PT-BR / ES.
 *
 * Default is dry-run (`DRY_RUN` unset or ≠ `0`); set `DRY_RUN=0` to update + publish.
 *
 *   npx datocms cma:script scripts/normalize-product-titles-en.ts --profile=default
 *   DRY_RUN=0 npx datocms cma:script scripts/normalize-product-titles-en.ts --profile=default
 */
import type { Client } from "datocms/lib/cma-client-node";
import {
  normalizeProductTitleEn,
  productTitleEnNeedsUpdate,
} from "../src/lib/i18n/normalize-product-title-en";
import { asLocalized, field, publishIfDraftModel, type Raw } from "./lib/dato-script-helpers";

const EN = "en";

function localeString(titles: Record<string, Raw>, locale: string): string | null {
  const value = titles[locale];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export default async function normalizeProductTitlesEn(client: Client): Promise<void> {
  const dryRun = process.env.DRY_RUN !== "0";
  const site = await client.site.find();
  console.log(`Site ${site.id} (${site.name}) — normalize product titles en`);
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
    const enCurrent = localeString(titles, EN);
    const handleRaw = field(record, "shopify_handle");
    const handle = typeof handleRaw === "string" ? handleRaw : null;

    const desired = normalizeProductTitleEn(enCurrent);
    if (!productTitleEnNeedsUpdate(enCurrent, desired) || !desired) {
      skipped += 1;
      continue;
    }

    wouldUpdate += 1;
    console.log(`  ${handle ?? record.id}: "${enCurrent ?? "(empty)"}" → "${desired}"`);

    if (dryRun) continue;

    const nextTitle = { ...titles, [EN]: desired };
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
