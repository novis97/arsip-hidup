#!/usr/bin/env bash
# SECURITY §7 — rotasi salt harian agar hash pelaku tidak dapat dikorelasikan lintas hari.
# Pasang di cron: 15 0 * * *  /app/infra/scripts/rotate-salt.sh
set -euo pipefail
NEW=$(openssl rand -hex 32)
sed -i "s/^AUDIT_HASH_SALT=.*/AUDIT_HASH_SALT=$NEW/" "${ENV_FILE:-/app/.env}"
docker compose restart cms
