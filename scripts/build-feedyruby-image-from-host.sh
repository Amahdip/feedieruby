#!/usr/bin/env bash
# Build FeedyRuby on the host (avoids Docker OOM during Next.js compile), then package runtime image.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCAL_IMAGE_TAG="${LOCAL_IMAGE_TAG:-feedyruby-app:latest}"
DOCKERHUB_REPO="${DOCKERHUB_REPO:-amirmpa/feedyruby}"
DOCKERHUB_TAG="${DOCKERHUB_TAG:-latest}"
IMAGE_TAG="${IMAGE_TAG:-${LOCAL_IMAGE_TAG}}"
PLATFORM="${PLATFORM:-linux/amd64}"
PUSH_TO_DOCKERHUB="${PUSH_TO_DOCKERHUB:-false}"

log() { echo "[build-feedyruby] $*"; }

cd "${ROOT}"

export NODE_OPTIONS="${NODE_OPTIONS:---max_old_space_size=8192}"
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@postgres:5432/feedyruby?schema=public}"
export ENCRYPTION_KEY="${ENCRYPTION_KEY:-0123456789abcdef0123456789abcdef}"
export REDIS_URL="${REDIS_URL:-redis://redis:6379}"
export HUB_API_URL="${HUB_API_URL:-http://hub:8080}"
export HUB_API_KEY="${HUB_API_KEY:-build-time-placeholder}"
# Public origin — baked into statically-generated robots.txt/sitemap.xml at build
# time. Without this they fall back to http://localhost:3000 and break indexing.
export WEBAPP_URL="${WEBAPP_URL:-https://feedyruby.ir}"
export PUBLIC_URL="${PUBLIC_URL:-https://feedyruby.ir}"

touch apps/web/.env

export NEXT_PUBLIC_SURVEYS_BUNDLE_VERSION="${NEXT_PUBLIC_SURVEYS_BUNDLE_VERSION:-$(git rev-parse --short HEAD)}"
log "Surveys bundle cache-bust version: ${NEXT_PUBLIC_SURVEYS_BUNDLE_VERSION}"

log "Building @feedyruby/database..."
pnpm build --filter=@feedyruby/database

log "Building @feedyruby/web (this may take several minutes)..."
pnpm build --filter=@feedyruby/web...

if [[ ! -d apps/web/.next/standalone ]]; then
  echo "ERROR: apps/web/.next/standalone missing — web build failed" >&2
  exit 1
fi

log "Packaging runtime Docker image (${IMAGE_TAG}, ${PLATFORM})..."
DOCKERIGNORE_BACKUP=""
if [[ -f .dockerignore ]]; then
  DOCKERIGNORE_BACKUP="$(mktemp)"
  cp .dockerignore "${DOCKERIGNORE_BACKUP}"
fi
cp .dockerignore.prebuilt .dockerignore
trap 'if [[ -n "${DOCKERIGNORE_BACKUP}" && -f "${DOCKERIGNORE_BACKUP}" ]]; then cp "${DOCKERIGNORE_BACKUP}" .dockerignore; rm -f "${DOCKERIGNORE_BACKUP}"; fi' EXIT

docker buildx build \
  --platform "${PLATFORM}" \
  -f apps/web/Dockerfile.prebuilt \
  -t "${IMAGE_TAG}" \
  --load \
  .

log "Done: ${IMAGE_TAG}"
docker images "${IMAGE_TAG%%:*}" --format 'table {{.Repository}}\t{{.Tag}}\t{{.Size}}'

if [[ "${PUSH_TO_DOCKERHUB}" == "true" ]]; then
  LOCAL_IMAGE="${IMAGE_TAG}" DOCKERHUB_REPO="${DOCKERHUB_REPO}" DOCKERHUB_TAG="${DOCKERHUB_TAG}" \
    "${ROOT}/scripts/push-feedyruby-image-dockerhub.sh"
fi
