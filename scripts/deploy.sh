#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRANCH="${DEPLOY_BRANCH:-main}"

cd "$REPO_DIR"

if [[ ! -f docker-compose.yml ]]; then
  echo "Erro: docker-compose.yml nao encontrado em $REPO_DIR" >&2
  exit 1
fi

if [[ ! -f .env ]]; then
  if [[ -f .env.example ]]; then
    cp .env.example .env
    echo "Arquivo .env criado a partir de .env.example"
  else
    echo "Erro: .env nao encontrado em $REPO_DIR" >&2
    exit 1
  fi
fi

echo "Atualizando repositorio (branch: $BRANCH)..."
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

echo "Reconstruindo e reiniciando containers..."
docker compose up -d --build --remove-orphans

echo "Deploy concluido."
