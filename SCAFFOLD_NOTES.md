# Catatan Scaffold — apa yang nyata, apa yang stub

Dibuat 20 Agustus 2026; status diperbarui 21 Agustus 2026. Dokumen ini sengaja jujur agar tidak ada yang mengira keberadaan scaffold sama dengan kesiapan produksi.

## Fondasi yang sekarang tersedia

| Berkas | Status |
|---|---|
| `pnpm-lock.yaml` | **Ada.** Dihasilkan pada T0.1 (`2e7a5ab`). |
| `apps/cms/src/app/(payload)/**`, konfigurasi Next.js, dan tipe Payload | **Ada.** Dipasang pada T0.2 (`3a9a281`); `/admin` masih harus diverifikasi sebelum tiket ditutup. |

## Sudah lengkap dan siap dipakai
| Berkas | Status |
|---|---|
| `apps/web/src/components/player/*` | **Lengkap.** Façade, sandbox, kontrol kustom, fallback, audit. Komponen paling berisiko di proyek ini, dikerjakan lebih dulu sesuai ROADMAP Fase 1 |
| `infra/caddy/Caddyfile` | **Lengkap.** CSP sudah mencakup `www.youtube.com` di `script-src` — tanpa ini pemutar mati |
| `apps/cms/src/collections/ArchiveItems.ts` | **Lengkap.** Validasi `youtubeId`, larangan restricted+YouTube, gerbang consent |
| `apps/cms/src/collections/Users.ts` | **Lengkap.** MFA ditolak-jika-tidak-aktif, bukan diimbau |
| `apps/cms/src/collections/AuditLogs.ts` | **Lengkap.** Append-only, hash ber-salt, dua kelas retensi |
| `tests/facade.spec.ts` | **Lengkap.** 5 uji yang memblokir merge |
| `.github/workflows/ci.yml` | **Lengkap.** Gate façade, headers, a11y, budget, secret scan |
| `apps/cms/src/endpoints/mediaPlayback.ts` | **Lengkap.** 4 endpoint: playback, manifest, segment, download. Pola sesi + redirect (VIDEO_EMBED §5) |
| `apps/cms/src/lib/{r2,playbackToken,authorizeAsset,hls,rateLimit}.ts` | **Lengkap.** 12 uji unit lolos |
| `infra/scripts/*.sh` | **Lengkap.** Backup SQLite aman-saat-berjalan, ekspor pelestarian, rotasi salt |
| `public/robots.txt`, `public/llms.txt` | **Lengkap.** Kebijakan crawler pelatihan AI diblokir secara sadar |

## Stub yang perlu dilengkapi
| Berkas | Kapan | Catatan |
|---|---|---|
| `Stories`, `BatikBusinesses`, `Themes`, `Locations`, `TimelineEvents`, `ColorMapEntries`, `AccessRequests` | Fase 2–3 | Hanya `title` + `slug`. Field lengkap ada di `docs/SCHEMA.md` |
| Halaman pemutar terbatas di aplikasi Payload (`/arsip/…`) | Fase 3 | Endpoint-nya sudah siap; UI hls.js + overlay watermark + logika refresh sesi belum dibuat |
| Halaman `/jelajah`, `/direktori`, `/peta-warna`, `/linimasa`, `/tentang/*` | Fase 2–3 | |

## Yang harus diselesaikan berikutnya
1. **T0.2 — verifikasi runtime.** Jalankan CMS dengan rahasia lokal yang valid dan buktikan `/admin` memuat halaman login.
2. **G-3 — Addendum I.** Selesaikan sebelum VPS dibeli. Biaya berjalan tiap bulan; menagih belakangan menempatkan Anda pada posisi lemah.
3. **G-6 — siapa mengoreksi transkrip.** Perkiraan realistis 3–5× durasi rekaman untuk bahasa campuran Indonesia–Jawa. Tanpa ini, aset SEO/GEO terbesar situs tidak pernah ada.
4. **G-7 — kepemilikan akun.** Domain, VPS, Cloudflare, R2, YouTube atas nama PIHAK PERTAMA.
5. **Uji abandon** (gerbang keluar Fase 0): matikan VPS, pastikan seluruh halaman publik tetap tersaji.

## Deviasi dari blueprint
`packages/ui` tidak dibuat; komponen pemutar berada di `apps/web/src/components/player/`. Alasan: impor lintas-workspace ke berkas `.astro` menambah friksi konfigurasi tanpa manfaat pada satu aplikasi front-end. `DEVOPS.md` telah diselaraskan dengan keputusan ini pada 21 Agustus 2026.
