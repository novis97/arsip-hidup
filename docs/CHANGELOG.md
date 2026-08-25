# CHANGELOG — Blueprint Arsip Hidup Indonesia

## T1.3h — gerbang verifikasi transkrip publik — 25 Agustus 2026

`transcriptPubliclyReadable` sekarang menambahkan syarat `isVerified: { equals: true }` pada tiga syarat publik yang sudah ada. Bentuk `equals: true` membuat gerbang gagal-tertutup: transkrip dengan nilai `false`, `null`, atau `undefined` tidak dapat dibaca publik anonim. Akses staf tetap tidak berubah.

Verifikasi runtime dijalankan Yusuf setelah CMS direstart. Saat `isVerified` transkrip id 3 diturunkan, `GET /api/transcripts?depth=0` berubah dari `totalDocs = 3` menjadi `totalDocs = 2`, dan `GET /api/transcripts/3?depth=0` mengembalikan 404. Transkrip id 1 dan 2 tetap dapat dibaca dengan body masing-masing 67 dan 99 karakter. Uji dua arah juga lolos: setelah id 3 dinaikkan kembali menjadi terverifikasi, `totalDocs` kembali menjadi 3.

Redaksi T1.3g tetap bekerja: body seed id 2 berisi `[SEED] Sari Ningsih menjelaskan...`, sedangkan REST anonim mengembalikan `Ibu S.N. menjelaskan...`; nama asli hilang tanpa membuang `[SEED]` maupun sisa kalimat.

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
