#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Criando .env a partir de .env.example…"
  cp .env.example .env
fi

IMAGE_NAME="${IMAGE_NAME:-next-dato:local}"

echo "Construindo imagem ${IMAGE_NAME}…"
docker build -t "${IMAGE_NAME}" .

echo "Subindo container em http://localhost:3000 (Ctrl+C encerra)…"
docker run --rm -p 3000:3000 --env-file .env "${IMAGE_NAME}"
