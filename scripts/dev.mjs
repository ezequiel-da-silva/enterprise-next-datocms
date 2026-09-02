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
import { existsSync, readFileSync, rmSync } from "node:fs";

const LOCK_FILE = ".next/dev/lock";

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

rmSync(".next", { recursive: true, force: true });

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
