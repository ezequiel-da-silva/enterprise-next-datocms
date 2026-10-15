#!/usr/bin/env node
/**
 * CI-only, read-only: compares `migrations/` with the `schema_migration` records of the PRODUCTION
 * Dato project and writes a PR comment body when some are not applied yet. Never fails the job —
 * it only warns (the release itself stays manual: `npm run dato:release:prod`).
 *
 * Reads through the CDA (GraphQL, published content) because the free plan has no custom roles, so
 * a read-only CMA token cannot be created. `schema_migration` is not a draft model: the CLI
 * publishes each record as soon as it creates it. Needs no `npm ci` and the token only ever travels
 * to graphql.datocms.com.
 *
 * Env:
 *   DATOCMS_PROD_CDA_TOKEN   CDA token (published) of the PRODUCTION project. A Staging token reports Staging.
 *   DATOCMS_GRAPHQL_URL      default "https://graphql.datocms.com/" (override for tests).
 *   RELEASE_WORKFLOW_URL     link to the manual release workflow, shown in the comment.
 *   GITHUB_OUTPUT            receives `status` (skipped | ok | pending | error) and `body_file`.
 */
import { appendFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MARKER = "<!-- dato-migrations-check -->";
const PAGE_SIZE = 500;
const MAX_PAGES = 20;

const token = process.env.DATOCMS_PROD_CDA_TOKEN?.trim();
const graphqlUrl = process.env.DATOCMS_GRAPHQL_URL?.trim() || "https://graphql.datocms.com/";
const releaseUrl = process.env.RELEASE_WORKFLOW_URL?.trim() || "";
const bodyFile = join(process.env.RUNNER_TEMP || process.cwd(), "dato-migrations-comment.md");

function setOutput(status) {
  console.log(`status=${status}`);
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `status=${status}\nbody_file=${bodyFile}\n`);
  }
}

function localMigrations() {
  return readdirSync(join(process.cwd(), "migrations"))
    .filter((file) => file.endsWith(".ts") || file.endsWith(".js"))
    .sort();
}

const QUERY = `query ($first: IntType!, $skip: IntType!) {
  allSchemaMigrations(first: $first, skip: $skip) { name }
}`;

async function appliedMigrations() {
  const applied = new Set();
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const response = await fetch(graphqlUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { first: PAGE_SIZE, skip: page * PAGE_SIZE } }),
    });
    if (!response.ok) throw new Error(`CDA → ${response.status} ${response.statusText}`);
    const payload = await response.json();
    if (payload.errors?.length) throw new Error(`CDA: ${payload.errors[0].message}`);
    const rows = payload.data?.allSchemaMigrations ?? [];
    for (const row of rows) if (typeof row.name === "string") applied.add(row.name);
    if (rows.length < PAGE_SIZE) break;
  }
  return applied;
}
function pendingBody(pending, local, applied) {
  const lines = [
    MARKER,
    "### ⚠️ Há migrations Dato por aplicar na produção",
    "",
    `A produção tem ${applied} de ${local} migrations deste repositório. Pendentes:`,
    "",
    ...pending.map((file) => `- \`${file}\``),
    "",
    "O merge em `main` dispara o deploy, mas **não aplica o schema**. Faça isto **antes de fazer o merge**, nesta ordem:",
    "",
    "1. Confirme que ninguém está com o admin do Dato aberto (o release liga o maintenance mode e recusa se houver editor ativo) e que `npx datocms login` está ativo.",
    "2. Simule: `npm run dato:release:prod:dry` (status + simulação, não altera nada).",
    "3. Aplique: `npm run dato:release:prod` (maintenance on → sandbox com as migrations → promote → maintenance off)." +
      (releaseUrl ? ` Ou pelo GitHub: [Run workflow](${releaseUrl}) (começa com \`dry_run\` ligado).` : ""),
    "4. Seed e conteúdo na produção: abra o cabeçalho de cada migration pendente em `migrations/` e faça o que ele pedir (script de seed, registros a criar no admin).",
    "5. Só depois, faça o merge.",
    "",
    "Detalhes em `docs/DATOCMS.md` § Fluxo de migrations.",
    "",
    "_Aviso automático: este check não bloqueia o PR._",
  ];
  return lines.join("\n");
}

function okBody(local) {
  return [
    MARKER,
    "### ✅ A produção tem todas as migrations deste repositório",
    "",
    `${local} de ${local} aplicadas. Não há release de schema a fazer para este PR.`,
  ].join("\n");
}

async function main() {
  if (!token) {
    console.log("::notice::DATOCMS_PROD_CDA_TOKEN não definido (PR de fork, Dependabot ou secret em falta). Check ignorado.");
    setOutput("skipped");
    return;
  }

  const local = localMigrations();
  const applied = await appliedMigrations();
  if (applied.size === 0) {
    // A real project always has applied migrations; zero means an empty/wrong project or an unpublished model.
    throw new Error("Nenhuma migration registada (token de outro projecto, ou modelo schema_migration sem registos publicados).");
  }
  const pending = local.filter((file) => !applied.has(file));
  console.log(`Migrations: ${local.length} no repo, ${applied.size} registadas, ${pending.length} pendentes`);

  if (pending.length === 0) {
    writeFileSync(bodyFile, okBody(local.length));
    setOutput("ok");
    return;
  }

  for (const file of pending) console.log(`::warning title=Migration Dato pendente na produção::${file}`);
  writeFileSync(bodyFile, pendingBody(pending, local.length, local.length - pending.length));
  setOutput("pending");
}

main().catch((error) => {
  console.log(`::warning title=Check de migrations Dato falhou::${error instanceof Error ? error.message : String(error)}`);
  setOutput("error");
});
