#!/usr/bin/env node
// beforeShellExecution guard: allow by default, deny destructive commands, ask for risky ones.
// Must always print one JSON object — hooks.json uses failClosed: true.

const DENY = [
  [/\brm\s+-[a-z]*r[a-z]*f?\s+(\/|~|\*|\.)(\s|$)/i, "Recursive delete of root, home or the whole project."],
  [/\bRemove-Item\b.*-Recurse\b.*\s(\/|~|\\|\*|\.|C:\\)(\s|$)/i, "Recursive delete of root, home or the whole project."],
  [/\bgit\s+push\b.*(--force|\s-f\b)/i, "Force push rewrites remote history."],
  [/\bgit\s+reset\s+--hard\b/i, "git reset --hard discards local changes."],
  [/\bgit\s+clean\s+-[a-z]*f[a-z]*d/i, "git clean -fd deletes untracked files (e.g. new scripts, .env)."],
  [/\bgit\s+(add|commit)\b.*\.env(\.[\w-]+)?(\s|$|["'])(?<!\.env\.example)/i, "Committing .env files leaks secrets."],
  [/\b(cat|type|Get-Content|gc|more|less)\b[^|;&]*\.env(\.[\w-]+)?(\s|$|["'])/i, "Reading .env files exposes secrets."],
  [/\bdatocms\s+environments:destroy\b/i, "Destroys a DatoCMS environment."],
];

const ASK = [
  [/\bgit\s+push\b/i, "Pushes to the remote."],
  [/\bgit\s+(checkout|restore)\s+(--\s+)?\.(\s|$)/i, "Discards local changes."],
  [/\bgit\s+branch\s+-D\b/i, "Force-deletes a branch."],
  [/\bdatocms\s+(environments:promote|maintenance:on|migrations:run)\b/i, "Changes the DatoCMS project schema or availability."],
  [/\bnpm\s+run\s+dato:release:prod\b(?!:dry)/i, "Releases schema to DatoCMS production."],
  [/\bvercel\b.*\b(--prod|env\s+(rm|add|pull))\b/i, "Changes Vercel production or env."],
];

function reply(payload) {
  process.stdout.write(JSON.stringify(payload));
  process.exit(0);
}

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  raw += chunk;
});
process.stdin.on("end", () => {
  let command = "";
  try {
    command = String(JSON.parse(raw || "{}").command ?? "");
  } catch {
    reply({ permission: "ask", user_message: "Shell guard could not parse the hook input." });
  }

  for (const [pattern, reason] of DENY) {
    if (pattern.test(command)) {
      reply({
        permission: "deny",
        user_message: `Blocked by shell-guard: ${reason}`,
        agent_message: `shell-guard denied this command: ${reason} Ask the user to run it manually if it is really needed.`,
      });
    }
  }

  for (const [pattern, reason] of ASK) {
    if (pattern.test(command)) {
      reply({
        permission: "ask",
        user_message: `shell-guard: ${reason} Approve?`,
        agent_message: `shell-guard requires user approval: ${reason}`,
      });
    }
  }

  reply({ permission: "allow" });
});
