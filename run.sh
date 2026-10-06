#!/usr/bin/env bash
# Arranca o backend (Rails) e a app (Expo) em desenvolvimento.
#
# Uso:
#   ./run.sh            backend + Metro para o Expo Go (lê o QR code com a app Expo Go)
#   ./run.sh dev        backend + Metro para uma development build já instalada
#   ./run.sh android    backend + compila e instala a app no Android (emulador/dispositivo)
#   ./run.sh ios        backend + compila e instala a app no iOS (requer macOS)
#   ./run.sh backend    só o backend
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="${1:-start}"
API_PORT="${API_PORT:-3000}"

log() { printf '\033[1;34m[run]\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m[run]\033[0m %s\n' "$*" >&2; exit 1; }

case "$TARGET" in
  start | dev | android | ios | backend) ;;
  *) die "Opção desconhecida: $TARGET (usa: start | dev | android | ios | backend)" ;;
esac

command -v bundle >/dev/null || die "Ruby/Bundler não encontrado."
pg_isready -q || die "PostgreSQL não está a correr (experimenta: sudo systemctl start postgresql)."

# --- Backend -----------------------------------------------------------------
cd "$ROOT/backend"
bundle check >/dev/null 2>&1 || { log "A instalar gems…"; bundle install; }
log "A preparar a base de dados…"
bin/rails db:prepare db:seed

rm -f tmp/pids/server.pid
if [[ "$TARGET" == "backend" ]]; then
  log "Backend em http://0.0.0.0:$API_PORT"
  exec bin/rails server -b 0.0.0.0 -p "$API_PORT"
fi

log "A arrancar o backend em http://0.0.0.0:$API_PORT (log: backend/log/development.log)"
bin/rails server -b 0.0.0.0 -p "$API_PORT" >/dev/null 2>&1 &
RAILS_PID=$!
trap 'log "A parar o backend…"; kill "$RAILS_PID" 2>/dev/null || true' EXIT INT TERM

for _ in {1..30}; do
  curl -fs "http://localhost:$API_PORT/up" >/dev/null 2>&1 && break
  kill -0 "$RAILS_PID" 2>/dev/null || die "O backend falhou a arrancar (vê backend/log/development.log)."
  sleep 1
done

# --- Mobile ------------------------------------------------------------------
cd "$ROOT/mobile"
[[ -d node_modules ]] || { log "A instalar dependências npm…"; npm install; }

case "$TARGET" in
  start)   log "A arrancar o Metro para o Expo Go…"; npx expo start --go ;;
  dev)     log "A arrancar o Metro (abre a development build no telemóvel)…"; npx expo start --dev-client ;;
  android) log "A compilar e instalar no Android…"; npx expo run:android ;;
  ios)     log "A compilar e instalar no iOS…"; npx expo run:ios ;;
esac
