#!/usr/bin/env node
/**
 * Release do schema Dato para produção (profile `default`, site 201057):
 * status → dry-run → maintenance on → migrations num sandbox forkado do primary → promote → maintenance off.
 *
 *   npm run dato:release:prod:dry
 *   npm run dato:release:prod
 *   node scripts/dato-release-prod.mjs [--dry-run] [--skip-promote] [--force] [--in-place] [--destination=<env>]
 *
 * Fork (default): sandbox `main-post-migrations` → promote (primary continua `main`).
 * `--in-place`: migrations no primary `main` sem fork (plano Free / PLAN_UPGRADE_REQUIRED no fork).
 *   Não combinar com maintenance:on — o primary fica read-only e a migration falha (MAINTENANCE_MODE).
 *   Só para migrations estritamente aditivas.
 *
 * Auth: `npx datocms login` localmente; no CI, `DATOCMS_PROD_CMA_TOKEN` (token CMA, nunca o CDA de `DATOCMS_API_TOKEN`).
 * `maintenance:off` corre sempre, mesmo quando um passo falha.
 */
import { spawnSync } from "node:child_process";

const PROFILE = "default";

function parseArgs(argv) {
  const parsed = {
    dryRun: false,
    skipPromote: false,
    force: false,
    inPlace: false,
    destination: undefined,
    help: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help") parsed.help = true;
    else if (arg === "--dry-run") parsed.dryRun = true;
    else if (arg === "--skip-promote") parsed.skipPromote = true;
    else if (arg === "--force") parsed.force = true;
    else if (arg === "--in-place") parsed.inPlace = true;
    else if (arg.startsWith("--destination=")) parsed.destination = arg.slice("--destination=".length);
    else if (arg === "--destination") {
      parsed.destination = argv[i + 1];
      i += 1;
    } else {
      console.error(`Argumento desconhecido: ${arg}`);
      parsed.help = true;
    }
  }
  return parsed;
}

/** Fork temporário alinhado ao primary `main` (mesmo padrão da CLI quando `--destination` omite). */
const DEFAULT_RELEASE_DESTINATION = "main-post-migrations";

function defaultDestination() {
  return process.env.DATOCMS_RELEASE_DESTINATION?.trim() || DEFAULT_RELEASE_DESTINATION;
}

const tokenArgs = process.env.DATOCMS_PROD_CMA_TOKEN?.trim()
  ? [`--api-token=${process.env.DATOCMS_PROD_CMA_TOKEN.trim()}`]
  : [];

function datocms(args, { allowFailure = false } = {}) {
  const printable = ["npx", "datocms", ...args].join(" ");
  console.log(`\n$ ${printable}`);
  const result = spawnSync("npx", ["datocms", ...args, `--profile=${PROFILE}`, ...tokenArgs], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0 && !allowFailure) {
    throw new Error(`Falhou: ${printable}`);
  }
  return result.status ?? 1;
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log(
    "Uso: node scripts/dato-release-prod.mjs [--dry-run] [--skip-promote] [--force] [--in-place] [--destination=<env>]",
  );
  process.exit(process.argv.includes("--help") ? 0 : 1);
}

const destination = args.destination?.trim() || defaultDestination();
if (!/^[a-z0-9][a-z0-9-]*$/.test(destination)) {
  console.error(`Nome de sandbox inválido: "${destination}" (só minúsculas, números e hífenes).`);
  process.exit(1);
}

const pendingStatus = datocms(["cma:script", "scripts/dato-migrations-status.ts"], { allowFailure: true });
if (pendingStatus === 0) {
  console.log("\nProdução já tem todas as migrations do repo. Nada a fazer.");
  process.exit(0);
}

if (args.inPlace) {
  datocms(["migrations:run", "--in-place", "--allow-primary", "--source=main", "--dry-run"]);
} else {
  datocms(["environments:destroy", destination], { allowFailure: true });
  datocms(["migrations:run", `--destination=${destination}`, "--dry-run"]);
}

if (args.dryRun) {
  console.log(`\nDry-run concluído. Nada foi alterado em produção.`);
  process.exit(0);
}

let failed = false;
try {
  if (args.inPlace) {
    console.log(
      "\nIn-place no primary `main` (sem maintenance — o modo manutenção bloqueia alterações de schema).",
    );
    datocms(["migrations:run", "--in-place", "--allow-primary", "--source=main"]);
    console.log("\nMigrations aplicadas em `main`. Confere no admin e apaga sandboxes obsoletos se quiseres.");
  } else {
    datocms(["maintenance:on", ...(args.force ? ["--force"] : [])]);
    datocms(["environments:destroy", destination], { allowFailure: true });
    datocms(["migrations:run", `--destination=${destination}`]);

    if (args.skipPromote) {
      console.log(`\nSandbox "${destination}" criado com as migrations. Confere no admin e promove com:`);
      console.log(`  npm run dato:promote:prod -- ${destination}`);
    } else {
      datocms(["environments:promote", destination]);
      console.log(
        `\nSandbox "${destination}" promovido. O primary de produção continua a ser \`main\` (DATOCMS_ENVIRONMENT=main).`,
      );
      console.log(`Apaga sandboxes antigos (ex. \`main-bkp-*\`) no admin quando já não precisares de rollback.`);
    }
  }
} catch (error) {
  failed = true;
  console.error(`\n${error instanceof Error ? error.message : String(error)}`);
} finally {
  const offStatus = datocms(["maintenance:off"], { allowFailure: true });
  if (offStatus !== 0) {
    console.error("\nATENÇÃO: maintenance:off falhou. Desliga o modo de manutenção à mão no admin do Dato.");
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
