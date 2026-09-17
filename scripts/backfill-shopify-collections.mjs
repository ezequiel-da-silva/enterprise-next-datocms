#!/usr/bin/env node
/**
 * Backfill de `collection_page` no Dato. Lista coleções na Storefront API e
 * reenvia cada uma como webhook `collections/update` assinado.
 *
 * Ignora `frontpage` e `home-page` (vitrine Shopify, não PLP).
 *
 * Uso:
 *   npm run shopify:backfill:collections -- --url https://site.vercel.app --dry-run
 */
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";

const STOREFRONT_API_VERSION = "2024-07";
const PAGE_SIZE = 50;
const DELAY_MS = 250;
const SKIP = new Set(["frontpage", "home-page"]);

function loadEnvFile() {
  try {
    for (const line of readFileSync(".env", "utf8").split("\n")) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // .env opcional
  }
}

function readArgs(argv) {
  const args = { dryRun: false, url: undefined };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--dry-run") args.dryRun = true;
    if (argv[i] === "--url") args.url = argv[i + 1];
  }
  return args;
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`backfill — falta ${name} (.env ou ambiente)`);
    process.exit(1);
  }
  return value;
}

function normalizeDomain(value) {
  return value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function storefrontAuthHeaders(token) {
  return token.startsWith("shpat_")
    ? { "Shopify-Storefront-Private-Token": token }
    : { "X-Shopify-Storefront-Access-Token": token };
}

function explainFetchError(err, context) {
  const cause = err?.cause?.code;
  if (cause === "SELF_SIGNED_CERT_IN_CHAIN") {
    console.error(
      `backfill — ${context}: certificado self-signed na cadeia TLS.\n` +
        "Proxy/antivirus a intercetar HTTPS. Ver docs/SHOPIFY.md (CLI Shopify — TLS local).",
    );
  } else {
    console.error(`backfill — ${context}:`, err?.message ?? err);
  }
  process.exit(1);
}

async function listStorefrontCollections(domain, token) {
  const query = `
    query BackfillCollections($cursor: String) {
      collections(first: ${PAGE_SIZE}, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes { id handle title descriptionHtml }
      }
    }
  `;

  const collections = [];
  let cursor = null;

  for (;;) {
    let response;
    try {
      response = await fetch(`https://${domain}/api/${STOREFRONT_API_VERSION}/graphql.json`, {
        method: "POST",
        headers: { "content-type": "application/json", ...storefrontAuthHeaders(token) },
        body: JSON.stringify({ query, variables: { cursor } }),
      });
    } catch (err) {
      explainFetchError(err, "Storefront API inacessível");
    }

    const json = await response.json();
    if (!response.ok || json.errors) {
      console.error("backfill — Storefront API devolveu erro:", JSON.stringify(json.errors ?? json));
      process.exit(1);
    }

    const page = json.data?.collections;
    for (const node of page?.nodes ?? []) {
      const id = String(node.id).match(/\/Collection\/(\d+)/)?.[1];
      const handle = typeof node.handle === "string" ? node.handle.trim() : "";
      if (!id || !handle || SKIP.has(handle.toLowerCase())) continue;
      collections.push({
        id: Number(id),
        handle,
        title: node.title ?? handle,
        body_html: node.descriptionHtml ?? "",
      });
    }

    if (!page?.pageInfo?.hasNextPage) break;
    cursor = page.pageInfo.endCursor;
  }

  return collections;
}

async function sendSignedWebhook({ endpoint, secret, domain, collection }) {
  const body = JSON.stringify(collection);
  const hmac = createHmac("sha256", secret).update(body, "utf8").digest("base64");

  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-shopify-topic": "collections/update",
        "x-shopify-shop-domain": domain,
        "x-shopify-hmac-sha256": hmac,
      },
      body,
    });
  } catch (err) {
    explainFetchError(err, `POST ${endpoint} falhou`);
  }

  return { status: response.status, text: await response.text() };
}

async function main() {
  loadEnvFile();

  const args = readArgs(process.argv.slice(2));
  const baseUrl = (args.url ?? process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/$/, "");
  if (!baseUrl) {
    console.error("backfill — indica o destino: --url https://<site> (ou NEXT_PUBLIC_SITE_URL)");
    process.exit(1);
  }

  const domain = normalizeDomain(requireEnv("SHOPIFY_STORE_DOMAIN"));
  const storefrontToken = requireEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN");
  const endpoint = `${baseUrl}/api/webhooks/shopify`;

  const collections = await listStorefrontCollections(domain, storefrontToken);
  console.log(`backfill — ${collections.length} coleção(ões) no canal Headless de ${domain}`);

  if (args.dryRun) {
    for (const collection of collections) console.log(`  [dry-run] ${collection.handle} — ${collection.title}`);
    return;
  }

  const secret = requireEnv("SHOPIFY_API_SECRET_KEY");
  let failures = 0;

  for (const collection of collections) {
    const { status, text } = await sendSignedWebhook({ endpoint, secret, domain, collection });
    if (status === 200) {
      console.log(`  ok   ${collection.handle}`);
    } else {
      failures += 1;
      console.error(`  FAIL ${collection.handle} — ${status} ${text.slice(0, 120)}`);
    }
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
  }

  console.log(`backfill — concluído (${collections.length - failures} ok, ${failures} falha(s))`);
  if (failures > 0) process.exit(1);
}

await main();
