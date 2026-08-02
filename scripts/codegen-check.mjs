#!/usr/bin/env node
/**
 * Runs GraphQL codegen and fails if generated files drift from committed state.
 * Usage: npm run codegen:check (requires .env with DATOCMS_API_TOKEN)
 */
import { execSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";

const GENERATED = "src/infra/datocms/generated";

if (!existsSync(".env")) {
  if (process.env.DATOCMS_API_TOKEN) {
    writeFileSync(".env", `DATOCMS_API_TOKEN=${process.env.DATOCMS_API_TOKEN}\n`);
  } else {
    console.error("codegen:check — missing .env or DATOCMS_API_TOKEN");
    process.exit(1);
  }
}

try {
  execSync("npm run codegen", { stdio: "inherit", env: process.env });
  execSync(`git diff --exit-code -- ${GENERATED}`, { stdio: "inherit" });
  console.log("codegen:check — generated types match GraphQL documents.");
} catch {
  console.error(
    "codegen:check FAILED — run npm run codegen and commit changes to",
    GENERATED,
  );
  process.exit(1);
}
