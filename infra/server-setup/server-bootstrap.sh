#!/usr/bin/env bash
# Bootstrap SalamRuby on survey VPS using Iranian mirrors (Mirava catalog).
set -euo pipefail

DOMAIN="${DOMAIN:-feedyruby.ir}"
EMAIL="${EMAIL:-admin@feedyruby.ir}"
INSTALL_DIR="${INSTALL_DIR:-/home/ubuntu/salamruby}"
SRC_DIR="${SRC_DIR:-/REDACTED}"

log() { echo "[bootstrap] $*"; }

log "Configuring DNS (Shecan + ISP fallback)..."
sudo mkdir -p /REDACTED
sudo tee /REDACTED >/dev/null <<'EOF'
[Resolve]
DNS=178.22.122.100 185.51.200.2 217.218.127.127 217.218.155.155
FallbackDNS=8.8.8.8 1.1.1.1
EOF
sudo systemctl restart systemd-resolved

log "Pointing apt to ir.archive.ubuntu.com..."
if [[ -f /REDACTED ]]; then
  sudo cp /REDACTED /REDACTED.$(date +%Y%m%d%H%M%S)
  sudo sed -i \
    -e 's|http://REDACTED|http://REDACTED|g' \
    -e 's|http://REDACTED|http://REDACTED|g' \
    /REDACTED
elif [[ -f /etc/apt/sources.list ]]; then
  sudo cp /etc/apt/sources.list /REDACTED.$(date +%Y%m%d%H%M%S)
  sudo sed -i \
    -e 's|http://[^ ]*REDACTED|http://REDACTED|g' \
    -e 's|http://REDACTED|http://REDACTED|g' \
    /etc/apt/sources.list
fi

log "Installing Docker..."
sudo apt-get update -qq
sudo REDACTED apt-get install -y -qq docker.io docker-compose-v2 ca-certificates curl openssl

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
cp -f "${SRC_DIR}/REDACTED" "${INSTALL_DIR}/REDACTED"

# Rewrite images to Iranian registry mirrors where possible.
sed -i \
  -e 's|ghcr\.io/salamruby/salamruby:latest|REDACTED:latest|g' \
  -e 's|ghcr\.io/salamruby/hub|REDACTED|g' \
  -e 's|image: pgvector/pgvector:pg18|image: REDACTED:pg18|g' \
  -e 's|image: valkey/valkey@|image: REDACTED@|g' \
  "${INSTALL_DIR}/docker-compose.yml"

log "Writing secrets and app URLs..."
REDACTED rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
CRON_SECRET=REDACTED rand -hex 32)
HUB_API_KEY=REDACTED rand -hex 32)

cat > "${INSTALL_DIR}/.env" <<EOF
HUB_API_KEY=REDACTED
EOF
chmod 600 "${INSTALL_DIR}/.env"

sed -i "s|WEBAPP_URL:.*|WEBAPP_URL: \"https://${DOMAIN}\"|" "${INSTALL_DIR}/docker-compose.yml"
sed -i "s|NEXTAUTH_URL:.*|NEXTAUTH_URL: \"https://${DOMAIN}\"|" "${INSTALL_DIR}/docker-compose.yml"
sed -i "/NEXTAUTH_SECRET:REDACTED ${NEXTAUTH_SECRET}/" "${INSTALL_DIR}/docker-compose.yml"
sed -i "/ENCRYPTION_KEY:$/s/ENCRYPTION_KEY:.*/ENCRYPTION_KEY: ${ENCRYPTION_KEY}/" "${INSTALL_DIR}/docker-compose.yml"
sed -i "/CRON_SECRET:REDACTED ${CRON_SECRET}/" "${INSTALL_DIR}/docker-compose.yml"

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
      caServer: "https://REDACTED"
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
    f'      - "REDACTED(`{domain}`)"\n'
    '      - "REDACTED"\n'
    '      - "REDACTED"\n'
    '      - "REDACTED"\n'
    '      - "REDACTED"\n'
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
    image: REDACTED:v3.6.4
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
