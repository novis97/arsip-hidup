# BUILD_PLAN — urutan eksekusi per tiket

Tujuan berkas ini: mencegah sesi coding yang melebar dan mengarang.
Aturannya sederhana — **satu tiket, satu sesi, satu commit, satu perintah verifikasi.**

Setiap tiket menyebut **Konteks** (berkas yang boleh dimuat — bukan lebih), **Selesai bila**, dan **Verifikasi**.
Muat `AGENTS.md` di setiap sesi. Jangan pernah memuat seluruh `docs/` sekaligus.

Estimasi memakai satuan **sesi** (± 1–3 jam kerja terfokus), bukan hari, karena kecepatan sangat bergantung alat.

---

## Fase 0 — Fondasi (5 tiket)
Tidak ada fitur di fase ini. Tujuannya membuat lantai yang keras: dependensi ter-resolve, tipe tersedia untuk dibaca agent, CI hijau. Melewati fase ini adalah penyebab paling umum sesi coding berikutnya jadi kacau.

### T0.1 — Resolve dependensi & kunci versi
- **Konteks:** `package.json`, `apps/*/package.json`
- **Kerjakan:** `pnpm install`. Perbaiki versi yang tidak ter-resolve. Hasilkan `pnpm-lock.yaml`.
- **Selesai bila:** `pnpm install` bersih, lockfile ada, `node_modules` terisi.
- **Verifikasi:** `pnpm install --frozen-lockfile`
- **Catatan:** ini prasyarat anti-halusinasi. Setelah ini agent bisa **membaca** tipe Payload/Astro alih-alih menebaknya.
- **Bukti bahwa ini nyata:** versi di scaffold awal ditulis dari ingatan dan **tiga di antaranya salah mayor** — Astro `^5` padahal terkini `7.2.4`, Next `^15` padahal `16.3.1`, Vitest `^2` padahal `4.1.11`. Sudah dikoreksi terhadap registry npm pada 20 Agustus 2026. Kalau penulis blueprint bisa salah menebak versi, agent coding pasti bisa. Verifikasi, jangan percaya.
- **Peer dependency yang mengikat:** `@payloadcms/next@3.88.0` mensyaratkan `next >=16.2.6 <17` (atau jalur 15.x tertentu) dan `payload` **persis** `3.88.0`. Paket `@payloadcms/*` wajib di-pin sama persis, bukan caret. Jangan naikkan salah satu saja.
- **± 1 sesi**

### T0.2 — Boilerplate Next.js untuk Payload 3
- **Konteks:** `apps/cms/payload.config.ts`, `docs/ARCHITECTURE.md` §2–3
- **Kerjakan:** jalankan `npx create-payload-app@latest` di direktori kosong terpisah; pindahkan `src/app/(payload)/**`, `next.config.mjs`, `tsconfig.json` ke `apps/cms`. Jangan timpa `payload.config.ts` dan `src/collections/*` yang sudah ada.
- **Selesai bila:** `pnpm dev:cms` menyala dan `/admin` memuat halaman login.
- **Verifikasi:** buka `http://localhost:3000/admin`
- **± 1 sesi**

### T0.3 — Migrasi & seed berjalan
- **Konteks:** `apps/cms/src/collections/*`, `apps/cms/src/seed/index.ts`, `docs/SCHEMA.md`
- **Selesai bila:** `pnpm --filter @ahi/cms migrate` lalu `pnpm seed` sukses; 1 koleksi + 1 narasumber + 1 arsip terbit muncul di `/admin`.
- **Verifikasi:** `pnpm seed && curl -s localhost:3000/api/archive-items | jq '.totalDocs'` → `1`
- **Jebakan:** kalau seed gagal karena validasi, **perbaiki datanya, jangan validasinya** (AGENTS §3.5).
- **± 1 sesi**

### T0.4 — CI hijau
- **Konteks:** `.github/workflows/ci.yml`, `playwright.config.ts`
- **Selesai bila:** semua job lolos di PR percobaan. Job `facade` boleh di-skip sementara sampai T1.4, dengan komentar `TODO(T1.4)` yang eksplisit.
- **Verifikasi:** PR percobaan hijau di GitHub Actions
- **± 1 sesi**

### T0.5 — Uji abandon (gerbang keluar Fase 0)
- **Konteks:** `docs/ARCHITECTURE.md` §2.1 & §2.4
- **Kerjakan:** build statis, sajikan `apps/web/dist` sebagai file statis, **matikan CMS**, telusuri seluruh halaman.
- **Selesai bila:** tidak ada halaman yang rusak atau kosong saat CMS mati.
- **Verifikasi:** `pnpm build && (cd apps/web/dist && python3 -m http.server 8080)` — lalu klik semua tautan
- **Kenapa sekarang:** kalau ada kebocoran ketergantungan runtime ke VPS, murah diperbaiki hari ini dan mahal ditemukan tiga tahun lagi.
- **± 1 sesi**

---

## Fase 1 — Jalur arsip publik (6 tiket)
Satu halaman arsip yang benar-benar benar, dari ujung ke ujung. Jangan menambah halaman lain sebelum fase ini tuntas.

| Tiket | Isi | Konteks | Verifikasi | Sesi |
|---|---|---|---|---|
| T1.1 | Lengkapi field `Collections`, `Transcripts`, `Assets` sesuai skema | `docs/SCHEMA.md` §1,3,4 | `pnpm typecheck` + terlihat di `/admin` | 1 |
| T1.2 | API key build + `lib/payload.ts` mengambil data nyata | `apps/web/src/lib/payload.ts` | `pnpm build` menghasilkan 1 halaman arsip | 1 |
| T1.3 | Halaman arsip: Kartu Register, deskripsi, transkrip di HTML awal | `docs/DESIGN.md` §3–4, `docs/GEO.md` §1–2 | `curl … \| grep "Transkrip lengkap"` | 1–2 |
| **T1.4** | **Pemutar façade lolos gate** | `docs/VIDEO_EMBED.md` §2,4 | `pnpm test:facade` (5 uji hijau) | 1–2 |
| T1.5 | `VideoObject` + `ArchiveComponent` schema | `docs/VIDEO_EMBED.md` §7, `docs/SEO.md` §5 | Rich Results Test lolos | 1 |
| T1.6 | Beranda + Lighthouse ≥ 90 empat kategori | `docs/DESIGN.md` §4.1, `docs/PRD.md` §6 | `lighthouse --preset=desktop` | 1–2 |

**T1.4 adalah tiket paling berisiko di seluruh proyek** — menyentuh pihak ketiga, ToS, CSP, privasi, aksesibilitas, dan performa sekaligus. Kerjakan dengan `docs/VIDEO_EMBED.md` terbuka, bukan dari ingatan.

---

## Fase 2 — Penemuan (6 tiket)

| Tiket | Isi | Konteks | Verifikasi |
|---|---|---|---|
| T2.1 | Lengkapi stub: `Themes`, `Locations`, `Stories` | `docs/SCHEMA.md` §7,9,10 | `pnpm typecheck` |
| T2.2 | Halaman tema & wilayah sebagai konten (intro 150–300 kata) | `docs/SEO.md` §6 | halaman ter-build, ada teks unik |
| T2.3 | `/jelajah` + **kebijakan indeks facet** | `docs/SEO.md` §6 | kombinasi 2+ facet ber-`noindex` |
| T2.4 | Pencarian Pagefind | `docs/SCHEMA.md` §17 | cari kata dari transkrip → ketemu |
| T2.5 | Peta sebaran + **fallback daftar HTML** | `docs/ARCHITECTURE.md` §3 | matikan JS, daftar lokasi tetap terbaca |
| T2.6 | Direktori + `contactVisibility` | `docs/SCHEMA.md` §8 | entri `hidden` tidak memunculkan nomor HP di HTML |

**Jebakan T2.3:** enam facet × sepuluh nilai = lebih dari sejuta URL. Tanpa kebijakan indeks, crawl budget habis di sana dan halaman arsip Anda tidak terindeks.

---

## Fase 3 — Akses & tata kelola (6 tiket)

| Tiket | Isi | Konteks | Verifikasi |
|---|---|---|---|
| T3.1 | MFA TOTP: enrolment + verifikasi | `docs/SECURITY.md` §4 | admin tanpa MFA ditolak login |
| T3.2 | `AccessRequests` lengkap + notifikasi email | `docs/SCHEMA.md` §13, `docs/PRD.md` §5.2 | alur draft→submitted→approved jalan |
| T3.3 | Halaman peneliti + pemutar HLS di aplikasi Payload | `docs/VIDEO_EMBED.md` §5.4 | video terbatas main setelah grant |
| T3.4 | Refresh sesi detik ke-240 + overlay watermark | `docs/VIDEO_EMBED.md` §5.1–5.3 | video 60 menit tidak putus di menit ke-6 |
| T3.5 | Alur penarikan izin narasumber | `docs/RULES.md` E-3 | centang `withdrawalRequested` → hilang dari publik & tertolak di API |
| T3.6 | Endpoint `/api/audit` + retensi terjadwal | `docs/SECURITY.md` §7 | tidak ada IP mentah tersimpan |

**T3.5 adalah uji integritas terpenting di proyek ini.** Kalau penarikan izin tidak benar-benar bekerja end-to-end, seluruh janji etis situs ini kosong.

---

## Fase 4 — SEO, GEO, pengerasan (5 tiket)
T4.1 sitemap per tipe · T4.2 schema lengkap semua tipe halaman · T4.3 CSP dari Report-Only ke penegakan · T4.4 audit aksesibilitas + perbaikan · T4.5 uji restore backup pertama dari nol.

**T4.5 bukan formalitas.** Backup yang belum pernah direstorasi berstatus asumsi, bukan backup. Ini pelajaran termahal dari British Library.

---

## Fase 5 — Konten & peluncuran (4 tiket)
T5.1 isi 12 arsip + 5 cerita + 20 direktori (**kerja PIHAK PERTAMA**, mulai paralel sejak Fase 1) · T5.2 pelatihan admin + rekaman · T5.3 uji lintas perangkat termasuk Android kelas menengah di 4G · T5.4 peluncuran lunak.

---

## Yang membuat sesi coding gagal, dan penangkalnya

| Penyebab | Penangkal di rencana ini |
|---|---|
| Memuat seluruh dokumen sekaligus | Setiap tiket menyebut konteksnya; maksimal 2–3 dokumen |
| Agent menebak API Payload/Astro | T0.1 didahulukan agar tipe bisa dibaca, bukan ditebak |
| "Sekalian kerjakan yang lain" | Satu tiket satu commit; scope tertulis |
| Uji dinonaktifkan agar hijau | Larangan eksplisit di `AGENTS.md` §6 |
| Aturan privasi "disederhanakan" agar jalan | Zona tanpa vibe di `AGENTS.md` §2 |
| Dokumen dan kode menyimpang | Setiap tiket melaporkan dokumen yang perlu diperbarui |
| Zip lama tercampur zip baru | Satu sumber kebenaran: repo Git, bukan folder unduhan |

## Langkah pertama, hari ini
1. Hapus semua zip lama. Ekstrak **hanya** yang terbaru.
2. `git init && git add -A && git commit -m "chore: scaffold awal"` lalu push ke `github.com/novis97/arsip-hidup` (privat).
3. Mulai T0.1. Jangan buka tiket lain.
