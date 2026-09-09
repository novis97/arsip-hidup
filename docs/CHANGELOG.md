# CHANGELOG — Blueprint Arsip Hidup Indonesia

## T1.4b — endpoint telemetri pemutaran anonim — 10 September 2026

Endpoint `POST /api/audit` ditambahkan untuk menerima telemetri pemutaran anonim dari situs statis. Endpoint hanya menerima `video.play` dan `video.complete`; whitelist ini mencegah pengunjung anonim menyuntikkan peristiwa keamanan atau keputusan tata kelola palsu ke AuditLogs. Penulisan dibatasi hingga 60 event per IP per 60 detik, cukup untuk lonjakan interaksi pemutar yang wajar sambil membatasi banjir tulis anonim ke SQLite.

Tiket ini dipicu oleh temuan bahwa audit pemutaran gagal senyap sejak awal: pemutar mengirim `sendBeacon` ke `/api/audit`, tetapi endpoint tersebut tidak pernah ada. Endpoint baru meneruskan IP dan user-agent ke `writeAudit()` agar hanya hash aktor bersalt yang disimpan, serta menandai rekaman sebagai telemetri retensi `short`.

## T1.4a — label dinamis tombol mute — 8 September 2026

Kontrol mute pemutar kini menyinkronkan status awal dan setiap perubahan dengan `player.isMuted()`. Saat suara aktif, tombol menampilkan ikon speaker dan bernama “Bisukan”; saat dibisukan, tombol menampilkan ikon speaker tercoret dan bernama “Nyalakan suara”. `aria-pressed` tetap menyatakan status mute saat ini, sedangkan `aria-label` menyatakan aksi yang akan dilakukan agar fungsi tombol disebutkan dengan tepat oleh pembaca layar.

Bagian CC dari tiket dihentikan karena YouTube IFrame API resmi tidak menyediakan metode publik untuk menyalakan dan mematikan takarir sepenuhnya. Implementasi tidak memakai API captions yang tidak terdokumentasi.

## T1.6d-kartu-register — ekstraksi CSS Kartu Register — 8 September 2026

Ekstraksi CSS komponen kini selesai: `tokens.css` tetap memuat CSS global, `player.css` memuat CSS komponen pemutar dari pekerjaan sebelumnya, dan `kartu-register.css` memuat CSS komponen Kartu Register pada tiket ini. `BaseLayout.astro` sekarang hanya berisi CSS untuk elemen yang direndernya secara langsung: header, nav, footer, dan pita staging.

## T1.6d — container, padding, dan jarak antar seksi — 8 September 2026

Token ruang `--s9: 96px` ditambahkan untuk melengkapi skala yang ditetapkan DESIGN §2.3 tanpa mengubah nilai token sebelumnya. Class `.page-content` kini membatasi hanya konten `<main>` pada `max-width: 840px` dengan posisi terpusat, `padding-inline: var(--s4)` pada layar sempit, `padding-inline: var(--s6)` mulai lebar 768px, dan jarak vertikal `var(--s7)` di antara anak langsung. Header, pita DATA UJI, dan footer tetap selebar viewport.

`tokens.css` menjadi lokasi tunggal aturan CSS non-komponen, termasuk tata letak global dan baris statistik beranda. Blok `<style>` baru untuk aturan semacam ini tidak boleh ditambahkan ke `BaseLayout.astro` pada perubahan mendatang.

## T1.6a — navigasi utama, indeks Cerita dan Berita, serta koreksi beranda — 31 Agustus 2026

Navigasi utama kini memuat sembilan item tanpa dropdown. Pada layar sempit, menu memakai elemen native `<details>` dan `<summary>` tanpa JavaScript; pada layar lebar, tautan ditampilkan mendatar. Jelajah sengaja dikeluarkan karena spesifikasinya berubah menjadi peta sebaran wilayah dan belum final.

Elemen `<details>` memakai atribut `open` permanen karena konten `<details>` yang tertutup tidak dapat ditampilkan lewat CSS; konsekuensinya, menu terbuka secara bawaan di layar sempit dan tetap dapat ditutup oleh pengguna.

Dua rute indeks baru mendaftar masing-masing lima entri Cerita dan Berita beserta keterangannya. Urutan indeks Berita mengikuti nama berkas karena frontmatter tidak memiliki field tanggal. Beranda juga dikoreksi dengan mengganti label angka ketiga menjadi “Proyek”, teks tombol menjadi “Baca cerita”, dan tujuan “Jelajahi arsip” menjadi `/koleksi`.

## T2.0c — `llms.txt` kondisional untuk staging — 31 Agustus 2026

`llms.txt` dipindahkan dari berkas publik statis ke endpoint prerender kondisional agar staging tidak mengundang model bahasa dan mesin jawaban mengutip konten uji yang seluruhnya fiktif. Dengan `PUBLIC_STAGING=1`, endpoint hanya menyatakan bahwa situs merupakan lingkungan uji dan isinya tidak boleh dikutip; tanpa flag tersebut, isi produksi dipertahankan tanpa perubahan.

**CATATAN:** Isi versi produksi masih memuat URL usang yang belum diperbaiki. Perbaikannya merupakan tiket tersendiri setelah struktur URL final.

## T1.7c — content collections dan rute editorial statis — 31 Agustus 2026

Astro content collections kini memvalidasi dan merender 33 halaman editorial dari folder `tentang/`, `berpartisipasi/`, `berita/`, `cerita/`, `koleksi/`, `kontak/`, `belajar/`, dan `rekomendasi-karya/`. Resolusi URL mempertahankan slug yang sudah memuat garis miring atau sama dengan nama folder; slug lain mendapat awalan nama folder. Build gagal jika dua berkas menghasilkan URL yang sama dan menyebut kedua path sumbernya.

Folder `jelajah/` sengaja tidak dimasukkan karena bergantung pada koleksi Payload `themes` yang masih kosong dan implementasinya masih berupa stub, sehingga 11 halamannya akan kosong. Folder `beranda/` juga sengaja tidak dimasukkan karena beranda sudah dilayani `pages/index.astro` dan akan bertabrakan bila dirender melalui rute editorial.

## T2.0b — pengaman staging publik — 31 Agustus 2026

Staging publik kini memiliki empat pengaman yang bergantung pada `PUBLIC_STAGING=1`: setiap halaman memuat `noindex, nofollow`, endpoint `robots.txt` menolak seluruh crawler, pita permanen DATA UJI tampil pada bagian teratas setiap halaman, serta canonical dan `og:url` mengikuti `PUBLIC_SITE_URL` sementara integrasi sitemap dimatikan. Tanpa flag staging, endpoint `robots.txt` tetap menyajikan kebijakan produksi yang mengizinkan crawler mesin jawaban, memblokir crawler pelatihan sesuai RULES E-8, dan mencantumkan Sitemap. Build staging gagal dengan pesan yang jelas jika `PUBLIC_SITE_URL` tidak disetel.

`robots.txt` ini berlaku di `arsiphidup-staging.pages.dev`, tetapi kemungkinan tidak dilayani di `staging.arsiphidup.id` karena zona `arsiphidup.id` menyajikan Managed Content bawaan Cloudflare. Keterbatasan tersebut diketahui dan tidak disiasati. Seluruh pengaman staging ini **WAJIB dicabut sebelum produksi** dengan membangun tanpa `PUBLIC_STAGING=1`.

## T1.6c — format tanggal figcaption dan Kartu Register responsif — 31 Agustus 2026

Figcaption pemutar kini memakai tanggal rekam yang sudah diformat dalam bahasa Indonesia, bukan timestamp ISO mentah. Kartu Register tetap memakai struktur semantik `<dl>`/`<dt>`/`<dd>`, tetapi tata letaknya kini membungkus isi panjang dan menumpuk label serta nilai pada layar sempit. Ekstraksi CSS sengaja tidak dilakukan karena dijadwalkan untuk T1.6d; jangkar `#transkrip` juga sengaja tidak disentuh karena memiliki tiket tersendiri.

## T1.6e — pindahkan awalan rute arsip ke `/arsip/` — 31 Agustus 2026

Awalan rute arsip Payload dipindahkan dari `/koleksi/` ke `/arsip/`, dan nama segmen dinamis `[collection]` diganti menjadi `[proyek]`. Perubahan ini mencerminkan bahwa segmen tersebut berisi slug proyek dokumentasi, sedangkan `/koleksi/` dicadangkan untuk konsep editorial yang berbeda. Konten editorial di `apps/web/src/content/` sengaja tidak diubah.

## T1.6b — perbaiki jalur render description Lexical — 31 Agustus 2026

Halaman arsip kini mengonversi rich text Lexical pada `description` menjadi HTML di sisi Astro memakai konverter resmi `@payloadcms/richtext-lexical`. Fallback ke `summary` dicabut agar seksi "Tentang wawancara ini" tidak tampil ketika `description` memang kosong.

**UTANG BARU sinkronisasi versi.** Versi `@payloadcms/richtext-lexical` di `apps/web` wajib bergerak bersama versi yang dipakai `apps/cms`. Belum ada penegak otomatis untuk menjaga keduanya tetap sama.

## T1.3j — perkaya data seed transkrip — 25 Agustus 2026

Ketiga body transkrip seed diperpanjang menjadi lima paragraf agar halaman arsip memiliki bahan yang cukup untuk penilaian visual. Setiap body dibuka dengan penanda `[SEED]` yang berdiri sendiri. Body id 1 menyebut `[SEED] Ratmi` sebagai kasus positif `full_name`; body id 2 dan 3 selalu menyebut narasumber memakai `displayName` lengkap, termasuk prefiks `[SEED] `. Transkrip id 3 kini berstatus `isVerified: true`, dan arsip `seed-musim-rob-01` mendapat `description` dua paragraf.

Verifikasi runtime dijalankan Yusuf setelah database dibangun ulang. Tiga belas assertion lolos: `GET /api/transcripts?depth=0` mengembalikan `totalDocs = 3`; ketiga transkrip terbaca anonim; `[SEED] Ratmi` tetap utuh pada body id 1; body id 2 tidak memuat `Sari Ningsih` dan memakai label inisial; body id 3 tidak memuat `Laras Wening`, `Laras`, maupun `Wening` dan memakai label `Narasumber (anonim)`; serta setiap body masih memuat sedikitnya satu penanda `[SEED]`.

`description` arsip `seed-musim-rob-01` terisi sebagai rich text JSON berukuran 3099 byte dan bersih dari nama narasumber. Build menghasilkan 4 halaman, sementara indeks Pagefind bertambah dari 174 menjadi 441 kata. Kalimat penutup body transkrip id 1 dan id 3 ditemukan utuh di HTML hasil build, membuktikan isi panjang sampai ke `dist`.

**UTANG penyapuan stopword.** Daftar stopword di `lib/redactNames.ts` dapat membiarkan nama utuh lolos. Nama yang seluruh komponennya merupakan stopword, misalnya "laras wening", hanya tersapu melalui pencocokan nama lengkap. Jika teks menyebut nama itu tanpa prefiks `[SEED]`, pencocokan nama lengkap terhadap `displayName` tidak kena, sedangkan penyapuan per-kata menolak seluruh komponennya. Seed T1.3j menghindari keadaan tersebut dengan selalu memakai `displayName` lengkap. Ini mitigasi berbasis konvensi data, bukan perbaikan kode.

**TEMUAN jalur render `description`.** Field `description` tidak dirender di `[slug].astro`. API mengembalikan `description` arsip `seed-musim-rob-01`, tetapi frasa pembukanya tidak ditemukan di HTML hasil build. Dengan demikian RULES C-1, khususnya kewajiban mengisi `description` dengan uraian isi wawancara, belum mempunyai jalur render menuju pembaca. Temuan ini bukan cacat T1.3j; data baru T1.3j membuatnya dapat diuji. Perbaikannya dijadwalkan pada T1.6.

## T1.3h — gerbang verifikasi transkrip publik — 25 Agustus 2026

`transcriptPubliclyReadable` sekarang menambahkan syarat `isVerified: { equals: true }` pada tiga syarat publik yang sudah ada. Bentuk `equals: true` membuat gerbang gagal-tertutup: transkrip dengan nilai `false`, `null`, atau `undefined` tidak dapat dibaca publik anonim. Akses staf tetap tidak berubah.

Verifikasi runtime dijalankan Yusuf setelah CMS direstart. Saat `isVerified` transkrip id 3 diturunkan, `GET /api/transcripts?depth=0` berubah dari `totalDocs = 3` menjadi `totalDocs = 2`, dan `GET /api/transcripts/3?depth=0` mengembalikan 404. Transkrip id 1 dan 2 tetap dapat dibaca dengan body masing-masing 67 dan 99 karakter. Uji dua arah juga lolos: setelah id 3 dinaikkan kembali menjadi terverifikasi, `totalDocs` kembali menjadi 3. Angka 67 dan 99 merekam respons runtime pada saat verifikasi T1.3h; literal body seed sebelum T1.3j berukuran 67, 110, dan 99 karakter untuk id 1, 2, dan 3. Seluruh angka tersebut adalah keadaan sebelum T1.3j memperpanjang ketiga body.

Redaksi T1.3g tetap bekerja: body seed id 2 berisi `[SEED] Sari Ningsih menjelaskan...`, sedangkan REST anonim mengembalikan `Ibu S.N. menjelaskan...`. Klaim lama bahwa nama asli hilang tanpa membuang `[SEED]` tidak akurat: karena `displayName` narasumber non-`full_name` mencakup prefiks `[SEED] `, pencocokan nama lengkap ikut menelan prefiks yang menempel pada nama. Sisa kalimat tetap utuh. Setelah T1.3j, prefiks yang menempel pada `[SEED] Ratmi` tetap utuh karena Ratmi ber-consent `full_name` dan hook melewati penyapuan; penanda `[SEED]` pembuka yang berdiri sendiri pada setiap body juga tidak ikut tersapu.

RULES C-4 dan C-1 telah direvisi dalam commit `d33389d`. C-4 kini menetapkan bahwa transkrip belum terverifikasi tidak dibaca publik anonim dan gerbang berada pada access `read`; dengan T1.3h, kode dan dokumen kembali konsisten.

**UTANG pengujian `full_name`.** Tidak ada body transkrip seed yang memuat nama narasumber ber-consent `full_name`. Karena itu klaim bahwa nama `full_name` tetap utuh belum teruji melalui REST.

**UTANG pengujian `anonymous`.** Transkrip id 3 adalah satu-satunya transkrip seed milik narasumber `anonymous`. Setelah T1.3h, transkrip itu tidak terbaca anonim selama belum terverifikasi, sehingga data seed tidak lagi menyediakan kasus uji REST untuk jalur redaksi `anonymous`.

Peringatan `BELUM diverifikasi` di `[slug].astro` kini tidak terjangkau pembaca anonim. Peringatan tersebut sengaja dipertahankan untuk pembaca terautentikasi dan pratinjau, sesuai C-4 yang direvisi.

## T1.3f, T1.3c, T1.3g — penutupan kebocoran identitas — 24 Agustus 2026

**T1.3f** (`735b6f7`) menambah `transcriptPubliclyReadable`. Sebelumnya Transcripts memakai `publicReadable` yang hanya memfilter `visibility: public` tanpa pernah menanyakan keadaan arsip induknya. Akibatnya transkrip milik arsip yang sudah ditarik narasumber tetap terbaca anonim lewat `/api/transcripts`, meskipun arsipnya sendiri sudah hilang dari daftar publik. Penarikan diri tampak dihormati padahal isinya masih terambil. Fungsi baru memfilter tiga kondisi: `visibility`, `archiveItem._status`, dan `archiveItem.withdrawalRequested`.

**T1.3c** (`4def258`) menambah `lib/redactNames.ts` dan hook `afterRead` di ArchiveItems yang menyapu nama narasumber non-`full_name` dari `title`, `summary`, dan `description`. Ini menggantikan penyapu sisi render yang dihapus di T1.3b. Penyapu lama hanya menangani `contributors[0]` dan hanya mencocokkan `displayName` persis — keduanya diperbaiki.

**T1.3g** (`4d1362a`) menambah hook `afterRead` di Transcripts yang menyapu `body` dan mengosongkan `segments` untuk pembaca anonim. Diperlukan karena Astro mengambil transkrip dari endpoint terpisah dengan `depth=0`, sehingga hook ArchiveItems tidak pernah menerimanya.

**Batasan yang diketahui.** Keamanan loop penyapuan di Transcripts.ts bergantung pada bentuk label pengganti. Loop memanggil `redactNames` sekali per narasumber, masing-masing di atas hasil putaran sebelumnya. Dengan label yang ada —  `Narasumber (anonim)` dan `Ibu <inisial>` — tabrakan tidak mungkin terjadi: 
inisial berbentuk titik tidak cocok dengan nama orang, dan tidak ada narasumber bernama "Narasumber". **Kalau label diubah jadi sesuatu yang menyerupai nama, cacat ini hidup kembali** dan nama narasumber kedua bisa menyapu bagian label narasumber pertama tanpa error apa pun.

**E-3 baru terpenuhi sebagian.** RULES §5 E-3 menuntut auto-unpublish maksimal 24 jam saat `withdrawalRequested = true`. Yang dibangun ketiga tiket ini hanya penutupan jalur BACA. Status di database tidak berubah, tidak ada penjadwal, tidak ada jaminan waktu. Mekanisme auto-unpublish butuh tiket tersendiri.

**Larangan konten nyata dicabut.** Jendela tanpa perlindungan Kelas B yang dibuka T1.3b sudah ditutup. `dist/` terbukti bersih dari nama narasumber non-`full_name`, sementara narasumber `full_name` tetap utuh.

**T1.3d dibatalkan.** Sempat diduga `publishedNotWithdrawn` tidak membaca `withdrawalRequested`. Setelah kodenya dibaca, ternyata membacanya dengan benar sejak awal. Dugaan itu lahir dari menyimpulkan berdasarkan nama fungsi lain (`publishedOnly`) yang dipakai sembilan koleksi berbeda.

## T1.3b — redaksi identitas di lapisan sumber — 24 Agustus 2026

T1.3b memindahkan penegakan `displayConsent` dari lapisan render ke lapisan sumber melalui hook `afterRead` di `apps/cms/src/collections/Narasumber.ts`.

Sebagai konsekuensinya, penyapu nama sisi render `polaNamaAsli` dan `hormatiDisplayConsent` DIHAPUS. Fungsi tersebut sebelumnya menyapu nama dari `title`, `summary`, `description`, dan `transcript`. Sampai T1.3c selesai, keempat field tersebut TIDAK memiliki perlindungan apa pun.

Konsekuensi operasional: tidak boleh ada konten nyata masuk sebelum T1.3c selesai.

Redaksi berbasis `!req.user` juga berlaku pada Local API yang dipanggil tanpa user. Ini disengaja, bukan bug.

## Keputusan dan temuan Fase 1 awal — 22 Agustus 2026

### Keputusan: pengecualian sementara peran `admin` dari kewajiban MFA

Yusuf memutuskan bahwa peran `admin` untuk sementara dikecualikan dari `MFA_REQUIRED_ROLES`. Alur TOTP belum dibangun; `mfaSecret` dan `mfaEnabled` masih berupa field tanpa implementasi pendaftaran perangkat maupun verifikasi kode. Tanpa pengecualian ini, tidak seorang pun dapat memasuki panel admin dari database bersih.

Keputusan ini secara sengaja melonggarkan RULES §1.4. Risiko yang diterima: CMS untuk sementara hanya dilindungi email dan password.

**Syarat mutlak: VPS TIDAK BOLEH ONLINE sebelum T3.1 selesai.**

Pemulihan dilakukan dalam T3.1: bangun alur TOTP penuh, termasuk pendaftaran perangkat dan verifikasi kode, lalu kembalikan `admin` ke `MFA_REQUIRED_ROLES`.

### Keputusan: kepemilikan sementara akun Cloudflare

Akun Cloudflare yang menampung Pages, R2, DNS, dan domain `arsiphidup.id` untuk sementara atas nama pribadi developer, pada akun kerja yang juga menampung proyek klien lain. Akun tersebut bukan atas nama PIHAK PERTAMA.

R2 dibutuhkan untuk foto pada Demo 1. Client belum siap secara administratif dan menyerahkan pengelolaan sepenuhnya kepada developer.

Risiko yang diterima:

- bus factor 1;
- biaya berulang ditalangi secara pribadi;
- serah terima O-6 belum lengkap; dan
- pemindahan kelak harus dilakukan per sumber daya karena akun yang sama berisi proyek lain.

**G-7 tetap TERBUKA.** Tenggat pemindahan seluruh sumber daya ke kepemilikan PIHAK PERTAMA adalah sebelum Demo 2.

### Temuan teknis: origin panel admin wajib masuk allowlist CSRF

Commit `3576b77` memperbaiki autentikasi request bertulis dari panel admin. Ketika origin panel tidak tercantum dalam allowlist `csrf`, request `POST` dari browser diproses sebagai anonim: `req.user` kosong, access control menolak request, dan Payload mengembalikan 403 dengan pesan generik yang tidak menunjukkan bahwa penyebabnya adalah origin CSRF.

Allowlist `csrf` sekarang mencakup situs publik, origin server Payload yang menjadi origin panel admin, serta `http://localhost:3000` pada lingkungan nonproduksi. Setiap lingkungan wajib memasukkan origin panel adminnya dengan kecocokan persis sampai scheme, host, dan port.

## Penyelarasan pra-implementasi — 21 Agustus 2026

- Versi front-end diselaraskan ke dependensi aktual: Astro 7.2.4, bukan Astro 5.
- Status fondasi diperbarui: T0.1 selesai; berkas T0.2 tersedia tetapi verifikasi halaman login `/admin` masih wajib.
- Diagram pemutar internal memakai nama `R2Hls`, bukan sisa istilah `MinioHls`.
- Facet Jelajah ditetapkan menjadi tema, wilayah, periode, bahasa, jenis materi, dan narasumber; kata kunci tetap berada di pencarian.
- Definition of Done menu sekarang menyebut tujuan navigasi secara eksplisit, bukan hitungan yang ambigu.
- Lokasi komponen pemutar diselaraskan ke `apps/web/src/components/player/`; workspace `packages/ui` tidak digunakan.
- `READINESS.md` dan `SCAFFOLD_NOTES.md` diselaraskan dengan kondisi worktree setelah commit `2e7a5ab` dan `3a9a281`.

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
