# CHANGELOG — Blueprint Arsip Hidup Indonesia

## v0.3 — 20 Agustus 2026
**Keputusan: stack final ditetapkan (G-2 ditutup).**

Payload 3 + **SQLite** sebagai CMS headless di satu VPS kecil · front-end **Astro statis** di Cloudflare Pages · object storage **Cloudflare R2**. Login admin: email + password + MFA.

Konteks keputusan: PIHAK KEDUA menyampaikan bahwa pendanaan berasal dari bantuan dinas untuk satu tahun dan kelanjutannya belum pasti. Kriteria pemilihan karena itu bergeser dari "paling lengkap" menjadi "paling selamat kalau ditinggalkan".

- **MySQL tidak dipakai** — Payload resmi hanya mendukung MongoDB, Postgres, dan SQLite. Dan pengganjal shared hosting bukan database, melainkan kebutuhan proses Node.
- **CMS berbasis Git dibatalkan** — login butuh akun GitHub; jalur email-password lamanya (Netlify Identity/Git Gateway) sudah tidak tersedia untuk situs baru.
- **Postgres diganti SQLite** — satu layanan lebih sedikit, backup = menyalin satu file.
- **MinIO diganti Cloudflare R2** — tanpa egress fee, terpisah dari server aplikasi, mengurangi beban backup VPS.
- **Situs publik dipisah dari VPS** — kalau VPS berhenti dibayar, build statis terakhir tetap dilayani tanpa batas waktu. Prosedurnya di ARCHITECTURE §2.4.

File yang berubah:
- `ARCHITECTURE.md` §2 ditulis ulang (arsitektur terpilih, konsekuensi, alternatif yang ditolak, jalan keluar kalau VPS mati); §3 dan §8 disesuaikan.
- `SCHEMA.md` header + tabel pemetaan tipe Postgres→SQLite; §17 diganti (FTS5 + Pagefind dua lapis); catatan file `.db` tidak di-commit.
- `DEVOPS.md` §0 biaya (turun ke ± Rp 180–600 rb/bln), §5 infrastruktur, §6 backup SQLite + ekspor JSON/Markdown, runbook.
- `PRD.md` §5.6 pencarian; catatan B-2 diperbarui — stack terpilih justru memenuhi PKS Pasal 2.6 & 2.7.
- `ROADMAP.md` G-2 ditutup; uji abandon jadi gerbang keluar Fase 0.
- Seluruh rujukan `MinIO` → `R2` di 6 file lain.

**Masih terbuka:** B-3 (paywall materi arsip), G-3 (Addendum I — harus selesai sebelum VPS dibeli), G-4, G-5 (kebijakan crawler pelatihan AI), G-6 (siapa mengoreksi transkrip — harus selesai sebelum Fase 5), G-7 (kepemilikan akun).

## v0.2 — 20 Agustus 2026
**Keputusan: domain kanonik `arsiphidup.id` (final).**
- `PRD.md` B-1 diubah dari BLOCKER menjadi SELESAI; ditambahkan daftar subdomain resmi dan aturan kepemilikan domain atas nama PIHAK PERTAMA.
- `ROADMAP.md` G-1 ditutup. Ditambahkan status persetujuan Tahap 2 dan catatan bahwa G-2 (jalur arsitektur) harus dijawab di hari pertama Fase 0.
- `SEO.md` §12 diubah: tidak ada rencana migrasi domain; skenario `.go.id` diturunkan menjadi catatan kontinjensi.
- Seluruh 11 file dinaikkan ke v0.2.
- Tidak ada perubahan pada URL, CSP, CORS, schema, `robots.txt`, atau `llms.txt` — semuanya sudah memakai `arsiphidup.id` sejak v0.1.

**Masih terbuka:** B-2 (lingkup di luar PKS / Addendum I), B-3 (paywall materi arsip), B-4 (batas klaim anti click-through), B-5 (larangan YouTube untuk tier terbatas), G-2..G-7.

## v0.1 — 20 Agustus 2026
Rilis awal 11 dokumen blueprint.
