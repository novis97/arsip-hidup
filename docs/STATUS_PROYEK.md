# STATUS PROYEK — Arsip Hidup Indonesia
_Ringkasan untuk konteks chat baru. Diperbarui: Fase 1 berjalan jauh.
T1.6a/b/c/d/e, T1.7c, T2.0a/b/c tuntas. Commit terakhir di sesi ini: T1.6d.
Dipindahkan dari Project knowledge ke repo (docs/STATUS_PROYEK.md) pada
sesi ini — sebelumnya hanya hidup di Project knowledge, bertentangan
dengan prinsip "selamat kalau ditinggalkan". Project knowledge versi lama
dianggap usang sejak file ini ada di repo; sumber kebenaran sekarang di
sini."

## Peran dalam percakapan
Yusuf mengeksekusi build via agent AI (Claude Code) di Windows/PowerShell.
Chat dengan Claude ini = PEMANDU: menyusun/mereview strategi, menjelaskan error,
memutuskan hal di luar wewenang agent, menjaga agent tidak melompat tiket atau
melanggar zona tanpa vibe. Claude TIDAK menulis kode aplikasi di sini; agent yang
menulis, dipandu lewat prompt yang disusun di chat ini. 1 chat pemandu menaungi
BANYAK sesi agent (1 sesi agent = 1 tiket).

**PENTING:** prompt tiket TIDAK dipakai apa adanya. Setiap prompt direview dan
dirakit ulang di chat pemandu lebih dulu, termasuk ringkasan pembuka 5-8 poin
dengan tuntutan KUTIPAN (bukan parafrase) untuk poin-poin krusial, dan kriteria
selesai berupa perintah verifikasi konkret, bukan pernyataan.

## Proyek singkat
Arsip sejarah lisan pelaku budaya Indonesia. Proyek pertama: Batik Tulis Pekalongan.
Nonprofit, dana bantuan dinas 1 tahun (Kementerian Kebudayaan RI), kelanjutan tidak
pasti → arsitektur harus "selamat kalau ditinggalkan". Domain: arsiphidup.id.
Repo: github.com/novis97/arsip-hidup (privat), branch kerja `dev`, `main` dilindungi.

## Stack final
Payload 3 + SQLite (CMS di VPS, BELUM online) → build → Astro statis di
Cloudflare Pages. Media di Cloudflare R2. Situs publik TIDAK memanggil VPS
saat runtime.
- Astro 7.2.4, Payload 3.88.0 (pin persis), Vitest 4.1.11
- Node 22, pnpm 9.12.0
- @payloadcms/storage-s3 tersambung ke R2
- @payloadcms/richtext-lexical dipakai JUGA di apps/web sejak T1.6b (lihat utang)

## PENTING: konten editorial vs arsip CMS — dua sumber terpisah
Sejak T1.7a/c, konten editorial (Cerita, Berita, Koleksi tematik, Tentang,
Berpartisipasi, Kontak, dll) hidup sebagai **Astro content collections**
(markdown di apps/web/src/content/), BUKAN koleksi Payload. Pemisahan mengikat:
- Arsip (wawancara asli) → Payload, butuh consent + redaksi nama + gerbang
  isVerified → rute `/arsip/[proyek]/[slug]`
- Editorial (interpretasi tim, tanpa data sensitif individual) → markdown →
  rute `/[...slug]` catch-all

**Awalan `/koleksi/` SEKARANG BEBAS untuk konten editorial** (kurasi tematik).
Ini mencabut aturan lama "awalan /koleksi/ hanya boleh dilayani rute Payload" —
dicabut sejak T1.6e memindahkan rute arsip ke `/arsip/[proyek]/[slug]`.

## Keputusan penting yang mengikat (kumulatif, termasuk yang lama)
- Domain arsiphidup.id final.
- Video: façade YouTube (nocookie), self-host R2 untuk materi terbatas. Presigned
  URL TTL maks 300 detik. Player custom di `player/*` — ZONA TANPA VIBE.
- Privasi: consent_ref bukan biodata asli masuk aplikasi. AuditLog hash bersalt.
- Paywall TIDAK diterapkan Fase 1.
- Crawler AI pelatihan diblokir (RULES E-8), crawler mesin jawaban diizinkan —
  ditegakkan di `apps/web/src/pages/robots.txt.ts` (lihat T2.0b).
- Palet: batik pesisir Pekalongan, bukan keraton Solo-Yogya.
- displayConsent WAJIB dihormati di semua titik render termasuk URL, canonical,
  sitemap, JSON-LD.
- **Angka di situs harus dari database, tanpa karangan (RULES 1.7)** — ditegakkan
  dengan mencabut field `jumlah_wawancara` dan angka statistik karangan dari
  konten editorial (lihat sesi T1.7z/T1.7z2 di bawah).

### Keputusan (22 Agustus 2026) — dari versi lama, masih berlaku
- `admin` dikecualikan sementara dari MFA_REQUIRED_ROLES. **VPS TIDAK BOLEH
  ONLINE sebelum T3.1 selesai.**
- Akun Cloudflare atas nama pribadi developer (Support@webisnis.id), akun kerja
  yang juga menampung klien lain. G-7 TETAP TERBUKA, **BERTAMBAH lagi di sesi
  T2.0a** (lihat G-7 diperbarui di bawah).
- Build Astro memakai akses ANONIM tanpa API key.
- Fase 1 hanya bucket R2 publik (`ahi-public`). `ahi-restricted` dikunci.
- Allowlist csrf wajib memuat origin panel admin.

### Keputusan (24-25 Agustus 2026) — dari versi lama, masih berlaku
- Penegakan displayConsent di lapisan sumber (T1.3b), bukan render.
- `initials` ikut dikasarkan.
- Redaksi berbasis `!req.user` juga di Local API tanpa user — DISENGAJA.
- Penyapuan nama per kata: 3 pagar (panjang min 5, stopword, kapital). Nama
  LENGKAP selalu disapu tanpa syarat.
- `recordedPlace` TIDAK disapu otomatis.
- `segments` (JSON transkrip) dikosongkan tanpa syarat untuk anonim.
- `isVerified` jadi syarat baca anonim transkrip (T1.3h). RULES C-4 direvisi:
  peringatan "belum diverifikasi" dipertahankan untuk pembaca terautentikasi,
  TIDAK terjangkau anonim.
- RULES C-1 direvisi: arsip publik tanpa transkrip terverifikasi wajib isi
  `description`. **KOREKSI DI SESI INI (lihat bawah): C-1 sempat dianggap
  "aturan mati" karena description tidak dirender — INI SALAH, lihat T1.6b.**
- T1.3i dan T1.3e DITUNDA sampai konten nyata masuk.
- `[SEED]` dipertahankan di data uji.

## KOREKSI DIAGNOSIS DARI SESI INI (penting — jangan diulang)

Sesi pemandu kali ini melakukan dan mengoreksi beberapa kesalahan diagnosis.
Dicatat di sini supaya sesi berikutnya tidak mewarisi kesimpulan yang salah:

1. **`description` BUKAN "tidak dirender".** Diagnosis lama (25 Agustus)
   menyimpulkan field description tidak sampai ke `dist` HTML sehingga
   RULES C-1 "aturan mati". INI SALAH. `description` sebenarnya DIRENDER
   lewat `set:html`, tapi field itu bertipe **richText Lexical (objek)**,
   bukan string — sehingga menghasilkan literal `[object Object]` di HTML.
   Perbaikan: T1.6b memasang `convertLexicalToHTML` dari
   `@payloadcms/richtext-lexical/html` di sisi Astro. RULES C-1 sekarang
   BERFUNGSI, bukan mati.

2. **Utang lama "Astro menarik SELURUH koleksi transkrip lalu memfilter"
   SALAH DIRUMUSKAN.** Penyaringan sebenarnya terjadi di DATABASE lewat
   `where[archiveItem][equals]=...`, bukan di Astro. Yang benar dari
   rumusan lama hanya bagian `limit=1` — arsip dwibahasa tetap kehilangan
   transkrip bahasa kedua.

3. **`themes` (untuk Jelajah) SUDAH ADA relasinya di ArchiveItems.ts**
   (baris ~273, `relationTo: "themes"`), migrasi T1.1 sudah membuat
   tabelnya. Yang BELUM ada: data-nya (`totalDocs: 0`) dan `Themes.ts`
   masih stub 2 field dengan `TODO(Fase 2)`. Ini BUKAN tiket skema baru,
   hanya butuh seed + pengisian field — TAPI lihat perubahan spesifikasi
   Jelajah di bawah, karena konsepnya berubah total.

4. **T1.6c (figcaption + Kartu Register responsif) TIDAK menyentuh zona
   tanpa vibe.** Sempat dikira berisiko tinggi; ternyata `figcaption` dan
   struktur Kartu Register ada di `[slug].astro` dan `KartuRegister.astro`,
   bukan di `player/*`.

## Progres tiket (kumulatif sejak versi lama)

### FASE 0 — FONDASI: ✅ TUNTAS (tidak berubah dari versi lama)

### FASE 1 — JALUR ARSIP PUBLIK: BERJALAN, BANYAK MAJU
Selesai dari versi lama: T1.1-T1.1f, T1.2, T1.3, T1.3b, T1.3c, T1.3f, T1.3g,
T1.3h, T1.3j. T1.3d dibatalkan. T1.3i, T1.3e ditunda.

**BARU selesai di sesi ini:**

- ✅ **T1.6b** — Perbaiki jalur render `description` (bug Lexical). Konverter
  `convertLexicalToHTML` dipasang di `[slug].astro`, versi
  @payloadcms/richtext-lexical DIPIN 3.88.0 di apps/web juga (harus bergerak
  bersama apps/cms — TIDAK ADA penegak otomatis, UTANG). Fallback
  `?? item.summary` DICABUT — description kosong = seksi tidak dirender,
  bukan diam-diam diganti summary (summary dilarang jadi pengganti oleh
  RULES C-1).

- ✅ **T1.6e** — Rute arsip dipindah dari `/koleksi/[collection]/[slug]` ke
  `/arsip/[proyek]/[slug]`. Alasan: segmen berisi slug PROYEK DOKUMENTASI
  (mis. "seed-batik-tulis-pekalongan"), bukan koleksi tematik — nama lama
  salah kaprah dan akan bentrok dengan konten editorial "Koleksi" yang
  konsepnya berbeda. `/koleksi/` sekarang bebas untuk editorial.

- ✅ **T1.6c** — figcaption pakai tanggal terformat (bukan ISO mentah); Kartu
  Register responsif (CSS saja, markup dl/dt/dt tidak berubah). Diverifikasi
  visual di 320/375/768px.

- ✅ **T2.0a** — Pipa staging Cloudflare Pages (`arsiphidup-staging`), custom
  domain `staging.arsiphidup.id`, Access awalnya dipasang lalu DICABUT atas
  permintaan client (lihat bawah), R2 custom domain `cdn.arsiphidup.id` di
  bucket `ahi-public`.

- ✅ **T2.0b** — Pengaman staging publik dikendalikan `PUBLIC_STAGING`: meta
  `noindex, nofollow`, pita "DATA UJI" permanen di setiap halaman, canonical
  mengikuti `PUBLIC_SITE_URL` (build GAGAL kalau tidak disetel saat staging),
  sitemap dimatikan. `robots.txt` dipindah dari `public/` ke endpoint
  `pages/robots.txt.ts` supaya bisa bercabang — versi produksi byte-identik
  dengan yang lama (menegakkan RULES E-8), versi staging tolak-semua.

- ✅ **T2.0c** — `llms.txt` juga dipindah ke endpoint kondisional
  (`pages/llms.txt.ts`), pola sama seperti robots.txt. **CATATAN: isi versi
  PRODUKSI memuat 6 URL usang** (/koleksi/... lama, /tentang/metodologi,
  /tentang/etika — beda dari slug asli methodology/ethics, /terlibat/akses-arsip,
  /peta-warna, /linimasa — semuanya tidak ada) dan alamat kontak tanpa mailbox.
  BELUM diperbaiki — tiket tersendiri setelah struktur URL final.

- ✅ **T1.7c** — Astro content collections + rute catch-all `[...slug].astro`.
  33 halaman dari 7 folder (tentang 9, berpartisipasi 7, berita 5, cerita 5,
  koleksi 4, kontak 1, belajar 1, rekomendasi-karya 1). Skema zod ketat,
  string/array kosong di-transform jadi undefined. Resolusi URL: slug
  bergaris-miring dipakai apa adanya; slug = nama folder dipakai apa adanya;
  selainnya diawali nama folder. **jelajah/ dan beranda/ SENGAJA dikeluarkan**
  (lihat alasan di bawah).

- ✅ **T1.6a** — Navigasi 9 item (Beranda, Tentang, Koleksi, Cerita, Belajar,
  Berpartisipasi, Berita, Kontak, Rekomendasi Karya) TANPA dropdown, TANPA
  JavaScript — `<details>/<summary>` native dengan atribut `open` PERMANEN
  (lihat catatan teknis di bawah). Indeks `/cerita` dan `/berita` baru
  (mendaftar entri, urutan by nama berkas karena frontmatter tidak punya
  field tanggal). Beranda: label "Koleksi"→"Proyek" (getCollections kini
  berarti proyek dokumentasi sejak T1.6e), "Tonton cerita"→"Baca cerita",
  tombol "Jelajahi arsip"→/koleksi (dari /jelajah yang tidak ada).
  **Jelajah SENGAJA tidak masuk navigasi** — spesifikasi berubah jadi peta
  (lihat bawah), belum final.

- ✅ **T1.6d** — Container `.page-content` (max-width 840px, padding
  responsif var(--s4)/var(--s6)), jarak vertikal var(--s7) antar elemen
  level-atas, statistik beranda (dl.mono) ditata horizontal. Token `--s9`
  (96px) ditambah ke tokens.css. SEMUA aturan baru masuk `tokens.css`
  (sudah ada sejak sebelumnya, berisi --s1..--s8 + warna + tipografi),
  BUKAN blok `<style>` baru di BaseLayout — menjaga satu lokasi tunggal
  untuk CSS non-komponen.

- ✅ **Sesi T1.7z / T1.7z2** — Cabut angka karangan dari konten editorial
  (RULES 1.7). `jumlah_wawancara: 18/34/15` dihapus (bukan di-null-kan —
  field yang tidak ada lebih jujur daripada null, dan null akan menabrak
  zod nullable di masa depan). Kalimat "Koleksi terbesar dalam arsip ini,
  dengan 34 wawancara" ditulis ulang manual (pemandu, bukan agent) jadi
  tanpa klaim angka/superlatif. Field `jumlah_wawancara` di spec microcopy
  ditandai eksplisit "SENGAJA BELUM ADA — dicabut per RULES 1.7". Blok
  "CATATAN DEV (internal, jangan tampilkan ke publik)" di
  rekomendasi-karya (8 alamat email placeholder) DIHAPUS manual — satu-
  satunya catatan pengembangan yang dihapus; sisanya (blok italic
  "*(Halaman placeholder pengembangan...)*") SENGAJA DIBIARKAN terbit,
  ditutupi pita DATA UJI.

### CATATAN TEKNIS PENTING — navigasi `<details>`
`<details>` TANPA atribut `[open]` menyembunyikan slot kontennya lewat
MEKANISME INTERNAL BROWSER (bukan `display` CSS biasa) — tidak bisa
ditimpa dengan `display:flex` pada `> ul`. Solusi: atribut `open`
PERMANEN pada elemen, `<summary>` disembunyikan lewat CSS di layar lebar
(≥768px), terlihat sebagai tombol lipat di layar sempit. Konsekuensi: di
ponsel, menu TERBUKA secara default saat halaman dimuat — pengguna harus
menutupnya sendiri. Trade-off yang diterima demi tanpa-JavaScript.

## Perubahan spesifikasi JELAJAH — BELUM DIEKSEKUSI, catat lengkap

Client mengonfirmasi Jelajah yang dimaksud BUKAN indeks tematik (yang sudah
ditulis di 11 berkas `content/jelajah/`), melainkan **peta sebaran wilayah
pengrajin**, gaya situs OTA (titik wilayah, klik → insight terkait). 11
berkas yang ada SALAH KONSEP, perlu ditulis ulang — bukan disesuaikan.

**Konteks pemicu:** client mengonfirmasi lapangan sudah menghasilkan
**84 narasumber (wawancara terekam)**.

**Dampak G-6:** 84 wawancara × ~45 menit × 3-5× durasi (Indonesia-Jawa
campuran) = **189-315 jam koreksi manusia**. G-6 naik status jadi JALUR
KRITIS dengan angka konkret, bukan lagi "belum berbiaya, terbuka".

**Konflik privasi yang dihindari:** peta TIDAK BOLEH titik presisi rumah
individu (melanggar RULES butir 5 dalam bentuk lain; T1.3b sengaja tidak
memancarkan displayName/slug non-full_name). Client sendiri menyatakan
tidak ingin presisi rumah, cukup insight wilayah asal.

**Keputusan desain (diambil, BELUM diimplementasikan):**
- Ambang agregasi k=5: minimum 5 narasumber TERVERIFIKASI per titik
  wilayah. Di bawah ambang, naik level ke kecamatan (bukan disembunyikan).
- Ambang dihitung dari narasumber yang transkripnya SUDAH LOLOS gerbang
  isVerified (T1.3h) — BUKAN dari total 84 mentah. Perhitungan agregat
  HARUS dihitung ulang tiap build/query, TIDAK di-cache/ditulis manual.
- Field lokasi menempel ke **Narasumber**, BUKAN ArchiveItems — lokasi
  properti individu, bukan properti wawancara. Bonus: hook redaksi
  afterRead (T1.3b) sudah ada di Narasumber.ts, field baru otomatis lewat
  jalur privasi yang sama.
- Field lokasi = RELASI ke koleksi Wilayah baru (kelurahan/kecamatan +
  centroid tetap), BUKAN teks bebas, BUKAN geocoding otomatis dari
  `recordedPlace` yang sudah ada (presisinya tidak terkendali untuk tujuan
  peta).
- Sumber data centroid: data referensi resmi (Kemendagri/OSM/data.go.id),
  disiapkan SEKALI sebagai data referensi statis, bukan geocoding manual
  per entri.

**BELUM diputuskan, perlu dijawab sebelum tiket dimulai:**
- Berapa dari 84 wawancara yang narasumber UNIK vs wawancara ulang?
- Siapa menyiapkan daftar centroid wilayah?
- Apakah consent yang ada mencakup penampilan wilayah asal di peta publik?

**Field baru di Narasumber.ts = ZONA TANPA VIBE.**

**Status:** Fase 2/3, bukan Fase 1. Tidak ada tiket aktif. 11 berkas
`content/jelajah/` DIBIARKAN ADA (tidak dihapus) tapi TIDAK dirender
(T1.7c) dan TIDAK di navigasi (T1.6a) sampai spesifikasi final.

## Pelajaran baru dari sesi ini (tambahan untuk daftar 16 pelajaran lama)

17. **Cloudflare Pages menyamarkan 404 jadi beranda dengan status 200.**
    JANGAN pakai "halaman muncul" sebagai uji keberhasilan deploy — pakai
    JUDUL HALAMAN (`<title>`) atau frasa spesifik. Ditemukan berulang kali
    saat verifikasi T1.7c/T1.6a menampilkan beranda untuk path yang
    sebenarnya belum ter-deploy.

18. **Deploy Wrangler `--branch` yang tidak cocok dengan production branch
    proyek MASUK SEBAGAI PREVIEW, dan preview TIDAK BISA di-"promote" ke
    production lewat dasbor** (opsi yang tersedia hanya "Delete deployment").
    Perbaikan: pastikan production branch proyek Pages cocok dengan branch
    git kerja (`dev`), lalu deploy TANPA flag `--branch` sama sekali —
    Wrangler mendeteksi branch otomatis dan mencocokkannya.

19. **Menyalin teks non-ASCII lewat terminal Windows merusaknya diam-diam**
    (mojibake: `──` jadi `ΓöÇΓöÇ`, `§` jadi `┬º`). Kejadian dua kali:
    saat menyalin isi robots.txt lama, saat melihat HTML hasil curl. Solusi:
    agent HARUS mengambil isi lewat `git show HEAD:path` dan menyimpan
    eksplisit sebagai UTF-8, TIDAK boleh menyalin dari apa yang tampil di
    layar terminal. Verifikasi dengan `Compare-Object` ber-`-Encoding utf8`
    di kedua sisi.

20. **`.env` root bisa memuat nilai untuk host yang belum ada**
    (`PAYLOAD_PUBLIC_SERVER_URL=https://api.arsiphidup.id`), yang
    menggagalkan build siapa pun yang membaca `.env` langsung. Build lokal
    yang "biasanya berhasil" ternyata bergantung pada jalur yang tidak
    memuat variabel itu ke proses web. Mitigasi sementara: timpa manual di
    tiap sesi terminal sebelum `pnpm build`:
    `$env:PAYLOAD_PUBLIC_SERVER_URL = "http://localhost:3000"`

21. **Uji redaksi berbasis substring tanpa batas kata menghasilkan positif
    palsu begitu ada konten editorial dengan nama yang tumpang tindih**
    (mis. "Laras" cocok dengan "Dhiyah Ayu Larasati" di tentang/our-team.md,
    bukan "[SEED] Laras Wening"). Sejak T1.7c menambah 33 halaman editorial,
    uji redaksi HARUS: (a) dibatasi ke folder `dist/arsip/` saja, (b) pakai
    batas kata `\b(...)\b`, bukan substring polos.

22. **Kriteria selesai yang hanya menghitung JUMLAH berkas tidak membuktikan
    ISI berkas benar.** T1.7c lulus "37 halaman terbangun" padahal (saat
    diagnosis navigasi kemudian) perlu diverifikasi ulang bahwa tiap
    halaman memuat konten yang BENAR, bukan salinan beranda. Untuk tiket
    render/konten berikutnya, kriteria harus menyebut frasa spesifik dari
    tiap halaman yang diharapkan, bukan hanya angka total.

23. **Perbaikan visual (CSS, navigasi) TIDAK BISA diverifikasi lewat
    perintah PowerShell/grep saja** — harus dicek visual di browser
    (lebar penuh DAN 320px). HTML yang benar secara tekstual (kelas CSS
    ada, teks ada) bisa tetap tidak terlihat sama sekali kalau ada
    masalah rendering (kasus `<details>` tanpa `open`).

## G-7 (kepemilikan akun, tenggat sebelum Demo 2) — DIPERBARUI sesi ini
Selain Cloudflare/domain/R2 lama, BERTAMBAH di sesi T2.0a:
- Proyek Cloudflare Pages `arsiphidup-staging`
- Langganan Cloudflare Zero Trust Free (metode pembayaran akun pribadi
  novis97@gmail.com) — SEMPAT diaktifkan untuk Access, KEMUDIAN DICABUT
  atas permintaan client (lihat di bawah). Langganan itu sendiri
  kemungkinan masih aktif di akun meski Access sudah dihapus — PERLU
  DICEK apakah perlu dinonaktifkan juga atau dibiarkan (tidak berbayar
  selama di bawah 50 pengguna).
- DNS record `staging.arsiphidup.id` (CNAME proxied)
- R2 custom domain `cdn.arsiphidup.id`

## Keputusan staging terbuka publik (bukan noindex-only)
Awalnya staging ditutup Cloudflare Access (email allowlist tim+client).
**Client menolak, minta akses tanpa hambatan login** ("santai saja").
Keputusan: Access DICABUT, staging dibuka publik, TAPI baru setelah
pengaman T2.0b terpasang dan terverifikasi lebih dulu (noindex, pita DATA
UJI, canonical staging, sitemap mati, robots.txt tolak-semua). Urutan
"pasang pengaman dulu, verifikasi, baru cabut gerbang" dijaga ketat.
RULES O-5 (noindex + basic auth) TIDAK terpenuhi penuh sejak Access
dicabut — dicatat sebagai deviasi sadar, keputusan client, bukan
kelalaian.

**Keterbatasan yang ditemukan:** zona `arsiphidup.id` menyajikan
`robots.txt` bawaan Cloudflare (Managed Content policy) yang muncul
SEBELUM endpoint kustom bisa dijangkau di beberapa jalur — perlu
diverifikasi apakah ini konsisten atau situasional.

## Hal terbuka (kumulatif, tambahan dari sesi ini)
- ⬜ **llms.txt produksi memuat 6 URL usang** dan alamat kontak tanpa
  mailbox. Perbaikan setelah struktur URL final.
- ⬜ **Ekstraksi CSS komponen** (.arsip-player__*, .staging-banner, dll)
  ke tokens.css BELUM tuntas — baru token dasar + layout container yang
  sudah dipindah. CSS spesifik-komponen (terutama player) masih inline
  per-komponen.
- ⬜ **Spesifikasi peta Jelajah** — lihat bagian lengkap di atas. Fase 2/3.
- ⬜ **/cerita dan /berita** sekarang punya indeks (T1.6a) — halaman yang
  dulu 404 sudah beres.
- ⬜ **tentang/02-our-story.md masih mengarang riwayat organisasi** (klaim
  wawancara pertama 2025, tim berkumpul 2024, dll — semua karangan, rekaman
  nyata nol). Ditutupi pita DATA UJI untuk sekarang, TAPI WAJIB ditulis
  ulang oleh pihak berwenang sebelum go-live — bukan opsional.
- ⬜ **G-6 sekarang punya angka konkret (189-315 jam)** — jalur kritis,
  perlu keputusan siapa & dibayar dari mana, MENDESAK karena lapangan
  sudah menghasilkan 84 wawancara yang menunggu koreksi.
- ⬜ Konflik konten lain yang belum ditangani: institusi nyata dalam
  peristiwa karangan (Pemerintah Kota Pekalongan disebut menggelar acara
  fiktif), media karangan yang masuk akal dikira nyata (Kanal Budaya
  Nusantara, Warta Pesisir Jawa, Pekalongan Bersuara).
- ⬜ Semua hal terbuka dari versi STATUS_PROYEK lama yang BELUM disebut
  di atas tetap berlaku tanpa perubahan (G-7 lama, gerbang VPS/MFA, utang
  teknis lama seperti importMap.js vs prettier, dll) — lihat riwayat git
  dokumen ini atau chat sesi sebelumnya kalau perlu detail lengkap.

## Konvensi kerja
Tidak berubah dari versi lama — lihat bagian "Konvensi kerja" dan
"Perintah yang terbukti dipakai berulang" di riwayat dokumen ini. Semua
konvensi (1 tiket 1 sesi 1 commit, gerbang 8 poin dengan kutipan sumber,
importMap.js tidak boleh ikut commit, git status sebelum commit, dst)
TETAP MENGIKAT dan sudah dipraktikkan konsisten sepanjang sesi ini.

**Tambahan konvensi dari sesi ini:** setiap sesi build staging WAJIB
menyetel tiga variabel di terminal yang SAMA dengan `pnpm build`:
```powershell
$env:PAYLOAD_PUBLIC_SERVER_URL = "http://localhost:3000"
$env:PUBLIC_STAGING = "1"
$env:PUBLIC_SITE_URL = "https://staging.arsiphidup.id"
```
Dan deploy staging TANPA flag `--branch` apa pun:
```powershell
npx wrangler pages deploy apps\web\dist --project-name=arsiphidup-staging --commit-dirty=true
```