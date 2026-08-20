# ARCHITECTURE — Arsip Hidup Indonesia
**Versi:** 0.4 · **20 Agustus 2026** · Stack final: Payload 3 + SQLite + Astro SSG + Cloudflare R2.

---

## 1. Prinsip arsitektural

1. **Pisahkan bidang publik dan bidang admin secara fisik.** Ini pelajaran termahal dari British Library: estate yang kompleks dan saling terhubung membuat satu titik masuk (server akses jarak jauh tanpa MFA) merambat ke seluruh sistem, dan sebagian server dihancurkan sehingga pemulihan dari backup terhambat. Untuk kita: permukaan publik idealnya adalah file statis yang tidak punya kredensial apa pun ke database.
2. **Yang tidak ada di server tidak bisa dicuri.** Consent form dan biodata narasumber tidak masuk aplikasi. Titik.
3. **Website adalah salinan penyajian, bukan repositori pelestarian.** Master file hidup terpisah dan harus selamat kalau website hilang total.
4. **Konten inti ada di HTML awal.** Bukan preferensi gaya — syarat mutlak SEO + GEO (crawler AI umumnya tidak mengeksekusi JavaScript).
5. **Platform, bukan situs proyek.** Struktur `collection → archive_item → asset` sejak baris pertama, bukan tabel `batik_pekalongan`.
6. **Admin non-teknis harus mandiri** (PKS Pasal 2.7.f) — CMS betulan, bukan Markdown di Git.

## 2. Arsitektur terpilih (diputuskan 20 Agustus 2026)

**Payload 3 + SQLite di satu VPS kecil sebagai CMS headless; front-end publik Astro statis di Cloudflare Pages.**

```
                         Cloudflare (DNS, WAF, CDN, bot mgmt)
                                    |
        +---------------------------+---------------------------+
        |                                                       |
  [ BIDANG PUBLIK ]                                     [ BIDANG ADMIN ]
  Astro SSG -> HTML statis                              api.arsiphidup.id
  di Cloudflare Pages                                   VPS 2 GB
  TANPA kredensial DB                                     |- Payload 3 (Node 22)
  TANPA koneksi ke VPS                                    |- SQLite (satu file)
        |                                                 |- Caddy
        |  <--- build-time fetch ------------------------- |
        |  <--- webhook rebuild -------------------------- |
        |
  [ Cloudflare R2 - S3-compatible ]
   bucket publik   -> media publik via cdn.arsiphidup.id
   bucket privat   -> materi TERBATAS, presigned URL saja
```

### 2.1 Kenapa susunan ini

**Publik tidak pernah menyentuh VPS.** Ini bukan optimasi performa, ini profil kegagalan. Proyek ini didanai satu tahun dari bantuan dinas dan mungkin tidak dilanjutkan. Kalau VPS berhenti dibayar, build statis terakhir **tetap dilayani Cloudflare Pages tanpa batas waktu** — arsipnya tetap online dan tetap terindeks. Yang berhenti hanyalah kemampuan menambah konten.
Payload yang melayani situs secara langsung (SSR) akan mati bersama VPS-nya. Itu perbedaan antara "proyek berhenti berkembang" dan "arsip hilang dari internet".

**SQLite, bukan Postgres atau MySQL.**
- Payload 3 resmi mendukung MongoDB, Postgres, dan SQLite. **MySQL tidak didukung** — jadi "Payload di shared hosting dengan MySQL" bukan opsi yang ada.
- SQLite menghilangkan satu layanan yang harus dijalankan, dipantau, di-patch, dan di-backup. Untuk tim tanpa DBA, itu pengurangan risiko nyata.
- **Backup = menyalin satu file.** Orang non-teknis bisa diajari melakukannya dalam satu menit. Backup yang bisa dijalankan orang awam adalah backup yang benar-benar dijalankan.
- Beban baca situs ini ditangani oleh HTML statis, bukan database. SQLite hanya melayani panel admin dan beberapa endpoint — jauh di bawah batas kemampuannya.

**Object storage: Cloudflare R2, bukan MinIO self-host.** Menjalankan MinIO di VPS 2 GB berarti menaruh master media di disk yang sama dengan aplikasi, dan menambah beban backup yang berat. R2 memberi API S3 yang sama, presigned URL yang sama, tanpa egress fee, dan terpisah dari server aplikasi.

**Login email + password + MFA** untuk admin — persyaratan yang menutup opsi CMS berbasis Git (Decap/Sveltia login lewat akun GitHub; jalur email-password lamanya, Netlify Identity/Git Gateway, sudah tidak tersedia untuk situs baru dan tidak layak dijadikan fondasi).

### 2.2 Yang harus diterima sebagai konsekuensi
| Konsekuensi | Catatan |
|---|---|
| Jeda publish 1–3 menit (build statis) | Bukan CMS instan. Untuk arsip, ini nyaris tidak terasa; untuk ralat mendesak, terasa |
| Biaya VPS ± Rp 180–250 rb/bulan | Di luar PKS Pasal 3.2.l. Masuk Addendum I. Menjadi tanggungan owner setelah tahun ke-1 |
| Ada server yang harus di-patch | Mitigasi: komponen sedikit, Docker, update terjadwal (RULES O-3) |
| Halaman dinamis terbatas | Pencarian, filter, dan direktori dilayani dari indeks statis; hanya auth, permohonan akses, dan presigned URL yang memanggil API |

### 2.3 Alternatif yang dipertimbangkan dan ditolak
| Opsi | Alasan ditolak |
|---|---|
| WordPress + MySQL di shared hosting | Paling sesuai anggaran dan paling akrab bagi admin, tapi profil abandon-nya terburuk: WordPress tanpa update akan terkompromi dalam 1–2 tahun, dan situs arsip berubah menjadi liabilitas. Tier TERBATAS juga tidak boleh dilayani dari sana |
| Astro statis murni + CMS berbasis Git | Paling murah dan paling tahan ditinggalkan, tapi login butuh akun GitHub. Ditolak atas permintaan eksplisit PIHAK KEDUA: admin harus email + password |
| Payload + Postgres | Menambah satu layanan tanpa manfaat pada skala ini. Postgres baru menang di atas ratusan ribu baris atau concurrency tinggi — keduanya tidak berlaku di sini |
| Payload SSR melayani situs langsung | Publish instan, tapi hidup-matinya situs terikat pada VPS. Bertentangan dengan realita pendanaan satu tahun |

### 2.4 Jalan keluar kalau VPS berhenti dibayar
Ini harus direncanakan sekarang, bukan saat terjadi:
1. Situs statis tetap online di Cloudflare Pages (gratis). Tidak ada tindakan diperlukan.
2. Isi database diekspor berkala ke JSON + Markdown ke dalam repo (DEVOPS §6). Repo menjadi salinan arsip yang bisa dibaca manusia tanpa perangkat lunak apa pun.
3. Media publik di R2 tetap dilayani; master di penyimpanan pelestarian terpisah.
4. Untuk melanjutkan penyuntingan: clone repo, jalankan `docker compose up`, pulihkan file SQLite. Perkiraan waktu < 1 jam bagi developer mana pun.

## 3. Komponen

| Lapis | Teknologi | Alasan |
|---|---|---|
| Edge | Cloudflare | WAF, rate limit, cache, bot management. Wajib dicek: preset bot Cloudflare dapat memblokir crawler AI — lihat GEO.md §5 |
| Front-end publik | Astro 5 (SSG), islands untuk peta/player/filter | HTML nyata by default; JS hanya di komponen yang perlu |
| CMS/API | Payload 3 (Node 22), Docker | Admin UI siap pakai, auth email+password+MFA bawaan, akses kontrol per-field, model konten = sumber kebenaran skema |
| Database | SQLite (Drizzle via `@payloadcms/db-sqlite`) | Satu file. Backup = salin file. Tanpa layanan tambahan. FTS5 untuk pencarian transkrip |
| Object storage | Cloudflare R2 (S3 API) | Presigned URL berbatas waktu = kontrol akses nyata untuk tier TERBATAS. Tanpa egress fee, terpisah dari server aplikasi |
| Media publik | R2 bucket publik via `cdn.arsiphidup.id` | |
| Peta | MapLibre GL + tile OSM/MapTiler | Hindari lock-in Google Maps; SSR fallback berupa daftar lokasi HTML |
| Audio publik | SoundCloud embed (PKS 2.5.b) — façade juga | |
| Video publik | YouTube nocookie + façade | |
| Video terbatas | R2 + HLS + presigned | |
| Email transaksional | Resend/Postmark, domain terverifikasi (SPF/DKIM/DMARC) | Notifikasi permintaan akses tidak boleh masuk spam |
| Observability | Uptime Kuma + log terpusat + Plausible (self-host, cookieless) | Analytics tanpa cookie = tanpa banner consent yang merusak GEO |

## 4. Video Embedding Architecture

Ini bagian yang paling sering dibangun salah. Spesifikasi implementasi di `VIDEO_EMBED.md`; di sini arsitekturnya.

### 4.1 Satu abstraksi, tiga backend
```
                        <ArsipPlayer item={...} />
                                  |
                    +-------------+--------------+
                    |             |              |
              YouTubeFacade   MinioHls     DownloadOnly
              (tier PUBLIK)  (tier TERBATAS)  (fallback)
```
Halaman **tidak pernah** memanggil YouTube langsung. Halaman memanggil `<ArsipPlayer>`, yang membaca `video_source` dari data dan memilih backend. Konsekuensi praktis: kalau YouTube mengubah kebijakan lagi (dan mereka sudah melakukannya dua kali — `showinfo` 2018, `modestbranding` 2023), yang diganti satu komponen, bukan ratusan halaman.

### 4.2 Alur façade (tier PUBLIK)
```
1. Server render: <div data-yt="VIDEO_ID"> + <img thumbnail dari CDN SENDIRI> + tombol Play
   -> 0 request ke domain Google. 0 cookie. ~2 KB, bukan ~1,3 MB.
2. Thumbnail DISALIN saat ingest ke R2/CDN kita.
   JANGAN hotlink i.ytimg.com — itu request ke Google sebelum consent, dan
   membocorkan bahwa pengguna membuka halaman ini.
3. User klik Play
   -> catat AuditLog (async, non-blocking)
   -> inject <iframe src="https://www.youtube-nocookie.com/embed/ID?...&autoplay=1">
      dengan sandbox tanpa allow-popups
   -> muat YouTube IFrame API, pasang kontrol kustom (controls=0)
4. Timeout 5 dtk tanpa event onReady -> render panel fallback (PRD VP-10)
```

### 4.3 Alur tier TERBATAS

> **Ditambahkan v0.4:** halaman pemutaran tier terbatas berada di aplikasi Payload
> (`api.arsiphidup.id/arsip/…`), bukan di situs statis — situs statis tidak punya sesi
> dan tidak bisa mengautentikasi siapa pun. Situs publik hanya menampilkan metadata,
> transkrip, dan kartu "Ajukan akses". Lihat VIDEO_EMBED §5.4.

```
Peneliti login -> punya AccessGrant aktif & belum kedaluwarsa
  -> GET /api/media/{asset_id}/signed
  -> server cek: grant valid? asset dalam cakupan grant? item tidak di-embargo?
                 narasumber tidak menarik izin?
  -> terbitkan presigned URL R2, TTL 300 detik, sekali pakai per sesi
  -> pemutar HLS memakai URL itu
  -> AuditLog: siapa, aset apa, kapan, IP ter-hash
```
Catatan jujur: presigned URL berumur 5 menit tetap bisa disalin dalam 5 menit itu. DRM sungguhan di luar anggaran dan di luar akal untuk arsip budaya. Yang kita dapat adalah **akuntabilitas** (kita tahu siapa mengunduh apa) dan **pencabutan** (grant kedaluwarsa), bukan pencegahan mutlak. Watermark forensik per-sesi bisa ditambahkan nanti kalau perlu.

### 4.4 Yang TIDAK ada di arsitektur ini, dan alasannya
- **Proxy video YouTube lewat server kita.** Menabrak ToS, boros bandwidth, dan tetap bisa ketahuan. Ditolak.
- **Overlay CSS penutup logo/tombol YouTube.** Melanggar ToS, nol nilai keamanan. Ditolak (PRD B-4).
- **`sandbox="allow-scripts allow-same-origin"` sebagai fitur keamanan.** Perlu diluruskan: karena iframe berasal dari origin lain (youtube-nocookie.com), `allow-same-origin` **tidak** memberi iframe akses ke halaman kita. Yang benar-benar berguna dari sandbox di kasus ini adalah apa yang **tidak** kita berikan: tanpa `allow-popups` (blokir buka tab YouTube) dan tanpa `allow-top-navigation` (blokir iframe membajak halaman induk). Perhatian: sandbox dapat mematahkan fullscreen dan Cast — wajib diuji, dan izinnya diberikan lewat atribut `allow="fullscreen; encrypted-media; picture-in-picture"`, bukan lewat sandbox.

## 5. Model data konseptual
```
Collection (1) ──< ArchiveItem (n) ──< Asset (n)
                        │                  └─ tier: public | restricted
                        ├──< Transcript
                        ├──> Narasumber (n:m, via ItemContributor)
                        ├──> Tema/Tag (n:m)
                        └──> Lokasi

Narasumber ──> ConsentRecord (REF SAJA — dokumen fisik di luar sistem)
Story (editorial) ──> mengutip ──> ArchiveItem (n:m)
AccessRequest ──> AccessGrant ──> cakupan: Collection | ArchiveItem | Asset
User ──> AuditLog
BatikBusiness (direktori) ──> Lokasi, opsional ──> Narasumber
```
Detail field: `SCHEMA.md`.

## 6. Batas keamanan
| Zona | Isi | Kontrol |
|---|---|---|
| Publik | HTML statis, media publik | Cache CDN, tanpa kredensial |
| API | Form, pencarian, auth | Rate limit, validasi input, CORS ketat |
| Admin | CMS | Allowlist IP/Cloudflare Access + MFA wajib |
| Data terbatas | Bucket privat R2 | Presigned saja; tidak pernah publik |
| Rahasia | Consent, biodata | **Di luar sistem.** Enkripsi at-rest, penyimpanan offline |

## 7. Strategi build & invalidasi
Publish/unpublish di CMS → webhook → build Astro (~1–3 menit untuk <2.000 halaman) → deploy atomic. Konten yang berubah cepat (jumlah kunjungan, status permintaan akses) diambil client-side; tidak boleh memicu rebuild.
Batas skala: di atas ~5.000 halaman, SSG mulai lambat → pindah ke ISR/SSR bercache. Jangan optimasi ini sekarang.

## 8. Utang teknis yang sengaja diambil
1. Pencarian publik memakai **Pagefind** (indeks statis, dibangun saat build) dan SQLite **FTS5** di sisi admin. Keduanya akan terasa kurang untuk kueri fuzzy bahasa Jawa–Indonesia bercampur. Diterima; Elasticsearch tidak sepadan biayanya di skala ini.
2. Belum ada IIIF untuk foto arsip. Standar warisan budaya, tapi Fase 2.
3. Belum ada OAI-PMH / integrasi katalog nasional. Fase 3 — penting untuk kredibilitas institusional.
4. i18n hanya kerangka, konten EN minim.
