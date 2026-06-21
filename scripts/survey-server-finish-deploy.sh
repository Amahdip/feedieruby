#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="${INSTALL_DIR:-/home/ubuntu/salamruby}"
DOMAIN="${DOMAIN:-survey.salamruby.ir}"
APP_IMAGE="${APP_IMAGE:-amirmpa/salamruby-survey:latest}"
APP_IMAGE_MIRROR="${APP_IMAGE_MIRROR:-hub.hamdocker.ir/amirmpa/salamruby-survey:latest}"

log() { echo "[finish-deploy] $*"; }

if [[ -f /home/ubuntu/salamruby-fallback-images.tar.gz ]]; then
  log "Loading application images from tarball..."
  gunzip -c /home/ubuntu/salamruby-fallback-images.tar.gz | sudo docker load
fi

log "Pulling SalamRuby app image (${APP_IMAGE})..."
if ! sudo docker pull "${APP_IMAGE}"; then
  log "Docker Hub pull failed; trying HamDocker mirror (${APP_IMAGE_MIRROR})..."
  sudo docker pull "${APP_IMAGE_MIRROR}"
  sudo docker tag "${APP_IMAGE_MIRROR}" "${APP_IMAGE}"
fi

log "Tagging images for compose..."
sudo docker tag "${APP_IMAGE}" salamruby-app:latest
sudo docker tag ghcr.io/formbricks/hub:0.5.0 salamruby-hub:0.5.0 2>/dev/null || \
  sudo docker tag hub.hamdocker.ir/formbricks/hub:0.5.0 salamruby-hub:0.5.0 2>/dev/null || true

log "Patching docker-compose image references..."
cd "${INSTALL_DIR}"
sed -i \
  -e 's|ghcr\.hamdocker\.ir/salamruby/salamruby:latest|'"${APP_IMAGE}"'|g' \
  -e 's|ghcr\.io/salamruby/salamruby:latest|'"${APP_IMAGE}"'|g' \
  -e 's|image: salamruby-app:latest|image: '"${APP_IMAGE}"'|g' \
  -e 's|ghcr\.hamdocker\.ir/salamruby/hub:latest|salamruby-hub:0.5.0|g' \
  -e 's|ghcr\.hamdocker\.ir/salamruby/hub${HUB_IMAGE_REF:-:latest}|salamruby-hub:0.5.0|g' \
  -e 's|ghcr\.io/salamruby/hub${HUB_IMAGE_REF:-:latest}|salamruby-hub:0.5.0|g' \
  -e 's|ghcr\.io/salamruby/hub:latest|salamruby-hub:0.5.0|g' \
  -e 's|hub\.hamdocker\.ir/valkey/valkey@sha256:[a-f0-9]*|hub.hamdocker.ir/valkey/valkey:latest|g' \
  -e 's|valkey/valkey@sha256:[a-f0-9]*|hub.hamdocker.ir/valkey/valkey:latest|g' \
  docker-compose.yml

# Ensure hub image ref is literal in compose
sed -i 's|image: salamruby-hub:${HUB_IMAGE_REF:-:latest}|image: salamruby-hub:0.5.0|g' docker-compose.yml

log "Starting stack..."
sudo docker compose up -d

log "Container status:"
sudo docker compose ps

log "Removing leftover deploy tarballs..."
rm -f /home/ubuntu/salamruby-app-latest.tar.gz /home/ubuntu/salamruby-fallback-images.tar.gz

log "Pruning unused Docker images (keeps running stack)..."
sudo docker image prune -f

log "Done — open https://${DOMAIN} (may take 1-2 min for migrations + SSL)"
