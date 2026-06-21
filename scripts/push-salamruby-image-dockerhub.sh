#!/usr/bin/env bash
# Tag and push the SalamRuby app image to Docker Hub.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCAL_IMAGE="${LOCAL_IMAGE:-salamruby-app:latest}"
DOCKERHUB_REPO="${DOCKERHUB_REPO:-amirmpa/salamruby-survey}"
DOCKERHUB_TAG="${DOCKERHUB_TAG:-latest}"

log() { echo "[push-dockerhub] $*"; }

cd "${ROOT}"

if ! docker image inspect "${LOCAL_IMAGE}" >/dev/null 2>&1; then
  log "Local image ${LOCAL_IMAGE} not found. Run scripts/build-salamruby-image-from-host.sh first."
  exit 1
fi

TARGET_IMAGE="${DOCKERHUB_REPO}:${DOCKERHUB_TAG}"
log "Tagging ${LOCAL_IMAGE} -> ${TARGET_IMAGE}"
docker tag "${LOCAL_IMAGE}" "${TARGET_IMAGE}"

log "Pushing ${TARGET_IMAGE} to Docker Hub..."
if ! docker push "${TARGET_IMAGE}"; then
  cat >&2 <<EOF

Push failed. Log in as the repo owner with write access:

  docker logout
  docker login -u amirmpa

Use a Docker Hub access token (Account Settings -> Security -> Access Tokens),
not your account password.

Then rerun:

  DOCKERHUB_TAG=latest ./scripts/push-salamruby-image-dockerhub.sh

EOF
  exit 1
fi

log "Done: docker pull ${TARGET_IMAGE}"
docker images "${DOCKERHUB_REPO}" --format 'table {{.Repository}}\t{{.Tag}}\t{{.Size}}'
