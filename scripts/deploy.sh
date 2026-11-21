#!/usr/bin/env bash
# Deploy de virus-frontend (Angular) → TrueNAS (red local)
#
# Uso:
#   pnpm run deploy         # build + sync a TrueNAS
#   pnpm run deploy:dry     # dry-run: muestra lo que se transferiría, sin tocar nada
#   NO_BUILD=1 pnpm run deploy   # sync sin reconstruir (dist/ ya existe)
#   NO_DELETE=1 pnpm run deploy  # no borrar archivos obsoletos del destino
#
# Config (una sola vez): copia .deployrc.example a .deployrc y rellena:
#   DEPLOY_HOST  IP u hostname de TrueNAS en la LAN (ej. 192.168.x.x)
#   DEPLOY_USER  usuario SSH con escritura en la ruta destino
#   DEPLOY_PATH  (opcional, por defecto /mnt/data-nas/www/virus/frontend/browser —
#                el contenedor Docker `virus-frontend` (nginx:1.27-alpine, puerto
#                22010) monta ESO, no .../www/virus/frontend; --delete queda
#                acotado a esa subcarpeta)

set -euo pipefail
cd "$(dirname "$0")/.."

# --- config ----------------------------------------------------------------
if [[ -f .deployrc ]]; then
  # shellcheck disable=SC1091
  source .deployrc
fi

DEPLOY_HOST="${DEPLOY_HOST:-}"
DEPLOY_USER="${DEPLOY_USER:-$USER}"
DEPLOY_PATH="${DEPLOY_PATH:-/mnt/data-nas/www/virus/frontend/browser}"

if [[ -z "$DEPLOY_HOST" ]]; then
  echo "error: DEPLOY_HOST no definido." >&2
  echo "  cp .deployrc.example .deployrc  # y rellena host/usuario" >&2
  exit 1
fi

DRY_RUN="${DRY_RUN:-0}"
NO_DELETE="${NO_DELETE:-0}"
NO_BUILD="${NO_BUILD:-0}"

SRC="dist/frontend/browser"

# --- build -----------------------------------------------------------------
if [[ "$NO_BUILD" == "1" ]]; then
  echo "→ omitiendo build (NO_BUILD=1)"
else
  echo "→ pnpm run build"
  pnpm run build
fi

if [[ ! -d "$SRC" ]]; then
  echo "error: $SRC no existe. Ejecuta pnpm run build primero." >&2
  exit 1
fi

# --- conectividad SSH (fail fast con mensaje útil) --------------------------
if ! ssh -o BatchMode=yes -o ConnectTimeout=5 -o StrictHostKeyChecking=accept-new \
      "${DEPLOY_USER}@${DEPLOY_HOST}" true 2>/dev/null; then
  echo "error: no hay acceso SSH sin contraseña a ${DEPLOY_USER}@${DEPLOY_HOST}." >&2
  echo "  Una sola vez:  ssh-copy-id ${DEPLOY_USER}@${DEPLOY_HOST}" >&2
  exit 1
fi

# --- rsync -----------------------------------------------------------------
RSYNC=(rsync -az --stats --mkpath)
[[ "$DRY_RUN" == "1" ]] && RSYNC+=(--dry-run)
[[ "$NO_DELETE" != "1" ]] && RSYNC+=(--delete)

DEST="${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"
echo "→ rsync $SRC/ → ${DEST}"
"${RSYNC[@]}" "$SRC"/ "$DEST"

if [[ "$DRY_RUN" == "1" ]]; then
  echo "✓ dry-run completo (no se transfirió nada)"
else
  echo "✓ deploy completado"
fi
