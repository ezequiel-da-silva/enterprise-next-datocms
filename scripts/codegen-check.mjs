#!/usr/bin/env node
/**
 * Regenerates GraphQL types from the committed CDA SDL and fails if generated
 * files drift. Offline — does not call graphql.datocms.com.
 * Usage: npm run codegen:check
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

const GENERATED = "src/infra/datocms/generated";
const SDL = `${GENERATED}/schema.graphql`;

if (!existsSync(SDL)) {
  console.error(
    "codegen:check — missing",
    SDL,
    "— run `npm run codegen:from-dato` after a Dato schema change and commit the dump.",
  );
  process.exit(1);
}

try {
  execSync("npm run codegen", { stdio: "inherit", env: process.env });
  execSync(`git diff --exit-code -- ${GENERATED}`, { stdio: "inherit" });
  console.log("codegen:check — generated types match the committed SDL and GraphQL documents.");
} catch {
  console.error(
    "codegen:check FAILED — run `npm run codegen` (or `npm run codegen:from-dato` if the Dato schema changed) and commit",
    GENERATED,
  );
  process.exit(1);
}
