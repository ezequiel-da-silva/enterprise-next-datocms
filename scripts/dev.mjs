#!/usr/bin/env node
/**
 * Starts `next dev` after clearing `.next`, but refuses to do so while another
 * dev server owns the directory.
 *
 * Deleting `.next` under a live dev server leaves it writing partial manifests
 * (a short write over a longer file keeps the trailing bytes), and every render
 * then fails with `SyntaxError: Unexpected non-whitespace character after JSON`.
 * Next's own "another dev server is already running" guard only runs after the
 * damage would have been done.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, watch, writeFileSync } from "node:fs";
import { join } from "node:path";

const LOCK_FILE = ".next/dev/lock";
const PRERENDER_MANIFEST = join(".next", "dev", "prerender-manifest.json");

function readRunningServer() {
  if (!existsSync(LOCK_FILE)) {
    return null;
  }

  let lock;
  try {
    lock = JSON.parse(readFileSync(LOCK_FILE, "utf8"));
  } catch {
    return null;
  }

  const pid = Number(lock?.pid);
  if (!Number.isInteger(pid) || pid <= 0) {
    return null;
  }

  try {
    process.kill(pid, 0);
  } catch {
    /* Stale lock: the process is gone, so `.next` is ours to clear. */
    return null;
  }

  return { pid, appUrl: lock?.appUrl ?? `http://localhost:${lock?.port ?? 3000}` };
}

const running = readRunningServer();
if (running) {
  console.error(
    [
      "dev — another Next dev server is already using .next:",
      `  PID:  ${running.pid}`,
      `  URL:  ${running.appUrl}`,
      "",
      "Reuse it, or stop it first:",
      `  kill ${running.pid}`,
      "",
      "To run a second instance, use a separate port and dist dir.",
    ].join("\n"),
  );
  process.exit(1);
}

/**
 * Index right after the first top-level JSON value, or -1.
 * Brace counting (string- and escape-aware) instead of parsing prefixes: the
 * manifest grows to tens of KB and this runs on every write.
 */
function endOfFirstJsonValue(text) {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }

    if (char === '"') inString = true;
    else if (char === "{" || char === "[") depth += 1;
    else if (char === "}" || char === "]") {
      depth -= 1;
      if (depth === 0) return i + 1;
    }
  }

  return -1;
}

/**
 * `next dev` does a read-modify-write of the dev prerender manifest for each
 * dynamic route whose static paths it computes (`next-dev-server.js`, around
 * the `PRERENDER_MANIFEST` writeFile). Two routes computing in parallel — here
 * `/[slug]` and `/[slug]/[pageSlug]` — race: the shorter write lands last and
 * `writeFile` leaves the longer one's tail behind, so the file gets trailing
 * bytes after a complete JSON value. Every request that reads the manifest
 * then 500s with `SyntaxError: Unexpected non-whitespace character after JSON`.
 *
 * Truncating back to the complete value keeps dev usable; the routes that lost
 * their entry re-add it on the next computation.
 */
function watchPrerenderManifest() {
  let repairing = false;

  const repair = () => {
    if (repairing || !existsSync(PRERENDER_MANIFEST)) return;

    let raw;
    try {
      raw = readFileSync(PRERENDER_MANIFEST, "utf8");
    } catch {
      return;
    }

    try {
      JSON.parse(raw);
      return;
    } catch {
      /* Corrupted: fall through to the truncation below. */
    }

    const end = endOfFirstJsonValue(raw);
    if (end <= 0 || end === raw.length) return;

    const candidate = raw.slice(0, end);
    try {
      JSON.parse(candidate);
    } catch {
      return;
    }

    repairing = true;
    try {
      writeFileSync(PRERENDER_MANIFEST, candidate);
      console.warn(
        `dev — repaired ${PRERENDER_MANIFEST}: dropped ${raw.length - end} trailing bytes from a concurrent write.`,
      );
    } catch {
      /* Next may be mid-write; the next change event retries. */
    } finally {
      repairing = false;
    }
  };

  /* `.next/dev` only appears after the server boots, so watch the parent. */
  try {
    const watcher = watch(".next", { recursive: true }, (_event, filename) => {
      if (filename && filename.replaceAll("\\", "/").endsWith("dev/prerender-manifest.json")) {
        repair();
      }
    });
    watcher.unref();
  } catch {
    /* Without a watcher dev still runs; only the auto-repair is lost. */
  }
}

rmSync(".next", { recursive: true, force: true });
mkdirSync(".next", { recursive: true });
watchPrerenderManifest();

const nextBin = existsSync("node_modules/.bin/next") ? "node_modules/.bin/next" : "next";

const child = spawn(nextBin, ["dev", "--webpack", ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: false,
  env: process.env,
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("exit", (code, signal) => {
  process.exit(signal ? 1 : (code ?? 0));
});
