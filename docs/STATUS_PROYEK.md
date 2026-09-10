# STATUS PROYEK — Arsip Hidup Indonesia
_Ringkasan untuk konteks chat baru. Diperbarui: Fase 1 PRAKTIS TUNTAS.
T1.1-T1.7, T1.4, T1.5 (+T1.5b), T2.0a/b/c semua selesai. Yang tersisa
murni operasional (G-6), bukan koding. Commit terakhir di sesi ini: T1.5b._

## Peran dalam percakapan
Yusuf mengeksekusi build via agent AI (Claude Code) di Windows/PowerShell.
Chat dengan Claude ini = PEMANDU: menyusun/mereview strategi, menjelaskan error,
memutuskan hal di luar wewenang agent, menjaga agent tidak melompat tiket atau
melanggar zona tanpa vibe. Claude TIDAK menulis kode aplikasi di sini; agent yang
menulis, dipandu lewat prompt yang disusun di chat ini.

**PENTING:** prompt tiket TIDAK dipakai apa adanya. Setiap prompt direview dan
dirakit ulang di chat pemandu lebih dulu, termasuk ringkasan pembuka dengan
tuntutan KUTIPAN (bukan parafrase) untuk poin krusial, dan kriteria selesai
berupa perintah verifikasi konkret.

## Proyek singkat
Arsip sejarah lisan pelaku budaya Indonesia. Proyek pertama: Batik Tulis Pekalongan.
Nonprofit, dana bantuan Kementerian Kebudayaan RI 1 tahun, kelanjutan tidak
pasti → arsitektur harus "selamat kalau ditinggalkan". Domain: arsiphidup.id.
Repo: github.com/novis97/arsip-hidup (privat), branch kerja `dev`, `main` dilindungi.

## Stack final
Payload 3 + SQLite (CMS di VPS, BELUM online) → build → Astro statis di
Cloudflare Pages. Media di Cloudflare R2 (custom domain cdn.arsiphidup.id
sudah dipasang di bucket ahi-public). Situs publik TIDAK memanggil VPS
saat runtime.
- Astro 7.2.4, Payload 3.88.0 (pin persis)
- @payloadcms/richtext-lexical dipakai JUGA di apps/web (T1.6b) — harus
  bergerak bersama versi di apps/cms, TIDAK ADA penegak otomatis (UTANG)

## Arsitektur konten — dua sumber terpisah
- **Arsip** (wawancara asli) → Payload CMS, consent + redaksi nama + gerbang
  isVerified → rute `/arsip/[proyek]/[slug]`
- **Editorial** (interpretasi tim) → Astro content collections (markdown di
  apps/web/src/content/) → rute `/[...slug]` catch-all, 33 halaman
- `/koleksi/` BEBAS untuk konten editorial sejak T1.6e memindahkan rute
  arsip ke `/arsip/`

## STATUS FASE 1 — LENGKAP PER TIKET

### Selesai sebelumnya (tidak berubah)
T1.1-T1.1f, T1.2, T1.3, T1.3b/c/f/g/h/j. T1.3d dibatalkan. T1.3i, T1.3e
ditunda sampai konten nyata masuk. T1.6a/b/c/d/e (navigasi, bugfix Lexical,
figcaption+KartuRegister, container+spasi+ekstraksi CSS, rute /arsip/).
T1.7c (content collections, 33 halaman). T2.0a/b/c (staging publik +
pengaman noindex/pita/robots/llms kondisional).

### BARU selesai di sesi ini — T1.4 (Pemutar, zona tanpa vibe)

**Audit facade dilakukan lewat test suite Playwright yang sudah ada**
(`tests/facade.spec.ts`, dijalankan via `pnpm test:facade`) — BUKAN cuma
baca kode. Test ini sempat rusak karena hardcode path lama `/koleksi/...`
(sebelum T1.6e); diperbaiki manual satu baris ke `/arsip/seed-batik-tulis-
pekalongan/seed-ratmi-01`.

**Hasil test facade (bukti nyata, bukan dugaan):**
- ✅ V-4 nol request Google sebelum Play
- ✅ V-5 thumbnail dari CDN sendiri
- ✅ GEO §1 transkrip di HTML awal
- ✅ V-11 fallback muncul saat YouTube diblokir
- ❌ V-6 (iframe+sandbox) GAGAL — **BUKAN bug kode**. Data seed `youtubeId:
  "aaaaaaaaaaa"` bukan video YouTube sungguhan, sehingga video gagal
  dimuat, fallback muncul (perilaku BENAR), iframe tidak pernah ter-mount,
  test yang mengharapkan iframe gagal. UTANG: butuh mock YouTube API atau
  video test valid.

- ✅ **T1.4a** — Label dinamis tombol mute (aria-label/textContent
  berubah "Bisukan"↔"Nyalakan suara" sesuai state, berlaku klik & shortcut
  keyboard 'm'). Diverifikasi lewat shim `YT.Player` karena video seed
  tidak bisa dimuat sungguhan.
  **DIBATALKAN dalam tiket ini:** toggle CC/takarir. **YouTube IFrame API
  resmi TIDAK mendukung toggle caption on/off lewat method publik**
  (`captions.setOption` hanya dukung `fontSize` dan `reload`) — dikonfirmasi
  terhadap dokumentasi resmi Google, bukan dugaan. Ini keterbatasan
  platform. **UTANG: docs/VIDEO_EMBED.md §4.3 perlu direvisi** untuk
  mencabut janji "Takarir on/off" sebagai kontrol yang bisa dijanjikan
  penuh ke klien — sama seperti koreksi modestbranding/rel=0 sebelumnya.

- ✅ **T1.4b** — Endpoint `/api/audit` dibuat di `apps/cms/src/endpoints/
  audit.ts`, didaftarkan di `payload.config.ts`. **Temuan pemicu:**
  `arsip-player.ts` mengirim `sendBeacon` ke `/api/audit` SEJAK AWAL, tapi
  endpoint itu TIDAK PERNAH ADA — Payload hanya otomatis menyediakan
  `/api/audit-logs` (REST CRUD, butuh auth). Setiap `video.play`/
  `video.complete` gagal tercatat SENYAP sejak awal karena `sendBeacon`
  dibungkus try/catch kosong. Endpoint baru: POST anonim, whitelist
  KETAT hanya `video.play`/`video.complete` (mencegah injeksi baris audit
  palsu bertipe `login.failed` dll ke catatan tata kelola), rate limit 60
  event/IP/menit, `retentionClass: "short"`. Memakai infrastruktur yang
  SUDAH ADA (`writeAudit()`, `rateLimit()`) — tidak menyentuh
  `AuditLogs.ts` atau `lib/audit.ts`.
  **UTANG: endpoint ini BELUM TERJANGKAU dari situs statis** karena VPS
  belum online — situs statis di staging memanggil path relatif yang
  tidak ada di domain Cloudflare Pages. Menunggu T3.1 (MFA) + VPS online.
  Mungkin juga perlu URL absolut ke `api.arsiphidup.id` + CORS nanti.

### BARU selesai di sesi ini — T1.5 (Schema VideoObject + ArchiveComponent)

Sebagian besar VideoObject SUDAH ADA sebelum tiket ini. Gap yang ditutup:

- **Person dibatasi**: SEBELUMNYA selalu render `@type: Person` untuk
  SEMUA narasumber (melanggar RULES C-6 dan tabel schema SEO.md yang
  mensyaratkan Person HANYA untuk `displayConsent = full_name`). Sekarang
  Person (dan `VideoObject.creator` yang menunjuk ke situ) HANYA
  diterbitkan bila `displayConsent === 'full_name'`. Diverifikasi
  langsung: `seed-ratmi-01` (full_name) → Person ADA; `seed-resep-warna-
  keluarga-01` (initials) dan `seed-musim-rob-01` (anonymous) → Person
  TIDAK ADA, tanpa @id menggantung.
- **ArchiveComponent** ditambahkan: judul, nomor arsip, tanggal/tempat
  rekam, bahasa, status akses, `isPartOf` → node `Collection` (baru,
  supaya isPartOf VideoObject & ArchiveComponent bisa diresolusikan),
  `holdingArchive` → `#organization` global di BaseLayout. **Lisensi
  SENGAJA TIDAK dimasukkan** — data CMS cuma label teks ("CC BY-NC-ND
  4.0"), sedangkan schema.org `license` mengharapkan URL. Gap data,
  bukan gap markup — UTANG kecil.
- **BreadcrumbList** ditambahkan untuk halaman arsip (Beranda → judul
  proyek → judul arsip). **BELUM untuk 33 halaman editorial** — tiket
  terpisah (T1.5b lama, sekarang dianggap T1.5c kalau dikerjakan nanti).
- **T1.5b**: `uploadDate` SEMPAT HILANG TOTAL dari JSON-LD karena
  `item.publishedAt` merujuk field yang **tidak dideklarasikan sama
  sekali** di `ArchiveItems.ts` (bukan kosong — field itu tidak eksis,
  `undefined` dibuang `JSON.stringify`). Ditemukan lewat Google Rich
  Results Test ("Kolom uploadDate tidak ada"), bukan dari baca kode.
  Diganti ke `item.recordedAt` (field yang sudah ada) — BUKAN
  `createdAt`/`updatedAt` bawaan Payload, yang nilainya tanggal skrip
  seed dijalankan (25 Agustus 2026) untuk SEMUA arsip, bukan tanggal
  video yang sebenarnya.

**VERIFIKASI GOOGLE RICH RESULTS TEST — LULUS PENUH** (dilakukan manual,
paste HTML lewat mode "Code" karena halaman staging ber-noindex):
Breadcrumb ✅ · Organisasi ✅ · Video ✅ (termasuk uploadDate) · Bisnis
lokal ✅ (masalah non-kritis, kemungkinan Google salah klasifikasi
ArchiveComponent, abaikan).

## Fase 1 — YANG TERSISA

**G-6 (korektor transkrip) — JALUR KRITIS, BUKAN TIKET KODING.**
Client mengonfirmasi 84 narasumber (wawancara terekam) sudah didapat di
lapangan. Estimasi 189-315 jam koreksi manusia (45 menit × 3-5x durasi
untuk campuran Indonesia-Jawa). Sejak T1.3h, transkrip belum terverifikasi
tidak terbaca publik — 84 wawancara TIDAK AKAN TERBIT tanpa korektor.
**Perlu diputuskan: siapa orangnya, dibayar dari mana, kapan mulai.**

**T3.1 (MFA) + VPS online** — masih terbuka, gerbang sebelum:
- `/api/audit` bisa dipanggil dari situs statis
- Build Astro bisa lewat GitHub Actions (perlu API Payload hidup)
- Tier TERBATAS (pemutar internal, presigned segment) bisa berfungsi

## Utang teknis tercatat (tidak mendesak, tapi jangan hilang)

1. **CC/takarir tidak bisa toggle** — keterbatasan API YouTube resmi.
   VIDEO_EMBED §4.3 perlu direvisi untuk tidak menjanjikan ini penuh.
2. **Test V-6 facade gagal** — data seed `youtubeId` placeholder, bukan
   video YouTube nyata. Butuh mock API atau video test valid.
3. **`/api/audit` belum terjangkau dari statis** — menunggu VPS online.
4. **`llms.txt` produksi memuat 6 URL usang** (`/koleksi/...` lama,
   `/tentang/metodologi` vs slug asli `methodology`, dll) + alamat
   kontak tanpa mailbox. Tunggu struktur URL final.
5. **`tentang/our-story.md` masih mengarang riwayat organisasi** (klaim
   wawancara pertama 2025, tim berkumpul 2024 — semua karangan, rekaman
   nyata nol). Ditutup pita DATA UJI sementara, WAJIB ditulis ulang
   pihak berwenang sebelum go-live.
6. **Lisensi ArchiveComponent** — data CMS cuma label teks, bukan URL
   schema.org yang valid.
7. **BreadcrumbList untuk 33 halaman editorial** — belum dikerjakan.
8. **Versi @payloadcms/richtext-lexical** — apps/web dan apps/cms harus
   bergerak bersama, tidak ada penegak otomatis.
9. Semua utang lama dari sesi-sesi sebelumnya yang belum disebut di atas
   (importMap.js vs prettier, dll) — lihat riwayat git dokumen ini.

## Perubahan spesifikasi JELAJAH — BELUM DIEKSEKUSI

Client mengonfirmasi Jelajah = peta sebaran wilayah pengrajin (gaya OTA),
BUKAN indeks tematik yang sudah ditulis di 11 berkas `content/jelajah/`.
11 berkas itu SALAH KONSEP, dibiarkan ada tapi TIDAK dirender (T1.7c)
dan TIDAK di navigasi (T1.6a).

**Keputusan desain (diambil, BELUM diimplementasikan):**
- Ambang agregasi k=5: minimum 5 narasumber TERVERIFIKASI per titik
  wilayah, dihitung ULANG tiap build (bukan di-cache), naik level ke
  kecamatan bila di bawah ambang.
- Field lokasi di **Narasumber** (bukan ArchiveItems) — properti individu,
  bukan properti wawancara. RELASI ke koleksi Wilayah baru (kelurahan/
  kecamatan + centroid dari data resmi Kemendagri/OSM), BUKAN geocoding
  `recordedPlace` yang sudah ada (presisinya tidak terkendali).
- Field baru di Narasumber.ts = ZONA TANPA VIBE.

**BELUM diputuskan:** berapa dari 84 wawancara narasumber UNIK (vs
wawancara ulang orang sama); siapa siapkan daftar centroid; apakah
consent yang ada mencakup penampilan wilayah di peta publik.

**Status:** Fase 2/3, tidak ada tiket aktif.

## Pelajaran baru dari sesi T1.4/T1.5 (tambahan untuk daftar 23 pelajaran lama)

24. **Test suite otomatis yang sudah ada bisa jauh lebih kuat daripada
    audit manual baca-kode** — `tests/facade.spec.ts` (Playwright)
    langsung membuktikan 4 dari 5 gate keamanan facade dengan bukti
    nyata (HAR, DOM state) dalam hitungan detik, sesuatu yang sebelumnya
    ditandai "tidak bisa dipastikan tanpa browser sungguhan". **Selalu
    cek `package.json` untuk skrip test yang relevan SEBELUM mengasumsikan
    perlu verifikasi manual.**

25. **Test yang gagal belum tentu bug kode — bisa jadi test/datanya yang
    usang atau cacat asumsi.** V-6 gagal bukan karena facade rusak, tapi
    karena data seed `youtubeId` placeholder tidak pernah dimaksudkan
    untuk benar-benar dimuat YouTube. Jangan langsung "memperbaiki" kode
    saat test merah — diagnosis dulu MENGAPA sebelum menulis perbaikan.

26. **"API tidak mendukung X" harus diverifikasi ke dokumentasi resmi,
    BUKAN diasumsikan dari nama method yang terdengar masuk akal.**
    Agent benar menolak menebak `loadModule`/`unloadModule` untuk toggle
    CC karena keduanya tidak ada di referensi resmi YouTube IFrame API.
    Ini pola yang SAMA seperti modestbranding/rel=0 — brief/dokumen lama
    proyek bisa menjanjikan kemampuan API yang sebenarnya tidak ada.

27. **`sendBeacon`/fetch fire-and-forget ke endpoint yang tidak ada akan
    gagal SELAMANYA tanpa terlihat**, karena pola "jangan menggagalkan
    aksi utama" (benar secara UX) berarti tidak ada error yang pernah
    muncul ke siapa pun. **Endpoint yang dipanggil client HARUS
    diverifikasi benar-benar ada dan terdaftar**, bukan diasumsikan dari
    membaca kode pemanggilnya saja.

28. **Field yang dirujuk kode tapi tidak dideklarasikan di skema
    menghasilkan `undefined`, yang DIBUANG `JSON.stringify` tanpa error
    apa pun.** `item.publishedAt` di JSON-LD hilang total, bukan
    kosong/null — dan tidak ada satu pun build/test yang menangkapnya.
    Hanya Google Rich Results Test (alat eksternal sungguhan) yang
    menemukannya. **Field yang direferensikan schema/JSON-LD harus
    diverifikasi benar-benar ada di skema sumber data.**

29. **Konsistensi antar-tiket bisa pecah diam-diam saat rute dipindah**
    (T1.6e memindahkan `/koleksi/` → `/arsip/`) tapi test/config lain
    yang hardcode path lama (`tests/facade.spec.ts`) tidak ikut
    diperbarui, dan baru ketahuan saat test itu DIJALANKAN — yang
    ternyata butuh instalasi Playwright browser dulu (`pnpm exec
    playwright install`), langkah yang mudah terlewat dan membuat test
    gagal dengan alasan yang MENYESATKAN (pesan error executable-not-found
    menutupi fakta bahwa satu test lain gagal karena alasan yang benar-
    benar berbeda/nyata).

30. **`curl.exe` tanpa `-L` tidak mengikuti redirect (308), sehingga body
    kosong tanpa error yang jelas** — `Length=0` bisa berarti "halaman
    benar-benar kosong" ATAU "redirect tidak diikuti". Selalu cek status
    code eksplisit sebelum menyimpulkan sesuatu tidak ada di halaman.

31. **Google Rich Results Test menolak URL ber-`noindex`** — gunakan mode
    "Code" (paste HTML mentah), bukan mode "URL", untuk menguji halaman
    staging yang sengaja noindex.

## Konvensi kerja
Tidak berubah — 1 tiket 1 sesi 1 commit, gerbang ringkasan dengan kutipan
sumber, importMap.js tidak boleh commit, `git status --short` SEBELUM
buka GitHub Desktop (mencegah berkas tak diinginkan ikut ter-stage —
sudah 2x terjadi: `rekomendasi-karya.md` di T2.0c, `ratmi.html`/`seed-
ratmi-01` di T1.5b), `git show HEAD --stat` SETELAH commit untuk
memastikan isi cocok pesan.

Build staging tetap wajib tiga variabel di terminal yang sama:
```powershell
$env:PAYLOAD_PUBLIC_SERVER_URL = "http://localhost:3000"
$env:PUBLIC_STAGING = "1"
$env:PUBLIC_SITE_URL = "https://staging.arsiphidup.id"
```
Deploy staging TANPA flag `--branch` apa pun:
```powershell
npx wrangler pages deploy apps\web\dist --project-name=arsiphidup-staging --commit-dirty=true
```

**CMS Next.js/Turbopack: request PERTAMA setelah boot bisa 30 detik–2
menit** (kompilasi ditunda sampai ada request, diperparah drive D: yang
lambat). `Ready in Xms` di log HANYA berarti server siap menerima
koneksi, BUKAN berarti API sudah bisa merespons cepat. Selalu panggil
`Invoke-WebRequest .../api/archive-items?limit=1` dan TUNGGU sampai 200
sebelum menjalankan `pnpm build` di terminal lain.