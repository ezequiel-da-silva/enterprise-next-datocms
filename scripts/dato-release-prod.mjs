#!/usr/bin/env node
/**
 * Release do schema Dato para produção (profile `default`, site 201057):
 * status → dry-run → maintenance on → migrations num sandbox forkado do primary → promote → maintenance off.
 *
 *   npm run dato:release:prod:dry
 *   npm run dato:release:prod
 *   node scripts/dato-release-prod.mjs [--dry-run] [--skip-promote] [--force] [--destination=<env>]
 *
 * Auth: `npx datocms login` localmente; no CI, `DATOCMS_PROD_CMA_TOKEN` (token CMA, nunca o CDA de `DATOCMS_API_TOKEN`).
 * `maintenance:off` corre sempre, mesmo quando um passo falha.
 */
import { spawnSync } from "node:child_process";

const PROFILE = "default";

function parseArgs(argv) {
  const parsed = { dryRun: false, skipPromote: false, force: false, destination: undefined, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help") parsed.help = true;
    else if (arg === "--dry-run") parsed.dryRun = true;
    else if (arg === "--skip-promote") parsed.skipPromote = true;
    else if (arg === "--force") parsed.force = true;
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

function defaultDestination() {
  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:]/g, "").replace("T", "-");
  return `release-${stamp}`;
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
    "Uso: node scripts/dato-release-prod.mjs [--dry-run] [--skip-promote] [--force] [--destination=<env>]",
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

datocms(["migrations:run", `--destination=${destination}`, "--dry-run"]);

if (args.dryRun) {
  console.log(`\nDry-run concluído. Nada foi alterado em produção.`);
  process.exit(0);
}

let failed = false;
try {
  datocms(["maintenance:on", ...(args.force ? ["--force"] : [])]);
  datocms(["migrations:run", `--destination=${destination}`]);

  if (args.skipPromote) {
    console.log(`\nSandbox "${destination}" criado com as migrations. Confere no admin e promove com:`);
    console.log(`  npm run dato:promote:prod -- ${destination}`);
  } else {
    datocms(["environments:promote", destination]);
    console.log(`\n"${destination}" é agora o primary de produção.`);
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
