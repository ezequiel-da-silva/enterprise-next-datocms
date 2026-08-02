#!/usr/bin/env bash
# Block destructive shell commands. Hook: beforeShellExecution — failClosed in hooks.json.
set -euo pipefail

input=$(cat)
command=$(echo "$input" | node -e "
  let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{
    try { console.log(JSON.parse(d).command || ''); } catch { console.log(''); }
  });
" 2>/dev/null || true)

deny_patterns=(
  'git push .*--force'
  'git push -f'
  'git reset --hard'
  'git clean -fdx'
  'rm -rf /'
  'rm -rf \~'
  'git commit.*\.env'
)

for pattern in "${deny_patterns[@]}"; do
  if echo "$command" | grep -qE "$pattern"; then
    echo "{\"permission\":\"deny\",\"userMessage\":\"Blocked by next-dato shell-guard: destructive or unsafe command.\",\"agentMessage\":\"This command is blocked by project hooks. Use safer alternatives (e.g. git push without --force).\"}"
    exit 0
  fi
done

echo '{"permission":"allow"}'
exit 0
