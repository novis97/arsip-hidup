#!/usr/bin/env bash
# DEVOPS §6 — PELESTARIAN, berbeda dari backup.
#
# File .db butuh perangkat lunak untuk dibaca. JSON dan Markdown bisa dibaca
# manusia sepuluh tahun lagi tanpa apa pun. Untuk arsip yang mungkin ditinggalkan,
# inilah salinan yang sesungguhnya penting.
set -euo pipefail

API=${PAYLOAD_PUBLIC_SERVER_URL:-http://localhost:3000}
OUT=${EXPORT_DIR:-./content-export}
KEY=${PAYLOAD_BUILD_KEY:?PAYLOAD_BUILD_KEY wajib diisi}
mkdir -p "$OUT"

for c in collections archive-items narasumber transcripts stories themes locations \
         batik-businesses timeline-events color-map-entries; do
  curl -sf -H "Authorization: users API-Key $KEY" \
    "$API/api/$c?limit=1000&depth=1" | jq '.docs' > "$OUT/$c.json"
  echo "  $c -> $OUT/$c.json"
done

# Transkrip juga diekspor sebagai Markdown per item — bentuk paling tahan waktu.
jq -r '.[] | @base64' "$OUT/transcripts.json" | while read -r row; do
  d=$(echo "$row" | base64 -d)
  slug=$(echo "$d" | jq -r '.archiveItem.slug // .id')
  { echo "---"; echo "$d" | jq -r '{id, language, format, isVerified}'; echo "---"; echo;
    echo "$d" | jq -r '.body'; } > "$OUT/transkrip-$slug.md"
done

echo "Ekspor selesai. Commit hasilnya ke repo privat (DEVOPS §6)."
