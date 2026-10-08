/**
 * Read-only check: lists files in `migrations/` that are not yet recorded in the
 * `schema_migration` model of the target project. Exits non-zero when any is pending.
 *
 *   npx datocms cma:script scripts/dato-migrations-status.ts --profile=staging
 *   npx datocms cma:script scripts/dato-migrations-status.ts --profile=default
 */
import { readdirSync } from "node:fs";
import { join } from "node:path";

import type { Client } from "datocms/lib/cma-client-node";

const MIGRATIONS_DIR = join(process.cwd(), "migrations");
const MIGRATION_MODEL = "schema_migration";

function localMigrations(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".ts") || f.endsWith(".js"))
    .sort();
}

async function appliedMigrations(client: Client): Promise<Set<string>> {
  const applied = new Set<string>();
  for await (const item of client.items.listPagedIterator({
    filter: { type: MIGRATION_MODEL },
  })) {
    const { name } = item as { name?: string | null };
    if (typeof name === "string") applied.add(name);
  }
  return applied;
}

export default async function datoMigrationsStatus(client: Client): Promise<void> {
  const site = await client.site.find();
  console.log(`Site ${site.id} (${site.name})`);

  const local = localMigrations();
  const applied = await appliedMigrations(client);
  const pending = local.filter((file) => !applied.has(file));

  console.log(`Migrations: ${local.length} no repo, ${applied.size} registadas, ${pending.length} pendentes`);

  if (pending.length > 0) {
    for (const file of pending) console.log(`  pendente: ${file}`);
    throw new Error(`${pending.length} migration(s) por aplicar no site ${site.id}`);
  }
}
