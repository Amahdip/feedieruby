#!/usr/bin/env bash
# Bootstrap SalamRuby on survey VPS using Iranian mirrors (Mirava catalog).
set -euo pipefail

DOMAIN="${DOMAIN:-survey.salamruby.ir}"
EMAIL="${EMAIL:-admin@salamruby.ir}"
INSTALL_DIR="${INSTALL_DIR:-/home/ubuntu/salamruby}"
SRC_DIR="${SRC_DIR:-/home/ubuntu/salamruby-src}"

log() { echo "[bootstrap] $*"; }

log "Configuring DNS (Shecan + ISP fallback)..."
sudo mkdir -p /etc/systemd/resolved.conf.d
sudo tee /etc/systemd/resolved.conf.d/99-survey-dns.conf >/dev/null <<'EOF'
[Resolve]
DNS=178.22.122.100 185.51.200.2 217.218.127.127 217.218.155.155
FallbackDNS=8.8.8.8 1.1.1.1
EOF
sudo systemctl restart systemd-resolved

log "Pointing apt to ir.archive.ubuntu.com..."
if [[ -f /etc/apt/sources.list.d/ubuntu.sources ]]; then
  sudo cp /etc/apt/sources.list.d/ubuntu.sources /etc/apt/sources.list.d/ubuntu.sources.bak.$(date +%Y%m%d%H%M%S)
  sudo sed -i \
    -e 's|http://archive.ubuntu.com/ubuntu|http://ir.archive.ubuntu.com/ubuntu|g' \
    -e 's|http://security.ubuntu.com/ubuntu|http://ir.archive.ubuntu.com/ubuntu|g' \
    /etc/apt/sources.list.d/ubuntu.sources
elif [[ -f /etc/apt/sources.list ]]; then
  sudo cp /etc/apt/sources.list /etc/apt/sources.list.bak.$(date +%Y%m%d%H%M%S)
  sudo sed -i \
    -e 's|http://[^ ]*archive.ubuntu.com/ubuntu|http://ir.archive.ubuntu.com/ubuntu|g' \
    -e 's|http://security.ubuntu.com/ubuntu|http://ir.archive.ubuntu.com/ubuntu|g' \
    /etc/apt/sources.list
fi

log "Installing Docker..."
sudo apt-get update -qq
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq docker.io docker-compose-v2 ca-certificates curl openssl

log "Configuring Docker registry mirrors (HamDocker, MobinHost, Focker)..."
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json >/dev/null <<'EOF'
{
  "registry-mirrors": [
    "https://hub.hamdocker.ir",
    "https://docker.mobinhost.com",
    "https://focker.ir"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
sudo systemctl enable docker
sudo systemctl restart docker

log "Preparing install directory at ${INSTALL_DIR}..."
mkdir -p "${INSTALL_DIR}/cube/schema" "${INSTALL_DIR}/saml-connection"
cp -f "${SRC_DIR}/docker-compose.yml" "${INSTALL_DIR}/docker-compose.yml"
cp -f "${SRC_DIR}/cube/cube.js" "${INSTALL_DIR}/cube/cube.js"
cp -f "${SRC_DIR}/cube/schema/FeedbackRecords.js" "${INSTALL_DIR}/cube/schema/FeedbackRecords.js"

# Rewrite images to Iranian registry mirrors where possible.
sed -i \
  -e 's|ghcr\.io/salamruby/salamruby:latest|ghcr.hamdocker.ir/salamruby/salamruby:latest|g' \
  -e 's|ghcr\.io/salamruby/hub|ghcr.hamdocker.ir/salamruby/hub|g' \
  -e 's|image: pgvector/pgvector:pg18|image: hub.hamdocker.ir/pgvector/pgvector:pg18|g' \
  -e 's|image: valkey/valkey@|image: hub.hamdocker.ir/valkey/valkey@|g' \
  "${INSTALL_DIR}/docker-compose.yml"

log "Writing secrets and app URLs..."
NEXTAUTH_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
CRON_SECRET=$(openssl rand -hex 32)
HUB_API_KEY=$(openssl rand -hex 32)

cat > "${INSTALL_DIR}/.env" <<EOF
HUB_API_KEY=${HUB_API_KEY}
EOF
chmod 600 "${INSTALL_DIR}/.env"

sed -i "s|WEBAPP_URL:.*|WEBAPP_URL: \"https://${DOMAIN}\"|" "${INSTALL_DIR}/docker-compose.yml"
sed -i "s|NEXTAUTH_URL:.*|NEXTAUTH_URL: \"https://${DOMAIN}\"|" "${INSTALL_DIR}/docker-compose.yml"
sed -i "/NEXTAUTH_SECRET:$/s/NEXTAUTH_SECRET:.*/NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}/" "${INSTALL_DIR}/docker-compose.yml"
sed -i "/ENCRYPTION_KEY:$/s/ENCRYPTION_KEY:.*/ENCRYPTION_KEY: ${ENCRYPTION_KEY}/" "${INSTALL_DIR}/docker-compose.yml"
sed -i "/CRON_SECRET:$/s/CRON_SECRET:.*/CRON_SECRET: ${CRON_SECRET}/" "${INSTALL_DIR}/docker-compose.yml"

log "Writing Traefik config..."
cat > "${INSTALL_DIR}/traefik.yaml" <<EOF
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
          permanent: true
  websecure:
    address: ":443"
    http:
      tls:
        certResolver: default
providers:
  docker:
    watch: true
    exposedByDefault: false
  file:
    directory: /
certificatesResolvers:
  default:
    acme:
      email: ${EMAIL}
      storage: acme.json
      caServer: "https://acme-v02.api.letsencrypt.org/directory"
      tlsChallenge: {}
EOF

cat > "${INSTALL_DIR}/traefik-dynamic.yaml" <<'EOF'
tls:
  options:
    default:
      minVersion: VersionTLS12
EOF

touch "${INSTALL_DIR}/acme.json"
chmod 600 "${INSTALL_DIR}/acme.json"

log "Patching docker-compose with Traefik + routing labels..."
echo "${DOMAIN}" > /tmp/domain.txt
python3 <<'PY'
from pathlib import Path
import re

install = Path("/home/ubuntu/salamruby")
compose = (install / "docker-compose.yml").read_text()
domain = Path("/tmp/domain.txt").read_text().strip()

labels = (
    "    labels:\n"
    f'      - "traefik.enable=true"\n'
    f'      - "traefik.http.routers.salamruby.rule=Host(`{domain}`)"\n'
    '      - "traefik.http.routers.salamruby.entrypoints=websecure"\n'
    '      - "traefik.http.routers.salamruby.tls=true"\n'
    '      - "traefik.http.routers.salamruby.tls.certresolver=default"\n'
    '      - "traefik.http.services.salamruby.loadbalancer.server.port=3000"\n'
)

if "traefik.enable=true" not in compose:
    compose = re.sub(
        r"(  salamruby:\n    restart: always\n    image: [^\n]+\n    depends_on:\n(?:      [^\n]+\n)+)",
        r"\1" + labels,
        compose,
        count=1,
    )

traefik_service = """
  traefik:
    image: hub.hamdocker.ir/library/traefik:v3.6.4
    restart: always
    container_name: traefik
    depends_on:
      - salamruby
      - hub
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./traefik.yaml:/traefik.yaml
      - ./traefik-dynamic.yaml:/traefik-dynamic.yaml
      - ./acme.json:/acme.json
      - /var/run/docker.sock:/var/run/docker.sock:ro
"""

if "  traefik:" not in compose:
    compose = compose.replace("\nvolumes:\n", traefik_service + "\nvolumes:\n")

(install / "docker-compose.yml").write_text(compose)
PY

log "Pulling images (via mirrors)..."
cd "${INSTALL_DIR}"
sudo docker compose pull

log "Starting stack..."
sudo docker compose up -d

log "Done. Check: cd ${INSTALL_DIR} && sudo docker compose ps"
log "URL: https://${DOMAIN}"
