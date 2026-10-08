#!/usr/bin/env node
/**
 * Stopgap SDL from committed schema.types.ts when CDA introspection is unavailable.
 * Prefer `npm run codegen:schema` against graphql.datocms.com.
 */
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "src/infra/datocms/generated/schema.types.ts";
const DEST = "src/infra/datocms/generated/schema.graphql";
const BUILTIN = new Set(["ID", "String", "Boolean", "Int", "Float"]);

function pascalField(field) {
  return field.replace(/(^|_)([a-zA-Z])/g, (_, sep, c) => sep + c.toUpperCase());
}

function unwrapMaybe(t) {
  if (t.startsWith("Maybe<") && t.endsWith(">")) {
    return { inner: t.slice("Maybe<".length, -1), nullable: true };
  }
  if (t.startsWith("InputMaybe<") && t.endsWith(">")) {
    return { inner: t.slice("InputMaybe<".length, -1), nullable: true };
  }
  return { inner: t, nullable: false };
}

function mapTsType(raw) {
  let t = raw.trim().replace(/;$/, "");
  const outer = unwrapMaybe(t);
  t = outer.inner;
  const nullable = outer.nullable;

  let list = false;
  let innerNullable = false;
  if (t.startsWith("Array<") && t.endsWith(">")) {
    list = true;
    t = t.slice("Array<".length, -1);
    const inner = unwrapMaybe(t);
    t = inner.inner;
    innerNullable = inner.nullable;
  }

  const scalar = t.match(/^Scalars\['(\w+)'\]\['(?:input|output)'\]$/);
  let gql = scalar ? scalar[1] : t;
  if (list) gql = `[${innerNullable ? gql : `${gql}!`}]`;
  if (!nullable) gql = `${gql}!`;
  return gql;
}

function parseBlocks(source) {
  const blocks = [];
  const parts = source.split(/(?=export type )/);
  for (const part of parts) {
    const obj = part.match(/^export type (\w+)\s*=\s*((?:\w+\s*&\s*)?)\{([\s\S]*?)\n\};/);
    if (obj) {
      blocks.push({
        kind: "object",
        name: obj[1],
        implementsName: obj[2] ? obj[2].replace(/\s*&\s*$/, "").trim() : "",
        body: obj[3],
      });
      continue;
    }
    const union = part.match(/^export type (\w+)\s*=\s*([\s\S]+?);/);
    if (union && !union[2].includes("{")) {
      blocks.push({ kind: "union", name: union[1], members: union[2] });
    }
  }
  return blocks;
}

function parseFields(body, typeName, argsMap) {
  const fields = [];
  for (const line of body.split("\n")) {
    const m = line.match(/^\s{2}(\w+)(\?)?:\s*(.+)$/);
    if (!m) continue;
    const name = m[1];
    const optional = Boolean(m[2]);
    const tsType = m[3].replace(/;$/, "").trim();
    if (name === "__typename") continue;
    let gqlType = mapTsType(tsType);
    if (optional && gqlType.endsWith("!")) gqlType = gqlType.slice(0, -1);
    const argsType = argsMap.get(`${typeName}${pascalField(name)}Args`);
    const args = argsType ? `(${argsType})` : "";
    fields.push(`  ${name}${args}: ${gqlType}`);
  }
  return fields;
}

function parseArgsFields(body) {
  const args = [];
  for (const line of body.split("\n")) {
    const m = line.match(/^\s{2}(\w+)(\?)?:\s*(.+)$/);
    if (!m) continue;
    const optional = Boolean(m[2]);
    let gqlType = mapTsType(m[3].replace(/;$/, "").trim());
    if (optional && gqlType.endsWith("!")) gqlType = gqlType.slice(0, -1);
    args.push(`${m[1]}: ${gqlType}`);
  }
  return args.join(", ");
}

function classifyObject(name, body, implementsName) {
  if (name.endsWith("Args") || name === "Scalars") return "skip";
  if (name.endsWith("Interface") || name === "RecordInterface") return "interface";
  if (implementsName || /__typename\?:/.test(body) || name === "Query" || name === "Site") return "type";
  return "input";
}

function parseUnionMembers(raw) {
  return raw
    .replace(/\/\*\*[\s\S]*?\*\//g, "")
    .split("|")
    .map((s) => s.trim().replace(/[;'"]/g, ""))
    .filter(Boolean);
}

function main() {
  const source = readFileSync(SRC, "utf8");
  const blocks = parseBlocks(source);
  const argsMap = new Map();
  for (const b of blocks) {
    if (b.kind === "object" && b.name.endsWith("Args")) {
      argsMap.set(b.name, parseArgsFields(b.body));
    }
  }

  const scalars = [];
  const scalarBlock = source.match(/export type Scalars = \{([\s\S]*?)\n\};/);
  if (scalarBlock) {
    for (const line of scalarBlock[1].split("\n")) {
      const m = line.match(/^\s+(\w+):/);
      if (m && !BUILTIN.has(m[1])) scalars.push(`scalar ${m[1]}`);
    }
  }

  const enums = [];
  const inputs = [];
  const types = [];
  const interfaces = [];
  const unions = [];

  for (const b of blocks) {
    if (b.kind === "union") {
      const members = parseUnionMembers(b.members);
      const looksEnum = members.length > 0 && members.every((m) => /^[A-Za-z0-9_]+$/.test(m) && !m.endsWith("Record"));
      if (looksEnum) {
        enums.push(`enum ${b.name} {\n${members.map((m) => `  ${m}`).join("\n")}\n}`);
      } else {
        unions.push(`union ${b.name} = ${members.join(" | ")}`);
      }
      continue;
    }
    const cls = classifyObject(b.name, b.body, b.implementsName);
    if (cls === "skip") continue;
    const fields = parseFields(b.body, b.name, argsMap);
    if (fields.length === 0) continue;
    const body = fields.join("\n");
    if (cls === "interface") interfaces.push(`interface ${b.name} {\n${body}\n}`);
    else if (cls === "input") inputs.push(`input ${b.name} {\n${body}\n}`);
    else {
      const impl = b.implementsName ? ` implements ${b.implementsName}` : "";
      types.push(`type ${b.name}${impl} {\n${body}\n}`);
    }
  }

  const header = `# CDA SDL for graphql-codegen (offline).
# Live dump: npm run codegen:schema (DATOCMS_API_TOKEN + DATOCMS_ENVIRONMENT).
# If CDA introspection is down, bootstrap with: node scripts/schema-types-to-sdl.mjs

`;
  const sdl = [header, ...scalars, "", ...enums, "", ...interfaces, "", ...unions, "", ...types, "", ...inputs, ""].join(
    "\n",
  );
  writeFileSync(DEST, sdl);
  console.log("Wrote", DEST, `(${sdl.length} bytes) from ${SRC}`);
}

main();
