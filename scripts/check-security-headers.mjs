#!/usr/bin/env node
/**
 * Valida headers de segurança e smoke tests de rotas sensíveis.
 * Requer app em execução (ex.: NODE_ENV=production npm run start).
 *
 * Uso:
 *   SECURITY_BASE_URL=http://127.0.0.1:3000 NODE_ENV=production npm run security:headers
 */

const BASE_URL = (process.env.SECURITY_BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");
/** Quando true, exige também HSTS (só faz sentido se o servidor corre em modo produção). */
const STRICT_PRODUCTION =
  process.env.NODE_ENV === "production" || process.argv.includes("--production");
const TIMEOUT_MS = Number(process.env.SECURITY_TIMEOUT_MS ?? 10_000);
const PREVIEW_SECRET = process.env.DATOCMS_PREVIEW_SECRET?.trim() ?? "";
const TEST_SECRET = process.env.SECURITY_TEST_SECRET?.trim() || PREVIEW_SECRET;

/** @type {{ name: string; ok: boolean; detail?: string }[]} */
const results = [];

function pass(name, detail) {
  results.push({ name, ok: true, detail });
  console.log(`  OK   ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail) {
  results.push({ name, ok: false, detail });
  console.error(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
}

/**
 * @param {string} path
 * @param {RequestInit} [init]
 */
async function fetchPath(path, init = {}) {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      redirect: "manual",
    });
  } finally {
    clearTimeout(timer);
  }
}

function headerGet(headers, name) {
  return headers.get(name) ?? headers.get(name.toLowerCase()) ?? "";
}

async function checkReachable() {
  try {
    const res = await fetchPath("/");
    if (res.status >= 500) {
      fail("Servidor acessível", `GET / → ${res.status}`);
      return false;
    }
    pass("Servidor acessível", `GET / → ${res.status}`);
    return true;
  } catch (err) {
    fail("Servidor acessível", err instanceof Error ? err.message : String(err));
    console.error("\nDica: npm run build && NODE_ENV=production npm run start\n");
    return false;
  }
}

async function checkSecurityHeaders() {
  const res = await fetchPath("/");
  const h = res.headers;

  const required = [
    ["content-security-policy", "Content-Security-Policy"],
    ["x-content-type-options", "X-Content-Type-Options"],
    ["referrer-policy", "Referrer-Policy"],
    ["cross-origin-opener-policy", "Cross-Origin-Opener-Policy"],
    ["permissions-policy", "Permissions-Policy"],
  ];

  for (const [, label] of required) {
    const value = headerGet(h, label);
    if (!value) {
      fail(`Header ${label}`, "ausente");
    } else {
      pass(`Header ${label}`, value.slice(0, 80) + (value.length > 80 ? "…" : ""));
    }
  }

  const csp = headerGet(h, "Content-Security-Policy");
  const nosniff = headerGet(h, "X-Content-Type-Options");
  if (nosniff && nosniff.toLowerCase() !== "nosniff") {
    fail("X-Content-Type-Options", `valor inesperado: ${nosniff}`);
  }

  const devStyleInline =
    /style-src[^;]*'unsafe-inline'/.test(csp) && !/style-src[^;]*nonce-/.test(csp);
  const looksLikeDev = csp.includes("unsafe-eval") || devStyleInline;

  if (looksLikeDev) {
    fail(
      "CSP modo produção",
      "resposta com unsafe-eval ou style-src só unsafe-inline — parece next dev ou NODE_ENV≠production no processo do servidor",
    );
  } else {
    pass("CSP modo produção", "sem unsafe-eval; style-src com nonce ou restrito");
  }

  const hsts = headerGet(h, "Strict-Transport-Security");
  if (looksLikeDev) {
    console.log("  skip HSTS omitido enquanto CSP indicar ambiente de desenvolvimento");
  } else if (!hsts) {
    fail(
      "Strict-Transport-Security",
      "ausente — arranque com npm run start:prod (NODE_ENV=production)",
    );
  } else {
    pass("Strict-Transport-Security", hsts.slice(0, 60));
  }

  if (STRICT_PRODUCTION && looksLikeDev) {
    fail(
      "Servidor em modo produção",
      "NODE_ENV=production no cliente de teste mas CSP de dev — liberte a porta ou pare next dev",
    );
  }
}

async function checkDraftApi() {
  const unauth = await fetchPath("/api/draft");
  if (unauth.status === 401 || unauth.status === 500) {
    pass("GET /api/draft sem credenciais", `status ${unauth.status}`);
  } else {
    fail("GET /api/draft sem credenciais", `status inesperado ${unauth.status}`);
  }

  if (PREVIEW_SECRET) {
    const bad = await fetchPath("/api/draft?secret=definitely-invalid-secret-value");
    if (bad.status === 401) {
      pass("GET /api/draft secret inválido", "401 Unauthorized");
    } else {
      fail("GET /api/draft secret inválido", `status ${bad.status}`);
    }
  } else {
    console.log("  skip DATOCMS_PREVIEW_SECRET ausente — teste de secret inválido omitido");
  }

  if (TEST_SECRET) {
    const openRedirect = await fetchPath(
      `/api/draft?secret=${encodeURIComponent(TEST_SECRET)}&redirect=${encodeURIComponent("https://evil.example/phish")}`,
    );
    if (openRedirect.status === 422) {
      pass("GET /api/draft redirect absoluto", "422 URL must be relative");
    } else {
      fail("GET /api/draft redirect absoluto", `status ${openRedirect.status} (esperado 422)`);
    }
  } else {
    console.log("  skip redirect absoluto — defina DATOCMS_PREVIEW_SECRET ou SECURITY_TEST_SECRET");
  }
}

async function main() {
  console.log(`Security headers check → ${BASE_URL}`);
  console.log(`Teste estrito (CLI NODE_ENV=production): ${STRICT_PRODUCTION ? "sim" : "não"}\n`);

  const up = await checkReachable();
  if (!up) {
    process.exit(1);
  }

  console.log("\nHeaders:");
  await checkSecurityHeaders();

  console.log("\nAPI draft:");
  await checkDraftApi();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);

  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
