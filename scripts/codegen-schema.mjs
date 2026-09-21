#!/usr/bin/env node
/**
 * Live CDA SDL dump. Fails if graphql.datocms.com is unreachable (e.g. quota).
 * CI never runs this — it uses the committed schema.graphql.
 */
import { spawnSync } from "node:child_process";

const result = spawnSync(
  "npx",
  ["graphql-codegen", "--config", "codegen-schema-dump.yml"],
  { stdio: "inherit", env: process.env, shell: process.platform === "win32" },
);

if (result.status !== 0) {
  console.error(`
codegen:schema — live introspection failed.
CI/pre-push use src/infra/datocms/generated/schema.graphql (offline).
When the CDA is available: npm run codegen:from-dato
Emergency (quota): node scripts/schema-types-to-sdl.mjs && npm run codegen
`);
  process.exit(result.status ?? 1);
}
