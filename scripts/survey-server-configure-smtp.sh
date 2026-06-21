#!/usr/bin/env bash
# Configure SalamRuby on the survey VPS to send mail via mail.salamruby.ir.
# Prerequisite: survey server IP (37.32.10.71) is allowed in Postfix mynetworks on mail-salamruby.
set -euo pipefail

INSTALL_DIR="${INSTALL_DIR:-/home/ubuntu/salamruby}"
MAIL_FROM="${MAIL_FROM:-mail@salamruby.ir}"
MAIL_FROM_NAME="${MAIL_FROM_NAME:-SalamRuby}"
SMTP_HOST="${SMTP_HOST:-mail.salamruby.ir}"
SMTP_PORT="${SMTP_PORT:-587}"

log() { echo "[configure-smtp] $*"; }

cd "${INSTALL_DIR}"

patch_compose() {
  local file="docker-compose.yml"
  cp "${file}" "${file}.bak.$(date +%Y%m%d%H%M%S)"

  sed -i \
    -e "s|# MAIL_FROM:|MAIL_FROM: \"${MAIL_FROM}\"|" \
    -e "s|# MAIL_FROM_NAME:|MAIL_FROM_NAME: \"${MAIL_FROM_NAME}\"|" \
    -e "s|# SMTP_HOST:|SMTP_HOST: \"${SMTP_HOST}\"|" \
    -e "s|# SMTP_PORT:|SMTP_PORT: \"${SMTP_PORT}\"|" \
    -e 's|# SMTP_AUTHENTICATED:|SMTP_AUTHENTICATED: "0"|' \
    -e 's|# SMTP_SECURE_ENABLED:|SMTP_SECURE_ENABLED: "0"|' \
    -e 's|PASSWORD_RESET_DISABLED: 1|PASSWORD_RESET_DISABLED: 0|' \
    "${file}"
}

log "Patching docker-compose.yml with SMTP settings..."
patch_compose

log "Recreating salamruby container..."
sudo docker compose up -d salamruby

log "Done. Password reset emails should work at https://survey.salamruby.ir/auth/forgot-password"
