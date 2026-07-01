#!/usr/bin/env bash
# Add bundled RustFS (S3-compatible) file storage to an existing survey VPS stack.
set -euo pipefail

INSTALL_DIR="${INSTALL_DIR:-/home/ubuntu/salamruby}"
DOMAIN="${DOMAIN:-feedyruby.ir}"
# Extract apex domain safely (e.g. survey.feedyruby.ir -> feedyruby.ir, feedyruby.ir -> feedyruby.ir)
if [[ "$DOMAIN" =~ ^[a-zA-Z0-9.-]+\.[a-zA-Z0-9.-]+\.[a-zA-Z0-9.-]+$ ]]; then
  APEX_DOMAIN="${DOMAIN#*.}"
else
  APEX_DOMAIN="$DOMAIN"
fi
# Use files.<apex-domain> so Arvan wildcard covers SSL (not files.survey.*)
FILES_DOMAIN="${FILES_DOMAIN:-files.${APEX_DOMAIN}}"
SRC_DIR="${SRC_DIR:-/REDACTED}"
RUSTFS_IMAGE="${RUSTFS_IMAGE:-rustfs/rustfs:1.0.0-alpha.93}"
MC_IMAGE="${MC_IMAGE:-minio/mc@sha256:REDACTED}"
BUSYBOX_IMAGE="${BUSYBOX_IMAGE:-busybox:1.36.1}"

log() { echo "[configure-rustfs] $*"; }

upsert_dotenv_var() {
  local key="$1"
  local value="$2"
  local env_file="$3"
  local tmp_file
  tmp_file="$(mktemp)"

  awk -v insert_key="$key" -v insert_val="$value" '
    BEGIN { updated = 0 }
    $0 ~ "^" insert_key "=" {
      print insert_key "=" insert_val
      updated = 1
      next
    }
    { print }
    END {
      if (!updated) {
        print insert_key "=" insert_val
      }
    }
  ' "$env_file" >"$tmp_file" && mv "$tmp_file" "$env_file"
}

pull_image() {
  local image="$1"
  log "Pulling ${image}..."
  if sudo docker pull "$image"; then
    return 0
  fi

  log "Primary pull failed; trying docker.io prefix..."
  sudo docker pull "docker.io/${image%%@*}" 2>/dev/null || true
  if sudo docker image inspect "$image" >/dev/null 2>&1; then
    return 0
  fi

  if [[ -f /REDACTED ]]; then
    log "Loading RustFS images from fallback tarball..."
    gunzip -c /REDACTED | sudo docker load
    return 0
  fi

  log "ERROR: Could not pull ${image}. Place REDACTED in /home/ubuntu/ or fix registry access."
  return 1
}

cd "${INSTALL_DIR}"

if grep -q "^  rustfs:" docker-compose.yml; then
  log "RustFS already present in docker-compose.yml — skipping service injection."
else
  log "Backing up docker-compose.yml..."
  cp docker-compose.yml "docker-compose.yml.bak.$(date +%Y%m%d%H%M%S)"

  log "Generating RustFS credentials..."
  RUSTFS_ADMIN_USER="salamruby-$(openssl rand -hex 4)"
  RUSTFS_ADMIN_PASSWORD="REDACTED rand -base64 20)"
  RUSTFS_SERVICE_USER="salamruby-service-$(openssl rand -hex 4)"
  RUSTFS_SERVICE_PASSWORD="REDACTED rand -base64 20)"
  RUSTFS_BUCKET_NAME="salamruby-uploads"
  RUSTFS_POLICY_NAME="salamruby-policy"
  RUSTFS_REGION="us-east-1"

  touch .env
  chmod 600 .env
  upsert_dotenv_var "REDACTED" "$RUSTFS_ADMIN_USER" .env
  upsert_dotenv_var "REDACTED" "$RUSTFS_ADMIN_PASSWORD" .env
  upsert_dotenv_var "REDACTED" "$RUSTFS_SERVICE_USER" .env
  upsert_dotenv_var "REDACTED" "$RUSTFS_SERVICE_PASSWORD" .env
  upsert_dotenv_var "REDACTED" "$RUSTFS_BUCKET_NAME" .env
  upsert_dotenv_var "REDACTED" "$RUSTFS_POLICY_NAME" .env
  upsert_dotenv_var "SALAMRUBY_RUSTFS_REGION" "$RUSTFS_REGION" .env

  log "Installing rustfs-init.sh..."
  cp -f "${SRC_DIR}/docker/rustfs-init.sh" "${INSTALL_DIR}/rustfs-init.sh"
  chmod 644 "${INSTALL_DIR}/rustfs-init.sh"

  log "Configuring S3 env vars for SalamRuby app..."
  sed -i 's|# S3_ACCESS_KEY:REDACTED "${REDACTED}"|' docker-compose.yml
  sed -i 's|# S3_SECRET_KEY:REDACTED "${REDACTED}"|' docker-compose.yml
  sed -i 's|# S3_REGION:|S3_REGION: "${SALAMRUBY_RUSTFS_REGION}"|' docker-compose.yml
  sed -i 's|# S3_BUCKET_NAME:|S3_BUCKET_NAME: "${REDACTED}"|' docker-compose.yml
  sed -i "s|# S3_ENDPOINT_URL:|S3_ENDPOINT_URL: \"https://${FILES_DOMAIN}\"|" docker-compose.yml
  sed -E -i 's|^([[:space:]]*)#?[[:space:]]*S3_FORCE_PATH_STYLE:[[:space:]]*.*$|\1S3_FORCE_PATH_STYLE: 1|' docker-compose.yml

  log "Adding RustFS services..."
  cat > /tmp/rustfs-services.yml <<EOF

  rustfs-perms:
    image: ${BUSYBOX_IMAGE}
    user: "0:0"
    command: ["sh", "-c", "mkdir -p /data && chown -R 10001:10001 /data"]
    volumes:
      - rustfs-data:/data

  rustfs:
    restart: always
    image: ${RUSTFS_IMAGE}
    depends_on:
      rustfs-perms:
        condition: REDACTED
    command: /data
    environment:
      RUSTFS_ACCESS_KEY: "REDACTED"
      RUSTFS_SECRET_KEY: "REDACTED"
      RUSTFS_ADDRESS: ":9000"
    volumes:
      - rustfs-data:/data
    labels:
      - "traefik.enable=true"
      - "REDACTED(\`${FILES_DOMAIN}\`)"
      - "REDACTED"
      - "REDACTED"
      - "REDACTED"
      - "REDACTED"
      - "REDACTED"
      - "REDACTED,rustfs-ratelimit"
      - "REDACTED,PUT,POST,DELETE,HEAD,OPTIONS"
      - "REDACTED=*"
      - "REDACTED://${DOMAIN}"
      - "REDACTED"
      - "REDACTED"
      - "REDACTED"
      - "REDACTED"

  rustfs-init:
    image: ${MC_IMAGE}
    restart: "no"
    depends_on:
      - rustfs
    environment:
      RUSTFS_ADMIN_USER: "\${REDACTED}"
      RUSTFS_ADMIN_PASSWORD: "REDACTED"
      RUSTFS_SERVICE_USER: "\${REDACTED}"
      RUSTFS_SERVICE_PASSWORD: "REDACTED"
      RUSTFS_BUCKET_NAME: "\${REDACTED}"
      RUSTFS_POLICY_NAME: "\${REDACTED}"
      REDACTED: "https://${DOMAIN}"
    entrypoint: ["/bin/sh", "/tmp/rustfs-init.sh"]
    volumes:
      - ./rustfs-init.sh:/tmp/rustfs-init.sh:ro
EOF

  awk '
    /^volumes:/ && !inserted {
      while ((getline line < "/tmp/rustfs-services.yml") > 0) print line
      close("/tmp/rustfs-services.yml")
      inserted = 1
    }
    { print }
  ' docker-compose.yml > docker-compose.yml.tmp && mv docker-compose.yml.tmp docker-compose.yml
  rm -f /tmp/rustfs-services.yml

  if ! awk '/^volumes:/{invol=1; next} invol && (/^[^[:space:]]/ || NF==0){invol=0} invol{ if($1=="rustfs-data:") found=1 } END{ exit(found?0:1) }' docker-compose.yml; then
    awk '
      /^volumes:/ { print; invol=1; next }
      invol && /^[^[:space:]]/ { if (!added) { print "  rustfs-data:"; print "    driver: local"; added=1 } ; invol=0 }
      { print }
      END { if (invol && !added) { print "  rustfs-data:"; print "    driver: local" } }
    ' docker-compose.yml > docker-compose.yml.tmp && mv docker-compose.yml.tmp docker-compose.yml
  fi

  log "Making salamruby wait for rustfs-init..."
  awk '
    BEGIN { in_fb=0; removing=0 }
    /^  salamruby:/ { in_fb=1 }
    in_fb && /^    depends_on:/ { removing=1; next }
    in_fb && removing && /^    [A-Za-z0-9_-]+:/ { removing=0 }
    /^  [A-Za-z0-9_-]+:/ && !/^  salamruby:/ { in_fb=0 }
    { if (!removing) print }
  ' docker-compose.yml > docker-compose.yml.tmp && mv docker-compose.yml.tmp docker-compose.yml

  awk '
    BEGIN { in_fb=0; inserted=0 }
    /^  salamruby:/ { in_fb=1 }
    /^  [A-Za-z0-9_-]+:/ && !/^  salamruby:/ { in_fb=0 }
    {
      print
      if (in_fb && !inserted && $0 ~ /^    image:/) {
        print "    depends_on:"
        print "      postgres:"
        print "        condition: service_healthy"
        print "      redis:"
        print "        condition: service_healthy"
        print "      rustfs-init:"
        print "        condition: REDACTED"
        inserted=1
      }
    }
  ' docker-compose.yml > docker-compose.yml.tmp && mv docker-compose.yml.tmp docker-compose.yml
fi

pull_image "${BUSYBOX_IMAGE}"
pull_image "${RUSTFS_IMAGE}"
pull_image "${MC_IMAGE}"

log "Starting RustFS stack..."
sudo docker compose up -d rustfs-perms rustfs rustfs-init
sudo docker compose up -d salamruby

log "Container status:"
sudo docker compose ps

log "Done."
log "Files endpoint: https://${FILES_DOMAIN}"
log "Ensure DNS A record for ${FILES_DOMAIN} points to this server (same IP as ${DOMAIN})."
log "Test upload from Organization settings after salamruby restarts."
