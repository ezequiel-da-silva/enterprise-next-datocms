#!/usr/bin/env node
/**
 * graphql-codegen resolves importSchemaTypesFrom to a broken relative path.
 * Fix the import to point at schema.types.ts in the same directory.
 */
import { readFileSync, writeFileSync } from "node:fs";

const OPERATIONS = "src/infra/datocms/generated/operations.types.ts";

let content = readFileSync(OPERATIONS, "utf8");
const fixed = content.replace(
  /^import type \* as Types from '[^']+';$/m,
  "import type * as Types from './schema.types';",
);

if (fixed === content) {
  console.warn("fix-codegen-import — no import line updated (already correct?)");
} else {
  writeFileSync(OPERATIONS, fixed);
  console.log("fix-codegen-import — corrected schema.types import path.");
}
