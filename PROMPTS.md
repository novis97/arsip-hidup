# PROMPTS — prompt siap pakai untuk sesi coding berbantuan AI

Salin apa adanya. Jangan digabung dua tiket dalam satu sesi.
Semua prompt di sini mengasumsikan agent punya akses baca-tulis ke repo.

---

## 0. Aturan pakai

1. **Satu sesi = satu tiket = satu commit.** Kalau sesi mulai melebar, hentikan dan buka sesi baru.
2. **Jangan pernah menempelkan seluruh isi `docs/`.** Prompt di bawah sudah menyebut berkas mana yang boleh dibaca. Membanjiri konteks adalah penyebab utama agent mulai mengarang.
3. **Selalu minta rencana dulu** untuk tiket di zona tanpa vibe. Konfirmasi, baru suruh menulis kode.
4. **Jalankan sendiri perintah verifikasinya** setidaknya sekali. Jangan percaya laporan "sudah saya uji".

---

## 1. Prompt pembuka — sekali di awal setiap sesi

```
Kamu adalah engineer yang mengerjakan repo arsip-hidup.

Sebelum apa pun, baca dua berkas ini dan ringkas dalam maksimal 8 poin:
- AGENTS.md
- BUILD_PLAN.md

Setelah itu BERHENTI dan tunggu instruksi tiket. Jangan menulis kode apa pun,
jangan membuka berkas lain, jangan menyarankan perbaikan.
```

Kalau ringkasannya tidak menyebut "zona tanpa vibe" dan "satu tiket satu sesi", agent tidak benar-benar membacanya. Ulangi.

---

## 2. Template universal

Ganti bagian dalam `{ }`. Semua prompt tiket di bawah adalah hasil isian template ini.

```
TIKET: {kode} — {judul}

Baca HANYA berkas berikut. Jangan membuka berkas lain kecuali untuk menulis kode:
{daftar berkas konteks}

Kerjakan:
{deskripsi pekerjaan}

Selesai bila:
{kriteria yang bisa dicek}

Verifikasi dengan menjalankan:
{perintah}

Batasan:
- Jangan mengerjakan tiket lain, meski terlihat sepele.
- Jangan mengubah berkas di zona tanpa vibe (AGENTS.md §2) tanpa bertanya lebih dulu.
- Kalau macet, katakan "terhambat karena X". Jangan menonaktifkan uji,
  jangan menambah @ts-ignore, jangan mengganti implementasi dengan mock.

Laporkan di akhir:
1. Berkas yang berubah
2. Hasil perintah verifikasi (tempel keluarannya)
3. Apa yang belum selesai
4. Dokumen di docs/ yang perlu diperbarui, kalau ada
```

---

## 3. Fase 0 — Fondasi

### T0.1 — Resolve dependensi
```
TIKET: T0.1 — Resolve dependensi dan hasilkan lockfile

Baca HANYA: package.json, apps/cms/package.json, apps/web/package.json

Kerjakan:
Jalankan `pnpm install`. Perbaiki versi yang tidak ter-resolve dengan mengecek
registry npm (`npm view <paket> version`), bukan dengan menebak.

PENTING: paket @payloadcms/* harus di-pin PERSIS sama (saat ini 3.88.0), bukan caret.
Peer dependency @payloadcms/next mensyaratkan payload persis sama dan next >=16.2.6 <17.
Jangan menaikkan salah satu paket saja.

Selesai bila: pnpm-lock.yaml terbentuk dan node_modules terisi.

Verifikasi dengan menjalankan:
  rm -rf node_modules && pnpm install --frozen-lockfile

Batasan:
- Jangan menurunkan versi mayor apa pun untuk "menghindari error".
- Jangan mengganti paket dengan alternatif yang namanya mirip.
- Jangan menyentuh kode sumber sama sekali di tiket ini.

Laporkan: daftar versi yang kamu ubah beserta alasannya, dan paket apa pun
yang tidak ter-resolve.
```

### T0.2 — Boilerplate Payload 3
```
TIKET: T0.2 — Pasang boilerplate Next.js untuk Payload 3

Baca HANYA: apps/cms/payload.config.ts, docs/ARCHITECTURE.md bagian 2 dan 3

Kerjakan:
1. Jalankan `npx create-payload-app@latest` di direktori sementara di luar repo.
2. Salin ke apps/cms: src/app/(payload)/**, next.config.mjs, tsconfig.json,
   dan berkas boilerplate lain yang dibutuhkan Payload 3.
3. JANGAN menimpa payload.config.ts, src/collections/*, src/lib/*, src/endpoints/*
   yang sudah ada di repo. Itu kode kita, bukan boilerplate.

Selesai bila: `pnpm dev:cms` menyala dan http://localhost:3000/admin
menampilkan halaman login (belum perlu bisa login).

Verifikasi: curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin

Batasan:
- Jangan menulis sendiri isi folder (payload) dari ingatan. Harus hasil generator.
- Kalau generator meminta pilihan database, pilih SQLite.
```

### T0.3 — Migrasi & seed
```
TIKET: T0.3 — Migrasi database dan seed data fiktif

Baca HANYA: apps/cms/src/collections/*, apps/cms/src/seed/index.ts, docs/SCHEMA.md

Kerjakan: jalankan migrasi Payload lalu seed.

Selesai bila: 1 koleksi, 1 narasumber, dan 1 archive-item terbit muncul di /admin.

Verifikasi: pnpm seed && curl -s localhost:3000/api/archive-items | jq '.totalDocs'
Harus mengembalikan 1.

Batasan PENTING:
- Kalau seed gagal karena validasi atau CHECK, PERBAIKI DATA SEED-nya.
  JANGAN melonggarkan validasi. Aturan itu menegakkan kebijakan consent
  dan privasi, bukan sekadar kerapian (AGENTS.md pasal 3 nomor 5).
- Semua data seed wajib berprefiks [SEED] dan fiktif. Dilarang memakai
  nama, foto, atau cerita narasumber asli.
```

### T0.4 — CI hijau
```
TIKET: T0.4 — Buat seluruh job CI lolos

Baca HANYA: .github/workflows/ci.yml, playwright.config.ts

Kerjakan: perbaiki konfigurasi sampai semua job lolos di PR percobaan.
Job "facade" boleh di-skip SEMENTARA sampai T1.4, tapi wajib diberi komentar
TODO(T1.4) yang eksplisit di berkasnya.

Selesai bila: PR percobaan hijau.

Batasan:
- Jangan menghapus job mana pun.
- Jangan melonggarkan gate "headers". Gate itu menjaga CSP tetap memuat
  www.youtube.com di script-src; tanpa itu pemutar video mati total.
```

### T0.5 — Uji abandon
```
TIKET: T0.5 — Uji abandon (gerbang keluar Fase 0)

Baca HANYA: docs/ARCHITECTURE.md bagian 2.1 dan 2.4

Kerjakan:
1. pnpm build
2. Sajikan apps/web/dist sebagai file statis di port 8080
3. MATIKAN CMS sepenuhnya
4. Telusuri setiap halaman yang ter-build

Selesai bila: tidak ada halaman yang rusak, kosong, atau error saat CMS mati.

Verifikasi: pnpm build && (cd apps/web/dist && python3 -m http.server 8080)
lalu laporkan daftar URL yang kamu buka dan hasilnya.

Kenapa ini penting: seluruh arsitektur bertumpu pada situs publik yang tetap
hidup kalau VPS berhenti dibayar. Kalau ada ketergantungan runtime ke VPS,
laporkan sebagai temuan — jangan diam-diam menambal.
```

---

## 4. Fase 1 — Jalur arsip publik

### T1.1
```
TIKET: T1.1 — Lengkapi field Collections, Transcripts, Assets

Baca HANYA: apps/cms/src/collections/{Collections,Transcripts,Assets}.ts,
docs/SCHEMA.md bagian 1, 3, dan 4

Kerjakan: lengkapi field sesuai SCHEMA.md. Pertahankan seluruh validasi
dan komentar yang sudah ada.

Selesai bila: pnpm typecheck lolos dan field baru terlihat di /admin.
Verifikasi: pnpm typecheck

Batasan: jangan menambah field yang berisi data pribadi (NIK, alamat,
nomor telepon, dokumen consent). Kalau SCHEMA.md menyebut field seperti itu,
baca ulang — SCHEMA.md menempatkannya DI LUAR sistem.
```

### T1.2 — sesuaikan ke Astro 7
```
TIKET: T1.2 — Sesuaikan front-end ke Astro 7 dan sambungkan data build-time

Baca HANYA: apps/web/astro.config.mjs, apps/web/src/lib/payload.ts,
apps/web/package.json

Konteks penting: berkas .astro di repo ini ditulis untuk Astro 5, sementara
versi terpasang adalah Astro 7. Sebagian API kemungkinan berubah.

Kerjakan:
1. Baca tipe Astro yang SEBENARNYA ada di node_modules/astro/**/*.d.ts.
   Jangan menebak dari ingatan.
2. Sesuaikan astro.config.mjs dan lib/payload.ts ke API Astro 7.
3. Buat API key read-only di Payload untuk proses build.

Selesai bila: pnpm build sukses dan menghasilkan minimal 1 halaman arsip
dari data seed.
Verifikasi: pnpm build && ls apps/web/dist/koleksi/batik-tulis-pekalongan/

Batasan:
- Jangan menurunkan Astro ke versi 5 untuk "mempermudah".
- Laporkan setiap perbedaan API Astro 5 vs 7 yang kamu temukan, supaya
  bisa dicatat di docs.
```

### T1.3
```
TIKET: T1.3 — Halaman arsip: Kartu Register, deskripsi, transkrip

Baca HANYA: apps/web/src/pages/koleksi/[collection]/[slug].astro,
apps/web/src/components/KartuRegister.astro,
docs/DESIGN.md bagian 3 dan 4, docs/GEO.md bagian 1 dan 2

Kerjakan: selesaikan halaman arsip.

Selesai bila:
- Kartu Register dirender sebagai <dl>, bukan tabel gambar
- Transkrip ada di HTML respons pertama, TIDAK disuntik JavaScript
- Nama narasumber menghormati displayConsent di judul, meta, alt, dan schema

Verifikasi: curl -s http://localhost:4321/koleksi/... | grep "Transkrip lengkap"
Harus ketemu. Kalau hanya ketemu di DevTools tapi tidak di curl, tiket ini GAGAL.

Batasan: jangan membungkus transkrip dalam accordion yang isinya baru dimuat
saat diklik. Crawler AI umumnya tidak menjalankan JavaScript.
```

### T1.4 — ZONA TANPA VIBE, minta rencana dulu
```
TIKET: T1.4 — Pemutar façade lolos gate CI

INI TIKET ZONA TANPA VIBE. Berikan rencana maksimal 5 poin lebih dulu,
lalu BERHENTI dan tunggu persetujuan sebelum menulis kode.

Baca HANYA: apps/web/src/components/player/*, docs/VIDEO_EMBED.md bagian 2 dan 4,
tests/facade.spec.ts

Selesai bila: 5 uji di tests/facade.spec.ts hijau.
Verifikasi: pnpm test:facade

Larangan mutlak — semuanya sudah dibahas di docs/VIDEO_EMBED.md bagian 2,
jangan "menemukan ulang" solusinya:
- Jangan menambah modestbranding (tidak berfungsi sejak 15 Agustus 2023)
- Jangan menambah showinfo (mati sejak 2018)
- Jangan menambah overlay CSS di atas logo atau tombol YouTube (melanggar ToS)
- Jangan hotlink i.ytimg.com untuk thumbnail
- Jangan menambah allow-popups atau allow-top-navigation ke sandbox

Kalau uji fallback gagal, kemungkinan besar masalah ada di timer 5 detik
atau di penanganan onError, bukan di parameter iframe.
```

### T1.5 & T1.6
```
TIKET: T1.5 — Schema VideoObject dan ArchiveComponent
Baca HANYA: apps/web/src/pages/koleksi/[collection]/[slug].astro,
docs/VIDEO_EMBED.md bagian 7, docs/SEO.md bagian 5
Selesai bila: lolos Rich Results Test tanpa error.
Batasan: JANGAN mencantumkan contentUrl untuk aset tier restricted —
itu sama dengan menerbitkan lokasi berkas yang aksesnya sedang dibatasi.
```
```
TIKET: T1.6 — Beranda dan target Core Web Vitals
Baca HANYA: apps/web/src/pages/index.astro, docs/DESIGN.md bagian 4.1,
docs/PRD.md bagian 6
Selesai bila: Lighthouse >= 90 di keempat kategori.
Verifikasi: npx lighthouse http://localhost:4321 --preset=desktop --quiet
Batasan: seluruh angka di beranda harus berasal dari basis data.
Dilarang menuliskan angka statis "supaya terlihat mapan".
```

---

## 5. Fase 2–5

Pakai template di bagian 2, isi dari tabel tiket di `BUILD_PLAN.md`. Empat tiket berikut butuh peringatan tambahan yang ditempelkan ke prompt:

| Tiket | Kalimat tambahan yang wajib ditempel |
|---|---|
| T2.3 `/jelajah` | `Enam facet x sepuluh nilai = lebih dari sejuta URL. Kombinasi 2+ facet WAJIB noindex dengan canonical ke facet tunggal induknya. Tanpa ini crawl budget habis dan halaman arsip tidak terindeks.` |
| T2.6 direktori | `Entri dengan contactVisibility hidden tidak boleh memunculkan nomor telepon di HTML, termasuk di dalam data-attribute atau JSON-LD.` |
| T3.4 refresh sesi | `Video 60 menit tidak boleh putus di menit ke-6. Klien menyegarkan sesi pada refresh_at. Jangan menaikkan TTL di atas 300 detik untuk menyiasatinya.` |
| T3.5 penarikan izin | `INI ZONA TANPA VIBE. Uji end-to-end: centang withdrawalRequested, pastikan item hilang dari situs publik DAN endpoint media mengembalikan 403. Kalau salah satu masih lolos, tiket ini gagal.` |

---

## 6. Prompt pengendali

### Memeriksa hasil kerja agent
```
Tanpa mengubah kode apa pun, periksa pekerjaan di commit terakhir terhadap
AGENTS.md dan berkas dokumen yang relevan.

Jawab dalam format ini:
1. Apakah ada larangan di AGENTS.md pasal 3 yang dilanggar? Sebutkan nomornya.
2. Apakah ada uji yang dinonaktifkan, di-skip, atau ada @ts-ignore baru?
3. Apakah ada berkas di zona tanpa vibe yang tersentuh?
4. Apakah klaim "sudah diverifikasi" didukung keluaran perintah nyata?
5. Apa yang akan gagal di produksi tapi lolos di lokal?

Jujur saja kalau ada masalah. Jangan memuji pekerjaan sendiri.
```

### Kalau agent mulai melenceng
```
Berhenti. Kamu keluar dari lingkup tiket {kode}.

Kembalikan perubahan yang tidak berkaitan dengan tiket ini, lalu tunjukkan
diff yang tersisa. Setelah itu tunggu instruksi.
```

### Kalau agent macet
```
Jangan mencoba jalan pintas. Jawab tiga pertanyaan ini saja:
1. Apa persisnya yang gagal? Tempel pesan error lengkapnya.
2. Apa dua kemungkinan penyebabnya, dan mana yang lebih mungkin?
3. Informasi apa yang kamu butuhkan dari saya untuk memastikannya?

Jangan menonaktifkan uji, jangan menambah @ts-ignore, jangan mengganti
implementasi dengan mock.
```

### Menutup sesi
```
Tutup tiket {kode}.
1. Commit dengan format Conventional Commits, satu commit saja.
2. Sebutkan dokumen di docs/ yang perlu diperbarui karena pekerjaan ini,
   beserta bagian mana. Jangan mengubahnya sendiri.
3. Sebutkan satu hal yang kamu temukan dan tidak ada di BUILD_PLAN.md.
```

---

## 7. Prompt yang jangan dipakai

| Jangan | Kenapa |
|---|---|
| "Buatkan website arsip budaya lengkap" | Ruang lingkupnya tak terbatas; agent akan mengarang struktur sendiri dan mengabaikan blueprint |
| "Baca semua dokumen di docs/ lalu mulai coding" | 1.800 baris konteks membuat agent kehilangan fokus dan mulai mencampur keputusan |
| "Perbaiki semua error" | Mengundang penonaktifan uji dan `@ts-ignore` massal |
| "Lanjutkan dari sebelumnya" | Agent tidak punya memori sesi; ia akan menebak konteks |
| "Sekalian rapikan yang lain" | Sumber commit besar yang tidak bisa direview |
| "Buat kode ini production-ready" | Tidak bisa diverifikasi; agent akan menambah abstraksi yang tidak dibutuhkan |
