/**
 * Removes dummy footer social links from the `navigation` singleton:
 * - `plataforma` contains "github" (case-insensitive), and/or
 * - `url` is https://www.google.com (with or without trailing slash)
 *
 * `social_links` is localized — scrub every locale (CDA may fall back empty locales to `en`).
 *
 *   npx datocms cma:script scripts/remove-github-footer-link.ts --profile=staging
 *   npx datocms cma:script scripts/remove-github-footer-link.ts --profile=default
 */
import type { Client } from "datocms/lib/cma-client-node";
import {
  asLocalized,
  blockAttr,
  blockId,
  field,
  type Raw,
} from "./lib/dato-script-helpers";

function normalizeUrl(raw: string): string {
  return raw.trim().replace(/\/$/, "").toLowerCase();
}

function isDummySocial(block: Raw): boolean {
  const plataforma = blockAttr(block, "plataforma");
  const url = blockAttr(block, "url");
  const platform = typeof plataforma === "string" ? plataforma.toLowerCase() : "";
  const href = typeof url === "string" ? normalizeUrl(url) : "";
  if (platform.includes("github")) return true;
  if (href === "https://www.google.com") return true;
  return false;
}

async function publishNavigation(client: Client, id: string): Promise<void> {
  try {
    await client.items.publish(id);
    console.log("  publicado: navigation");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/INVALID_DRAFT/i.test(message)) {
      console.log("  publish skipped (already published / no draft)");
      return;
    }
    throw error;
  }
}

export default async function removeGithubFooterLink(client: Client): Promise<void> {
  const site = await client.site.find();
  console.log(`Site ${site.id} (${site.name}) — remove dummy Github/google footer social link`);

  const [navigation] = await client.items.list({ filter: { type: "navigation" }, nested: true });
  if (!navigation) {
    console.warn("  navigation singleton not found — nothing to do.");
    return;
  }

  const socialRaw = field(navigation, "social_links");
  const byLocale = asLocalized<Raw[]>(socialRaw);
  const locales = Object.keys(byLocale).length > 0 ? Object.keys(byLocale) : site.locales;

  let removedTotal = 0;
  const nextSocial: Record<string, string[]> = {};

  for (const locale of locales) {
    const blocks = Array.isArray(byLocale[locale]) ? byLocale[locale] : [];
    const keep: string[] = [];
    for (const block of blocks) {
      const id = blockId(block);
      if (!id) continue;
      if (isDummySocial(block)) {
        removedTotal += 1;
        console.log(
          `  [${locale}] remover: plataforma=${String(blockAttr(block, "plataforma"))} url=${String(blockAttr(block, "url"))}`,
        );
        continue;
      }
      keep.push(id);
    }
    nextSocial[locale] = keep;
  }

  if (removedTotal === 0) {
    console.log("  nenhum link Github/google.com encontrado.");
    return;
  }

  await client.items.update(navigation.id, { social_links: nextSocial });
  await publishNavigation(client, navigation.id);
  console.log(`  removidos ${removedTotal}`);
}
