# DEVOPS — Arsip Hidup Indonesia
**Versi:** 0.3 · 20 Agustus 2026 · Repo: `github.com/novis97/arsip-hidup` · Owner: `novis97@gmail.com`

---

## 0. Biaya — angka yang harus disepakati sebelum go-live

Anggaran PKS Rp 8.600.000 mencakup domain + hosting + maintenance 1 tahun (Pasal 3.2.l–m). Stack terpilih membutuhkan VPS dan object storage yang tidak tercakup di dalamnya (PKS Pasal 11.3 mengantisipasi ini, tapi harus disepakati terpisah lewat Addendum I).

| Komponen | Perkiraan / bulan | Catatan |
|---|---|---|
| VPS 2 GB / 1–2 vCPU / 40 GB SSD (Jakarta/Singapura) | Rp 150.000 – 250.000 | Hanya melayani Payload + SQLite + build. Bukan trafik publik |
| Cloudflare Pages (situs publik) | **Rp 0** | Tanpa batas praktis untuk situs statis |
| Cloudflare R2 | Rp 0 – 120.000 | 10 GB pertama gratis; tanpa egress fee |
| Backup offsite (bucket penyedia berbeda) | Rp 30.000 – 80.000 | |
| Email transaksional | Rp 0 – 150.000 | Tier gratis cukup di awal |
| Domain `.id` | ~Rp 250.000 / tahun | |
| **Total** | **± Rp 180.000 – 600.000 / bulan** | |

Rentangnya jauh lebih sempit daripada rancangan sebelumnya karena dua keputusan: trafik publik pindah ke Cloudflare Pages (gratis), dan object storage pindah ke R2 yang tidak menagih egress. Variabel yang tersisa hanyalah volume media.

Perkiraan volume: satu wawancara 60 menit pada 2 Mbps ≈ 900 MB. Enam puluh dua wawancara ≈ 55 GB master, ditambah turunan HLS dan foto RAW — realistis 150–300 GB. **Master tidak disimpan di R2 maupun VPS** (lihat §6), jadi yang benar-benar dibayar hanyalah turunan yang dilayani ke pengguna: perkiraan 20–60 GB.

**Yang harus dikatakan sekarang, bukan di bulan ke-13:** biaya ini menjadi tanggungan PIHAK PERTAMA setelah tahun pertama (PKS Pasal 11.4). Bedanya dengan rancangan lama: **kalau biaya ini berhenti dibayar, situs publiknya tidak mati.** Cloudflare Pages terus melayani build terakhir, domain tetap perlu diperpanjang, dan yang hilang hanya panel admin. Itu jaring pengaman yang sengaja dibangun untuk proyek berdana satu tahun — tapi bukan alasan untuk tidak menganggarkan. Kehilangan domain tetap berarti kehilangan seluruh tautan yang sudah tersebar (PKS Pasal 11.7); pertimbangkan membayar domain 3–5 tahun di muka selagi dana hibah masih ada.

## 1. Lingkungan
| Env | URL | Data | Akses |
|---|---|---|---|
| Local | `localhost` | seed fiktif | dev |
| Staging | `staging.arsiphidup.id` | seed fiktif — **tidak boleh data narasumber asli** | basic auth + `noindex` |
| Produksi | `arsiphidup.id` | nyata | publik + admin di-allowlist |

Staging yang berisi data asli dan terindeks adalah salah satu cara paling umum arsip membocorkan data. `X-Robots-Tag: noindex` di level server, bukan hanya meta tag.

## 2. Struktur repo (monorepo)
```
arsip-hidup/
├─ apps/
│  ├─ web/          Astro — situs publik
│  └─ cms/          Payload 3 + SQLite — admin + API
├─ packages/
│  ├─ ui/           komponen bersama (termasuk ArsipPlayer)
│  ├─ schema/       tipe + validasi Zod bersama
│  └─ config/       eslint, tsconfig, tailwind
├─ infra/
│  ├─ docker/       Dockerfile, compose
│  ├─ caddy/        reverse proxy + header keamanan
│  └─ scripts/      backup, restore, ingest media
├─ docs/            11 file blueprint ini
└─ .github/workflows/
```

## 3. Git & branching
- `main` dilindungi: butuh PR + 1 approval + CI hijau. Tanpa force push.
- `dev` = integrasi → auto-deploy ke staging.
- `feat/*`, `fix/*`, `chore/*`. Squash merge.
- Conventional Commits; tag `v0.x.y`.
- CODEOWNERS untuk `infra/`, `docs/`, dan `apps/web/src/components/player/` — komponen pemutar tidak boleh diubah tanpa review. Komponen sengaja berada di aplikasi web karena hanya ada satu front-end; tidak ada workspace `packages/ui`.
- **Repo privat sampai go-live.** Setelah itu, pertimbangkan membuka kodenya (bukan datanya) — arsip publik yang kodenya terbuka mendapat kepercayaan dan kontribusi. Tapi audit dulu riwayat commit untuk secret yang pernah ter-commit.

## 4. CI/CD (GitHub Actions)
```yaml
# .github/workflows/ci.yml — dijalankan pada setiap PR
jobs:
  quality:   typecheck · eslint · prettier --check
  test:      unit (vitest) · integration API
  security:  npm audit --audit-level=high · gitleaks · CodeQL
  build:     build web + cms; gagal bila bundle > 400 KB (gzip)
  e2e:       playwright — smoke 6 halaman kunci
  facade:    uji HAR — GAGAL bila ada request ke youtube.com/ytimg.com sebelum klik Play
  a11y:      axe-core pada 5 halaman; gagal pada pelanggaran serious/critical
  headers:   verifikasi CSP, HSTS, X-Content-Type-Options di build preview
```
Gate `facade` dan `headers` sengaja dijadikan pemblokir. Keduanya adalah jenis regresi yang mustahil terdeteksi lewat review mata dan pasti terjadi kalau tidak diotomatiskan.

**Deploy:** `dev` → staging otomatis · tag `v*` → produksi (butuh persetujuan manual di GitHub Environments). Deploy atomik; rollback = deploy ulang tag sebelumnya (target < 5 menit).

## 5. Infrastruktur
```
Cloudflare (DNS, WAF, cache, rate limit, bot control)
   |
   |-- arsiphidup.id         -> Cloudflare Pages (Astro statis)      [publik]
   |-- cdn.arsiphidup.id     -> R2 bucket publik                     [publik]
   |-- media.arsiphidup.id   -> R2 bucket privat, presigned saja     [terbatas]
   `-- api.arsiphidup.id     -> VPS                                  [admin]
                                 |- Caddy (TLS otomatis, header keamanan)
                                 |- Payload 3 (Docker)
                                 |- SQLite (satu file, volume terpisah)
                                 `- Uptime Kuma + Plausible
```
- Docker Compose. Kubernetes tidak dibutuhkan dan akan menjadi beban bagi siapa pun yang mewarisi proyek ini.
- **Tidak ada Postgres, tidak ada MinIO, tidak ada Redis.** Setiap layanan yang tidak dijalankan adalah layanan yang tidak perlu di-patch, dipantau, atau dipulihkan.
- Firewall: hanya 80/443 terbuka. SSH via key + port non-standar + fail2ban.
- **Panel admin (`/admin`) hanya lewat Cloudflare Access** di atas login email+password+MFA Payload. Dua lapis, karena panel admin adalah satu-satunya permukaan bernilai tinggi yang tersisa.
- File SQLite berada di volume Docker terpisah dengan izin ketat, tidak pernah di dalam direktori yang dilayani web. Uji: `curl https://api.arsiphidup.id/payload.db` harus 404.

## 6. Backup & pelestarian — dua hal berbeda

Ini bagian terpenting di dokumen ini. Pisahkan dua konsep yang sering dicampur:

**Backup operasional** (agar situs bisa pulih):
- **SQLite: `sqlite3 payload.db ".backup /backup/payload-$(date +%F).db"` harian**, retensi 30 hari. Jangan menyalin file saat aplikasi berjalan tanpa perintah `.backup` — hasilnya bisa korup.
- **Ekspor konten harian ke JSON + Markdown, di-commit ke repo privat.** Ini bukan duplikasi backup: file SQLite butuh perangkat lunak untuk dibaca, JSON/Markdown bisa dibaca manusia sepuluh tahun lagi tanpa apa pun. Untuk arsip, ini yang sesungguhnya penting.
- R2: replikasi harian ke bucket di **penyedia berbeda**.
- Konfigurasi & secret: terenkripsi (age/sops), disimpan terpisah dari repo.
- **Salinan offsite bersifat immutable / write-once**, dan kredensial produksi tidak boleh punya hak menghapusnya. Ini pelajaran langsung dari British Library: backup yang ada tapi tidak bisa dipulihkan karena infrastrukturnya ikut hancur sama saja dengan tidak ada backup.
- **Uji restore setiap kuartal, tercatat tanggal dan hasilnya.** Backup yang belum pernah direstorasi berstatus asumsi.

**Pelestarian digital** (agar arsipnya selamat 30 tahun):
- Master file (video asli, audio master, foto RAW) mengikuti aturan 3-2-1: 3 salinan, 2 media berbeda, 1 offsite, minimal satu offline.
- Master **tidak berada di server web.** Website adalah salinan penyajian.
- Checksum SHA-256 tercatat (SCHEMA §3) dan diverifikasi berkala — bit rot itu nyata pada penyimpanan jangka panjang.
- Format terbuka untuk pelestarian: video FFV1/MKV atau H.264/MP4 kualitas tinggi, audio WAV/FLAC, foto TIFF/DNG, metadata Dublin Core dalam CSV/XML.
- **Titipkan salinan ke lembaga.** Perpusnas, arsip universitas, atau repositori seperti Zenodo. Proyek berbasis satu VPS dan satu kartu kredit bukanlah rencana pelestarian, sebagus apa pun teknisnya.

## 7. Pemantauan
- Uptime Kuma: beranda, API, `/sitemap.xml`, kedaluwarsa sertifikat, kedaluwarsa domain.
- Log terpusat **di luar VPS aplikasi**. Kalau server dienkripsi ransomware, lognya ikut hilang.
- Peringatan: error 5xx > 1%, lonjakan `login.failed`, penerbitan presigned URL abnormal, unduhan massal satu grant, disk > 80%, backup gagal.
- Plausible self-host (cookieless) — analytics tanpa banner consent.
- Laporan bulanan otomatis ke PIHAK PERTAMA: uptime, trafik, permohonan akses, status backup, dependensi tertunggak.

## 8. Alur ingest media (sering dilupakan sampai jadi macet)
```
1. Bahan lapangan masuk ke staging drive
2. Verifikasi checksum, catat di lembar akuisisi
3. Master → penyimpanan pelestarian (bukan server web)
4. Turunan:
   - Story clip & Highlight → upload ke YouTube (channel resmi) → catat youtube_id
   - Thumbnail → render sendiri, unggah ke cdn.arsiphidup.id  (JANGAN hotlink ytimg)
   - Highlight mirror → R2 bucket publik (untuk fallback)
   - Video penuh → R2 bucket privat + transcode HLS
   - Foto pilihan → WebP/AVIF beberapa ukuran, EXIF dibersihkan
5. Transkripsi (ASR) → koreksi manusia → is_verified = true
6. Entri metadata di CMS → cek consent → publish
```
Langkah 5 adalah leher botol nyata. Rencanakan siapa yang mengoreksi transkrip dan berapa jam per wawancara (perkiraan realistis: 3–5× durasi rekaman untuk bahasa campuran Indonesia–Jawa). Kalau tidak direncanakan, transkrip tidak akan pernah ada — dan bersama itu hilang aset SEO/GEO terbesar situs ini.

## 9. Serah terima (PKS Pasal 2.10 & 9)
- Kepemilikan akun: domain, VPS, Cloudflare, GitHub, YouTube, R2 **atas nama PIHAK PERTAMA**, bukan atas nama developer. Ini menyelamatkan proyek ketika kerja sama berakhir.
- Diserahkan: kredensial (via password manager, bukan WhatsApp), runbook, 11 file blueprint, rekaman pelatihan admin, kalender perpanjangan dengan estimasi biaya.
- Sesi pelatihan: menambah arsip, menambah cerita, mengelola direktori, meninjau permohonan akses, memeriksa backup.
- **Dokumen "apa yang harus dilakukan kalau website mati"** dicetak, satu halaman, disimpan offline.

## 10. Runbook (ringkas)
| Situasi | Langkah pertama |
|---|---|
| Situs publik down | Cek status Cloudflare Pages **lebih dulu** — situs publik tidak bergantung pada VPS, jadi VPS mati bukan penyebabnya |
| Panel admin down | VPS hidup? → `docker compose ps` → log Caddy → cek izin file SQLite |
| Deploy rusak | Rollback ke tag sebelumnya (< 5 menit), baru cari sebabnya |
| Disk penuh | Rotasi log → pangkas turunan media lama → **jangan pernah hapus master** → `VACUUM` SQLite |
| Video tidak main | Cek CSP (`script-src` mencakup `www.youtube.com`?) → cek `youtube_id` → cek panel fallback muncul |
| Dugaan kompromi | Isolasi dulu, snapshot bukti, baru bersihkan. Ikuti SECURITY §11 |
| Narasumber menarik izin | Set `withdrawal_requested` → unpublish otomatis → konfirmasi ≤ 7 hari kerja |
