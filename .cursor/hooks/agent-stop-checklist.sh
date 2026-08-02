#!/usr/bin/env bash
# Agent stop checklist — fails open (exit 0).
set -euo pipefail

cat >&2 <<'EOF'
[next-dato hook] Before finishing:
  1. npm run typecheck && npm test && npm run lint
  2. npm run build (if UI/routes changed)
  3. npm run codegen (if GraphQL changed)
  4. No secrets (.env, tokens) in the diff
  See docs/QUALITY-GATES.md and .cursor/skills/pre-merge-quality/SKILL.md
EOF

exit 0
