# PRD — Website Arsip Hidup Indonesia
**Versi:** 0.4 · **Tanggal:** 21 Agustus 2026 · **Repo:** github.com/novis97/arsip-hidup · **Owner:** novis97@gmail.com
**Status:** B-1 SELESAI. B-2..B-5 masih terbuka. Scaffolding disetujui untuk dimulai dengan asumsi tercatat di Bagian 0.

---

## 0. Keputusan terbuka & terselesaikan

Bagian ini sengaja ditaruh paling depan. Status per 20 Agustus 2026: **B-1 selesai**; B-2 sampai B-5 masih terbuka dan tiap harinya menambah biaya rework.

### B-1. Domain — ✅ SELESAI (diputuskan 20 Agustus 2026)
**Domain kanonik: `arsiphidup.id`.** Dikonfirmasi PIHAK KEDUA, konsisten dengan `Garis_Besar_menu.pdf` yang menyebut `WWW.ARSIPHIDUP.ID`.

Catatan arsip keputusan: brief awal menyebut `arsip-hidup.go.id`. Opsi itu gugur karena `.go.id` hanya dapat didaftarkan oleh instansi pemerintah pusat/daerah dengan surat permohonan dari pimpinan instansi, sementara PIHAK PERTAMA dalam PKS bertindak "untuk dan atas nama pribadi".

Konsekuensi yang sudah diterapkan di 11 file ini:
- Canonical, `hreflang`, sitemap, OG URL → `https://arsiphidup.id`
- Subdomain: `cdn.arsiphidup.id` (media publik), `api.arsiphidup.id` (CMS/API), `media.arsiphidup.id` (HLS terbatas), `staging.arsiphidup.id`
- CSP, CORS, dan `origin=` pada IFrame API mengacu ke `https://arsiphidup.id`
- `llms.txt`, `robots.txt`, dan seluruh JSON-LD `@id` memakai domain yang sama

**Aturan turunan:** domain didaftarkan **atas nama PIHAK PERTAMA**, bukan atas nama pelaksana (DEVOPS §9). Perpanjangan diingatkan H-60 dan H-30 (RULES O-2) — kehilangan domain berarti kehilangan seluruh ekuitas SEO dan setiap tautan yang sudah tersebar ke jurnal serta artikel (PKS Pasal 11.7).

### B-2. Ruang lingkup brief ≫ ruang lingkup PKS — HIGH
PKS No. 001/PKS-WEB/ARSIPHIDUP/2026 senilai **Rp 8.600.000** (Pasal 3) mencakup: website CMS, direktori, peta, artikel gratis+premium, embed YouTube/SoundCloud, SEO dasar, keamanan dasar, domain + hosting + maintenance 1 tahun.
Brief ini meminta tambahan: custom video player berbasis IFrame API, object storage terpisah (R2), AuditLog, CSP berlapis, workflow permintaan akses peneliti, GEO/AEO — ditambah VPS untuk Payload yang diputuskan pada 20 Agustus 2026.
Semua itu masuk kategori **Pasal 14 — Pekerjaan Tambahan** (khususnya 14.2.a "penambahan fitur baru" dan 14.2.j "migrasi server"). VPS dan object storage juga menabrak Pasal 11.3: kebutuhan penyimpanan/traffic di luar paket awal ditanggung terpisah.

Catatan yang menguntungkan posisi Anda: stack terpilih **mengembalikan** kemampuan login, konten terbatas, dan panel admin mandiri — artinya PKS Pasal 2.6 dan 2.7 tetap terpenuhi, bukan dikorbankan. Addendum ini menambah biaya infrastruktur, bukan menghapus lingkup yang sudah dibayar.
**Aksi:** buat Addendum I yang mencantumkan lingkup tambahan + biaya + perpanjangan timeline sebelum Tahap 2. Estimasi beban tambahan ada di ROADMAP §7.

### B-3. Kontradiksi misi: "konten premium/berbayar" vs arsip lisan beretika — HIGH
- PKS Pasal 2.6 mewajibkan fitur **artikel premium/berbayar** dan "arsip budaya berbayar".
- Garis Besar Menu Prinsip 4 justru menyatakan akses lebih dalam **hanya lewat izin**, dan consent penelitian harus diminta ulang secara independen oleh peneliti; tim website berperan sebagai fasilitator, demi menjamin privasi narasumber.
- Menu "Berpartisipasi" menulis **"Donate (someday)"** — bukan model jual konten.

Menjual akses ke materi wawancara adalah masalah, bukan sekadar soal selera: narasumber memberi consent untuk pengarsipan dan pendidikan, hampir pasti bukan untuk komersialisasi rekaman hidupnya. Referensi wajib Anda, National Life Stories (BL), berjalan sejak 1987 dan pendanaannya berasal dari sponsorship, hibah, donasi, dan kerja sukarela — bukan penjualan akses rekaman.
**Keputusan default blueprint ini:** paywall **tidak diterapkan pada materi arsip (video/audio/foto/transkrip narasumber)**. Mesin "konten terbatas" tetap dibangun (memenuhi PKS 2.6 secara teknis), tapi dipakai untuk: (a) publikasi turunan — laporan riset, esai kurasi, e-book; (b) tier dukungan/donasi; (c) gating akses peneliti berbasis persetujuan, bukan pembayaran. Jika PIHAK PERTAMA tetap ingin menjual akses arsip, itu keputusan sadar yang harus tertulis dan harus tercermin di form consent versi baru.

### B-4. "User tidak pernah keluar ke youtube.com" tidak bisa dijamin, dan cara yang Anda minta melanggar ToS YouTube — HIGH
Detail lengkap di `VIDEO_EMBED.md §2`. Ringkas:
- `modestbranding=1` **sudah tidak berfungsi sejak 15 Agustus 2023**. YouTube menonaktifkannya; logo tetap tampil apa pun parameternya.
- `rel=0` **tidak menghilangkan video lain** sejak September 2018 — hanya membatasi rekomendasi ke channel yang sama.
- Menutup logo YouTube dan tombol "Watch on YouTube" dengan CSS overlay melanggar YouTube API Services Terms of Service, yang melarang memodifikasi, menimpa, atau memblokir bagian/fungsi player. Risikonya bukan teoretis: channel dan akses embed bisa dicabut — artinya seluruh arsip video hilang dari situs sekaligus.
- Overlay CSS juga bukan keamanan. Klik kanan, view-source, atau DevTools tetap menampilkan video ID.

**Keputusan default blueprint ini:** dua tier video (lihat §5.4). Materi publik → YouTube dengan façade pattern (legal, privasi-aman, cepat). Materi terbatas/sensitif → **tidak di YouTube sama sekali**, tapi disimpan di bucket privat R2 dengan presigned URL. Ini sekaligus menyelesaikan B-5 — dan justru satu-satunya cara "tidak pernah keluar ke domain kami" benar-benar tercapai.

### B-5. YouTube unlisted bukan kontrol akses — HIGH
Kalau video wawancara panjang di-upload sebagai *unlisted*, siapa pun yang tahu ID-nya bisa menonton selamanya, tanpa login, tanpa audit, tanpa bisa dicabut per-orang. Ini bertentangan langsung dengan Prinsip 4 Garis Besar Menu. Materi tier terbatas **wajib** self-host.

---

## 1. Ringkasan Produk

**Arsip Hidup Indonesia adalah platform arsip sejarah lisan yang mendokumentasikan pengetahuan, kehidupan, dan praktik pelaku budaya Indonesia, dan membukanya sebagai pintu masuk bagi peneliti serta publik.**

Kalimat di atas adalah definisi entitas resmi. Dipakai identik di `<meta description>`, blok Ringkasan homepage, JSON-LD `description`, dan `llms.txt` (alasan: GEO §3).

- **Proyek pertama:** Batik Tulis Pekalongan.
- **Prinsip arsitektural terpenting (dari Prinsip 5 Garis Besar Menu):** platform, bukan situs proyek tunggal. Batik Tulis Pekalongan adalah `collection` pertama; struktur data, URL, dan menu harus menampung koleksi berikutnya tanpa refactor.
- **Keseimbangan manusia–artefak (Prinsip 1):** narasumber adalah entitas kelas satu di data model, sejajar dengan artefak/pengetahuan. Bukan sekadar metadata "pembicara".

## 2. Tujuan & Non-Tujuan

**Tujuan**
1. Pintu masuk riset: peneliti menemukan materi, memahami cakupannya, lalu mengajukan akses (Prinsip 3 & 4).
2. Pelestarian jangka panjang: master file selamat meski website mati.
3. Ditemukan di Google **dan** dikutip oleh asisten AI (SEO.md + GEO.md).
4. Melindungi narasumber: consent, embargo, hak untuk menarik diri.
5. Bisa hidup dengan biaya rendah dan admin non-teknis (PKS Pasal 2.7.f).

**Non-Tujuan (Fase 1)**
- Bukan platform streaming publik untuk seluruh rekaman mentah.
- Bukan marketplace batik. (Direktori pelaku batik = informasi, bukan transaksi.)
- Bukan LMS. Menu "Belajar" tertulis *future development* di dokumen internal — tetap `future`.
- Bukan aplikasi mobile native.

## 3. Pengguna & Job-to-be-Done

| Persona | JTBD | Konsekuensi produk |
|---|---|---|
| Peneliti (akademisi, mahasiswa S2/S3) | "Apakah arsip ini punya materi tentang topik saya, dan bagaimana saya mengaksesnya?" | Metadata lengkap & terbuka, faceted search, transkrip, alur permintaan akses yang jelas |
| Publik / pembaca umum | "Ceritakan sesuatu yang membuat saya peduli" | Cerita editorial, Story clip, Peta Warna, Timeline |
| Narasumber & keluarga | "Apa yang kalian tampilkan tentang saya, dan bisakah saya ubah?" | Halaman narasumber, kontak, mekanisme koreksi & penarikan |
| Pelaku/pengusaha batik | "Apakah usaha saya terdaftar dan benar?" | Direktori + form koreksi (PKS Pasal 2.4) |
| Mitra & pemberi hibah | "Apakah ini kredibel dan berdampak?" | Halaman Tentang, Metodologi, Etika, Mitra, laporan |
| Admin (non-teknis) | "Saya bisa tambah arsip tanpa developer" | CMS, bukan hardcode |
| Jurnalis | "Angka dan kutipan yang bisa saya pakai" | Blok fakta, press kit |
| Asisten AI (GPTBot/Claude/Perplexity) | "Ekstrak jawaban yang bisa dikutip" | HTML pra-render, transkrip teks, schema |

## 4. Peta Menu (final, dari Garis Besar Menu)

| # | Menu | Slug | Keputusan |
|---|---|---|---|
| 01 | Tentang | `/tentang` | Sub: Cerita Kami, Kenapa Sejarah Lisan, Public History & Shared Authority, Tim, Metodologi, Etika, Mitra, FAQ |
| 02 | Koleksi | `/koleksi` | Index proyek. Fase 1 hanya `batik-tulis-pekalongan` |
| 03 | Jelajah | `/jelajah` | **Keputusan atas pertanyaan terbuka di dokumen:** ini adalah *faceted browse*, bukan halaman terpisah berisi peta demografi. Facet: tema, wilayah, periode, bahasa, jenis materi, narasumber. Kata kunci ditangani oleh pencarian, bukan facet kategorikal. Peta demografi jadi salah satu *view* di dalamnya. Alasan SEO: lihat SEO.md §6 (crawl trap) |
| 04 | Cerita | `/cerita` | Editorial hasil interpretasi arsip. Contoh dokumen: "Ketika Air Rob Datang" |
| 05 | Belajar | `/belajar` | **Tidak dibangun Fase 1.** Tidak ada di nav. Tidak ada halaman kosong "coming soon" (halaman tipis merusak SEO) |
| 06 | Berpartisipasi | `/terlibat` | Volunteer, Partner, Donasi, Submit Cerita, Usul Narasumber, Rekomendasi Karya |
| 07 | Berita | `/berita` | Liputan pihak lain tentang narasumber/proyek. Wajib kutipan pendek + link keluar, bukan salin-tempel artikel orang |
| 08 | Kontak | `/kontak` | |
| 09 | Rekomendasi Karya | — | **Digabung ke `/terlibat#rekomendasi-karya`.** Menjawab pertanyaan terbuka di dokumen: ya, gabungkan. Alasannya bukan selera — dua halaman dengan intent identik ("kirim masukan ke kami") saling mengkanibal kata kunci dan sama-sama jadi halaman tipis. Satu hub, satu anchor |

Nav utama maksimal 6 item: Koleksi · Jelajah · Cerita · Tentang · Terlibat · (search). Berita & Kontak turun ke footer + submenu.

## 5. Kebutuhan Fungsional

### 5.1 Model konten dua lapis (dari Garis Besar Menu)
Hasil dokumentasi menghasilkan dua bentuk turunan. Ini dipetakan langsung ke tier akses:

| Materi | Tier | Di web publik? |
|---|---|---|
| Story (cuplikan beberapa menit) | PUBLIK | Ya |
| Highlight (maks 15 menit) | PUBLIK | Ya |
| Foto arsip pilihan + narasi | PUBLIK | Ya |
| Timeline batik Pekalongan | PUBLIK | Ya |
| Peta Warna Batik Pekalongan | PUBLIK | Ya |
| Metadata (deskriptif) | PUBLIK | Ya — ini justru mesin SEO/GEO-nya |
| Transkrip / ringkasan | PUBLIK by default | Ya, kecuali ada embargo |
| Video lengkap (~60 menit) | TERBATAS | Tidak. Hanya via permintaan akses |
| Audio master | TERBATAS | Tidak |
| Foto RAW | TERBATAS | Tidak |
| **Consent form** | RAHASIA | **Tidak pernah masuk aplikasi web** |
| **Biodata narasumber (NIK, alamat, no. HP)** | RAHASIA | **Tidak pernah masuk aplikasi web** |

Dua baris terakhir bukan negotiable. Consent form dan biodata lengkap adalah data pribadi (sebagian spesifik menurut UU 27/2022 PDP). Menyimpannya di server web yang menghadap internet berarti satu SQL injection = kebocoran identitas puluhan lansia. British Library kehilangan ±600GB termasuk data pribadi pengguna & staf pada serangan Rhysida 28 Oktober 2023, dan data itu dilelang lalu dibuang di dark web. Yang tidak ada di server tidak bisa dicuri. Simpan offline/enkripsi terpisah; aplikasi hanya menyimpan `consent_ref` (kode) dan flag boolean.

### 5.2 Alur Permintaan Akses Peneliti (fitur inti, sering dilupakan)
Mengoperasionalkan Prinsip 4. 6 status: `draft → submitted → under_review → approved | rejected | expired`.
1. Peneliti mengisi form: identitas, afiliasi, tujuan riset, materi yang diminta, rencana publikasi, pernyataan etik.
2. Tim meninjau. Bukan penilaian akademik — penyaringan kelayakan & etika.
3. Jika disetujui: sistem menerbitkan akses **berbatas waktu** (default 30 hari) ke materi tier TERBATAS via signed URL.
4. Sistem **memfasilitasi perkenalan** ke narasumber. Sistem **tidak** memberi kontak narasumber langsung, dan **tidak** mengklaim consent penelitian sudah didapat. Teks eksplisit ditampilkan: consent riset harus diminta ulang secara independen.
5. Semua langkah masuk `AuditLog`.

### 5.3 Direktori Pelaku Batik + Peta (PKS Pasal 2.4)
Field: nama usaha/pelaku, alamat, kontak, deskripsi, foto, jenis batik, tahun berdiri. Peta dengan pin, filter wilayah/kategori/jenis. Halaman detail bisa diakses dari daftar maupun pin.
Catatan privasi: pelaku usaha yang minta tidak ditampilkan kontaknya harus bisa memilih `contact_visibility: public | form_only | hidden`. Direktori usaha ≠ direktori orang.

### 5.4 Video Player Requirement
Spesifikasi teknis penuh: `VIDEO_EMBED.md`. Persyaratan tingkat produk:

- **VP-1** Semua video diputar **di dalam halaman arsiphidup.id**. Tidak ada tautan otomatis ke youtube.com, tidak ada auto-redirect, tidak ada pop-up ke tab baru.
- **VP-2** Sebelum pengguna menekan Play, **nol** request ke server Google. Wajib façade/lite-embed. (Ini kewajiban privasi, dan sekaligus perbaikan LCP.)
- **VP-3** Domain embed wajib `www.youtube-nocookie.com`.
- **VP-4** Iframe di-sandbox **tanpa** `allow-popups` dan **tanpa** `allow-top-navigation`. Ini cara yang sah untuk mencegah pengguna terlempar ke youtube.com: browser memblokir pembukaan tab baru, tanpa kita menutupi elemen player mana pun.
- **VP-5** Kontrol Play/Pause/Volume/Seek kustom lewat YouTube IFrame Player API dengan `controls=0`. Ini jalur yang memang disediakan YouTube, jadi aman dari sisi ToS.
- **VP-6** **DITOLAK:** overlay CSS untuk menutupi logo YouTube / tombol "Watch on YouTube". Melanggar ToS, dan tidak menambah keamanan apa pun. Lihat B-4.
- **VP-7** Materi tier TERBATAS **dilarang** di-upload ke YouTube dalam bentuk apa pun, termasuk unlisted. Self-host, signed URL, HLS.
- **VP-8** Di bawah setiap video wajib ada **transkrip** dan **deskripsi** dalam bentuk teks HTML nyata (bukan gambar, bukan render-JS). Ini syarat GEO sekaligus aksesibilitas WCAG 2.2 AA.
- **VP-9** Setiap event Play tercatat di `AuditLog` dengan identitas ter-pseudonimisasi (lihat SECURITY.md §7).
- **VP-10** Fallback: bila iframe YouTube gagal dimuat dalam 5 detik (diblokir jaringan kampus/instansi, atau YouTube down), tampilkan panel fallback berisi tombol pemutar internal (R2) (untuk materi publik yang punya mirror) atau tombol unduh, plus transkrip yang memang sudah ada di halaman.

### 5.5 Konten Terbatas / Berbayar (PKS Pasal 2.6, dibatasi oleh B-3)
Preview/insight gratis selalu tampil. Konten penuh setelah login/mekanisme akses. Pembayaran bertahap: konfirmasi manual dulu, payment gateway menyusul (PKS 2.6.e — dan biaya PG di luar nilai kontrak, PKS 3.3.b).
Batasan dari B-3: mekanisme ini **tidak** diterapkan ke materi arsip narasumber pada Fase 1.
Catatan SEO: jangan pernah menyajikan HTML penuh ke crawler lalu memotongnya untuk manusia. Itu cloaking. Pakai `isAccessibleForFree: false` + `hasPart` di schema (SEO.md §5).

### 5.6 Pencarian
Dua lapis: **Pagefind** (indeks statis, berjalan di browser) untuk pencarian publik, dan **SQLite FTS5** untuk admin/API. Mencakup judul, ringkasan, deskripsi, transkrip, nama narasumber, dan tag. Bukan Elasticsearch — tidak sepadan untuk <5.000 dokumen. Detail dan keterbatasannya di SCHEMA §17.

### 5.7 Multibahasa
ID sebagai default, EN sebagai terjemahan opsional per-entitas. Struktur URL `/en/...` disiapkan sejak awal (retrofit i18n itu mahal), tapi konten EN Fase 1 hanya untuk: homepage, Tentang, dan abstrak koleksi.

## 6. Kebutuhan Non-Fungsional

| Aspek | Target |
|---|---|
| LCP | < 2,0 dtk (p75, 4G) — façade video adalah alat utamanya |
| CLS | < 0,1 |
| INP | < 200 ms |
| Berat halaman awal | < 400 KB tanpa media |
| HTML tanpa JS | Semua konten inti harus terbaca. Non-negotiable untuk GEO |
| Uptime | 99,5% |
| RPO / RTO | 24 jam / 8 jam (aplikasi). Master arsip: lihat DEVOPS §6 |
| Aksesibilitas | WCAG 2.2 AA. Bukan formalitas — pengguna arsip lisan mencakup lansia dan tuna netra |
| Bahasa | id-ID default, en opsional |
| Browser | 2 versi terakhir Chrome/Safari/Firefox/Edge; Android WebView umum di Jawa Tengah |

## 7. Metrik Sukses (12 bulan)
1. ≥ 40 permintaan akses peneliti masuk, ≥ 60% diproses < 14 hari.
2. ≥ 25 halaman arsip/cerita masuk 10 besar Google untuk kueri long-tail Pekalongan.
3. Terkutip di ≥ 3 mesin jawaban AI untuk kueri "batik tulis pekalongan sejarah lisan" (metode ukur: GEO.md §8).
4. 0 insiden kebocoran data narasumber.
5. Waktu admin menambah 1 arsip lengkap < 20 menit tanpa bantuan developer.
6. ≥ 90% halaman arsip punya transkrip.

## 8. Asumsi & Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Konten belum siap saat website selesai | Situs kosong = mati untuk SEO | PKS Pasal 5.2.b sudah mengaitkan mulai kerja dengan ketersediaan bahan. Minimal 12 arsip + 5 cerita sebelum go-live |
| Anggaran tidak menutup VPS/R2 setelah tahun ke-1 | Panel admin mati; situs publik tetap hidup (ARCHITECTURE §2.4) | Selesaikan B-2 lewat Addendum I; masukkan biaya tahunan ke rencana keberlanjutan |
| YouTube mengubah kebijakan embed lagi | Player rusak | Abstraksi `VideoPlayer` — ganti provider tanpa sentuh halaman |
| Narasumber wafat / keluarga menarik izin | Isu hukum & etika | Flag `withdrawal_requested` + prosedur takedown 7 hari (RULES.md §5) |
| Admin non-teknis meninggalkan celah | Akun jebol | MFA wajib, tanpa pengecualian. Ini persis titik masuk serangan British Library: server akses jarak jauh tanpa MFA |
| Perpanjangan tahun ke-2 tidak dibayar | Situs & domain hilang (PKS Pasal 11.7) | Dana operasional tahunan masuk rencana keberlanjutan, bukan urusan developer |

## 9. Definition of Done (Fase 1)
- Tujuan navigasi Fase 1 terbangun: Tentang, Koleksi, Jelajah, Cerita, Terlibat, Berita, dan Kontak; pencarian tersedia sebagai kontrol navigasi. Belajar dikecualikan, sedangkan Rekomendasi Karya berada di `/terlibat#rekomendasi-karya`.
- Alur permintaan akses berjalan end-to-end
- Video façade lolos uji: 0 request ke domain Google sebelum Play (dibuktikan lewat HAR)
- Semua halaman arsip punya `VideoObject` schema valid + transkrip HTML
- Skor Lighthouse ≥ 90 di keempat kategori pada 5 halaman sampel
- CSP aktif tanpa `unsafe-inline` pada script
- Backup terestorasi minimal sekali dalam uji nyata (bukan sekadar "backup jalan")
- Pelatihan admin + panduan tertulis diserahkan (PKS Pasal 2.10)
