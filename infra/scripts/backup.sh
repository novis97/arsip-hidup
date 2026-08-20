#!/usr/bin/env bash
# DEVOPS §6 — backup operasional.
# JANGAN menyalin file .db dengan `cp` saat aplikasi berjalan: hasilnya bisa korup.
# Perintah `.backup` milik SQLite aman dilakukan saat database sedang dipakai.
set -euo pipefail

DB=${DB_PATH:-/data/payload.db}
DEST=${BACKUP_DIR:-/backup}
STAMP=$(date +%F-%H%M)
mkdir -p "$DEST"

sqlite3 "$DB" ".backup '$DEST/payload-$STAMP.db'"
gzip -f "$DEST/payload-$STAMP.db"
echo "OK  $DEST/payload-$STAMP.db.gz"

# Salinan offsite ke penyedia BERBEDA. Kredensial ini sengaja tidak punya hak hapus —
# ransomware yang membajak aplikasi tidak boleh bisa menghapus backup (SECURITY §8).
if [ -n "${OFFSITE_RCLONE_REMOTE:-}" ]; then
  rclone copy "$DEST/payload-$STAMP.db.gz" "$OFFSITE_RCLONE_REMOTE" --immutable
fi

# Retensi 30 hari
find "$DEST" -name 'payload-*.db.gz' -mtime +30 -delete
