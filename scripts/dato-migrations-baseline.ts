/**
 * Records every file in `migrations/` as applied in `schema_migration` without running it.
 * Only for a project whose schema already matches the repo (e.g. Staging duplicated from
 * production with models/fields only). Refuses production (site 201057).
 *
 *   npx datocms cma:script scripts/dato-migrations-baseline.ts --profile=staging
 */
import { readdirSync } from "node:fs";
import { join } from "node:path";

import type { Client } from "datocms/lib/cma-client-node";

const PRODUCTION_SITE_ID = "201057";
const MIGRATION_MODEL = "schema_migration";

export default async function datoMigrationsBaseline(client: Client): Promise<void> {
  const site = await client.site.find();
  console.log(`Site ${site.id} (${site.name})`);
  if (site.id === PRODUCTION_SITE_ID) {
    throw new Error(`Refusing to baseline production site ${PRODUCTION_SITE_ID}`);
  }

  const model = await client.itemTypes.find(MIGRATION_MODEL);

  const applied = new Set<string>();
  for await (const item of client.items.listPagedIterator({ filter: { type: MIGRATION_MODEL } })) {
    const { name } = item as { name?: string | null };
    if (typeof name === "string") applied.add(name);
  }

  const files = readdirSync(join(process.cwd(), "migrations"))
    .filter((f) => f.endsWith(".ts") || f.endsWith(".js"))
    .sort();

  let recorded = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    await client.items.create({
      item_type: { type: "item_type", id: model.id },
      name: file,
    });
    recorded += 1;
    console.log(`  registada: ${file}`);
  }

  console.log(`Baseline concluído: ${recorded} registada(s), ${applied.size} já existiam.`);
}
