#!/usr/bin/env node
/**
 * CI-only, read-only: compares `migrations/` with the `schema_migration` records of the PRODUCTION
 * Dato project and writes a PR comment body when some are not applied yet. Never fails the job —
 * it only warns (the release itself stays manual: `npm run dato:release:prod`).
 *
 * Uses the CMA REST API directly (no `datocms` CLI, no `npm ci`), so it is fast and the token only
 * ever travels to site-api.datocms.com.
 *
 * Env:
 *   DATOCMS_PROD_CMA_READONLY_TOKEN  CMA token of project 201057 limited to reading content (never the CDA token).
 *   DATOCMS_EXPECTED_SITE_ID         default "201057"; the check aborts if the token belongs to another project.
 *   DATOCMS_SITE_API_URL             default "https://site-api.datocms.com" (override for tests).
 *   RELEASE_WORKFLOW_URL             link to the manual release workflow, shown in the comment.
 *   GITHUB_OUTPUT                    receives `status` (skipped | ok | pending | error) and `body_file`.
 */
import { appendFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MIGRATION_MODEL = "schema_migration";
const MARKER = "<!-- dato-migrations-check -->";
const PAGE_SIZE = 500;
const MAX_PAGES = 20;

const token = process.env.DATOCMS_PROD_CMA_READONLY_TOKEN?.trim();
const expectedSiteId = process.env.DATOCMS_EXPECTED_SITE_ID?.trim() || "201057";
const apiUrl = (process.env.DATOCMS_SITE_API_URL?.trim() || "https://site-api.datocms.com").replace(/\/$/, "");
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

async function cma(path) {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "X-Api-Version": "3" },
  });
  if (!response.ok) {
    throw new Error(`GET ${path.split("?")[0]} → ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function appliedMigrations() {
  const applied = new Set();
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const query = `filter[type]=${MIGRATION_MODEL}&page[limit]=${PAGE_SIZE}&page[offset]=${page * PAGE_SIZE}`;
    const { data } = await cma(`/items?${query}`);
    for (const item of data ?? []) {
      const name = item.attributes?.name ?? item.name;
      if (typeof name === "string") applied.add(name);
    }
    if ((data ?? []).length < PAGE_SIZE) break;
  }
  return applied;
}

function pendingBody(pending, local, applied) {
  const lines = [
    MARKER,
    "### ⚠️ Há migrations Dato por aplicar na produção",
    "",
    `A produção (\`${expectedSiteId}\`) tem ${applied} de ${local} migrations deste repositório. Pendentes:`,
    "",
    ...pending.map((file) => `- \`${file}\``),
    "",
    "**O merge não aplica o schema.** Rode o release **antes do deploy** quando o código novo usa esses modelos ou campos:",
    "",
    "```bash",
    "npm run dato:release:prod:dry   # status + simulação, não altera nada",
    "npm run dato:release:prod       # maintenance on → sandbox com as migrations → promote → maintenance off",
    "```",
    "",
    releaseUrl ? `Ou pelo GitHub: [Run workflow](${releaseUrl}) (começa com \`dry_run\` ligado).` : "",
    "",
    "Se a migration criou modelos com conteúdo (seed, registros), faça isso na produção também. Veja `docs/DATOCMS.md` § Fluxo de migrations.",
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
    console.log("::notice::DATOCMS_PROD_CMA_READONLY_TOKEN não definido (PR de fork, Dependabot ou secret em falta). Check ignorado.");
    setOutput("skipped");
    return;
  }

  const { data: site } = await cma("/site");
  if (String(site?.id) !== expectedSiteId) {
    throw new Error(`O token pertence ao site ${site?.id}, esperado ${expectedSiteId}. Verifique o secret.`);
  }

  const local = localMigrations();
  const applied = await appliedMigrations();
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
