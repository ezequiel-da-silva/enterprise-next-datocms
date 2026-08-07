#!/usr/bin/env node
/**
 * Serves the `output: "standalone"` build.
 * `next start` is unsupported with standalone, and the standalone bundle does not
 * include `public/` or `.next/static/` — copy them in before booting the server.
 */
import { cpSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";

const STANDALONE = path.join(".next", "standalone");
const SERVER = path.join(STANDALONE, "server.js");

if (!existsSync(SERVER)) {
  console.error("serve-standalone — missing .next/standalone/server.js. Run `npm run build` first.");
  process.exit(1);
}

if (existsSync("public")) {
  cpSync("public", path.join(STANDALONE, "public"), { recursive: true });
}
cpSync(path.join(".next", "static"), path.join(STANDALONE, ".next", "static"), { recursive: true });

const child = spawn(process.execPath, [SERVER], {
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_ENV: "production",
    PORT: process.env.PORT ?? "3000",
    HOSTNAME: process.env.HOSTNAME ?? "127.0.0.1",
  },
});

child.on("exit", (code) => process.exit(code ?? 0));
