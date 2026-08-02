#!/usr/bin/env bash
# Remind agent to run typecheck after editing src/ TypeScript files.
# Hook: afterFileEdit — fails open (exit 0 always).

set -euo pipefail

input=$(cat)
file_path=$(echo "$input" | node -e "
  let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{
    try { console.log(JSON.parse(d).file_path || JSON.parse(d).path || ''); }
    catch { console.log(''); }
  });
" 2>/dev/null || true)

if [[ "$file_path" == src/* ]] && [[ "$file_path" =~ \.(ts|tsx)$ ]]; then
  echo "[next-dato hook] Edited $file_path — run: npm run typecheck (and npm test if logic changed)" >&2
fi

exit 0
