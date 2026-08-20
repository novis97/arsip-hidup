# ROADMAP — Arsip Hidup Indonesia
**Versi:** 0.3 · 20 Agustus 2026
PKS memperkirakan 45–60 hari kerja (Pasal 5.1), dihitung sejak Termin 1 diterima **dan** bahan konten cukup diterima (Pasal 5.2).

---

## 0. Gerbang sebelum Tahap 2 — jangan mulai scaffolding sebelum ini beres

| # | Keputusan | Penentu | Kalau tidak diputuskan |
|---|---|---|---|
| ~~G-1~~ | ✅ **SELESAI** — domain kanonik `arsiphidup.id`, didaftarkan atas nama PIHAK PERTAMA | — | — |
| ~~G-2~~ | ✅ **SELESAI** — Payload 3 + SQLite di VPS kecil, front-end Astro statis, object storage Cloudflare R2 | — | — |
| G-3 | Addendum I untuk lingkup tambahan | Kedua pihak | Sengketa lingkup di Termin 2, persis skenario yang diantisipasi PKS Pasal 8 & 14 |
| G-4 | Materi arsip dijual atau tidak (PRD B-3) | PIHAK PERTAMA | Model data akses, alur pembayaran, dan teks consent bergantung padanya |
| G-5 | Kebijakan crawler pelatihan AI (GEO §0) | PIHAK PERTAMA + etika | Keputusan yang tidak bisa dibatalkan setelah data terlanjur dikumpulkan |
| G-6 | Siapa mengoreksi transkrip, berapa jam, dibayar dari mana | PIHAK PERTAMA | Transkrip tidak pernah jadi; aset SEO/GEO terbesar hilang |
| G-7 | Kepemilikan akun YouTube, domain, hosting atas nama siapa | PIHAK PERTAMA | Proyek tersandera akun pribadi seseorang |

G-1 dan G-2 selesai. Lima gerbang tersisa, dan empat di antaranya bukan keputusan teknis. Semuanya lebih murah dijawab sekarang daripada di minggu keenam.

**Status persetujuan:** Tahap 2 (Scaffolding Repo) disetujui 20 Agustus 2026, stack final ditetapkan. Gerbang tersisa (G-3..G-7) tidak memblokir scaffolding, tapi G-3 (Addendum I) harus selesai sebelum VPS dibeli, dan G-6 (siapa mengoreksi transkrip) sebelum Fase 5.

---

## Fase 0 — Fondasi (Hari 1–7)
**Output:** repo, CI, staging, keputusan G-1..G-7 tertulis.
- Scaffolding monorepo, tooling, lint, typecheck
- Pipeline CI dengan gate `facade`, `headers`, `a11y` **sejak awal** — menambahkannya belakangan berarti mewarisi pelanggaran
- Staging hidup dengan basic auth + `noindex`
- Payload 3 + SQLite, migrasi awal, seed fiktif
- **Uji abandon sejak hari pertama:** matikan VPS, pastikan situs statis tetap melayani seluruh halaman. Ini gerbang keluar Fase 0, bukan latihan teoretis
- Domain terdaftar, DNS di Cloudflare, TLS aktif
- **Gerbang keluar:** `curl -I staging` menunjukkan header keamanan lengkap; CI hijau

## Fase 1 — Inti arsip (Hari 8–22)
**Output:** satu halaman arsip yang benar-benar benar, dari ujung ke ujung.
- Model konten: collections, archive_items, assets, transcripts, narasumber, themes
- Admin CMS dengan MFA aktif
- Halaman arsip: Kartu Register, transkrip, foto, narasumber, arsip terkait
- **`<ArsipPlayer>` façade YouTube** — komponen pertama yang dibangun setelah model konten, karena paling berisiko
- `VideoObject` + `ArchiveComponent` schema
- Halaman koleksi & beranda
- **Gerbang keluar:** HAR bersih sebelum Play · Lighthouse ≥ 90 · transkrip terlihat di `curl` · Rich Results Test lolos

Alasan mendahulukan pemutar: ia menyentuh pihak ketiga, ToS, CSP, privasi, aksesibilitas, dan performa sekaligus. Kalau ada yang akan meledak, biarkan meledak di minggu kedua, bukan minggu kedelapan.

## Fase 2 — Penemuan (Hari 23–34)
- Jelajah dengan facet + kebijakan indeks (SEO §6)
- Pencarian: Pagefind (publik) + SQLite FTS5 (admin)
- Halaman tema & wilayah sebagai konten, bukan sekadar filter
- Peta sebaran (MapLibre) + fallback daftar HTML
- Peta Warna + Linimasa, keduanya dengan padanan teks
- Direktori pelaku batik + detail + `contact_visibility`
- Cerita (editorial) dengan tautan ke arsip sumber
- **Gerbang keluar:** kombinasi facet tidak menghasilkan URL indeks tak terbatas; peta punya fallback; direktori menghormati pilihan privasi

## Fase 3 — Akses & tata kelola (Hari 35–45)
- Auth + peran + MFA lengkap
- Form permohonan akses → tinjauan → grant berbatas waktu
- Pemutar internal R2 + presigned URL + HLS
- AuditLog lengkap dengan kelas retensi
- Alur penarikan izin narasumber (auto-unpublish)
- Mesin konten terbatas (PKS 2.6) dengan pembayaran konfirmasi manual
- Halaman Tentang, Metodologi, Etika, Mitra, FAQ, Kontak, Terlibat, Berita
- **Gerbang keluar:** bucket restricted tidak bisa diakses dengan curl polos · alur permohonan berjalan penuh · uji `withdrawal_requested` berhasil

## Fase 4 — SEO, GEO, pengerasan (Hari 46–55)
- Sitemap per tipe, robots.txt versi GEO, llms.txt
- Schema lengkap di semua tipe halaman
- hreflang + halaman EN inti
- CSP dari Report-Only ke penegakan
- Audit aksesibilitas + perbaikan
- Uji beban ringan, optimasi Core Web Vitals
- Uji restore backup pertama (nyata, dari nol)
- **Gerbang keluar:** checklist SECURITY §12 lengkap · Search Console terkonfigurasi · restore terbukti

## Fase 5 — Konten & peluncuran (Hari 56–60+)
- Pengisian konten oleh tim: minimal **12 arsip lengkap + 5 cerita + 20 entri direktori**
- Pelatihan admin + serah terima (PKS Pasal 2.10)
- Uji lintas perangkat, termasuk Android kelas menengah di jaringan 4G Pekalongan
- Peluncuran lunak → perbaikan → peluncuran publik
- **Gerbang keluar:** Definition of Done di PRD §9

**Peringatan jadwal yang harus disampaikan sekarang:** Fase 5 adalah pekerjaan PIHAK PERTAMA, dan hampir selalu menjadi penyebab keterlambatan. PKS Pasal 5.3 sudah menyatakan keterlambatan penyediaan bahan menyesuaikan jadwal tanpa dianggap kesalahan pelaksana — tapi lebih baik dijadwalkan sejak awal daripada dijadikan pembelaan di akhir. Sarankan konten mulai dikerjakan paralel sejak Fase 1, bukan menunggu website jadi.

---

## Setelah go-live

**Fase 6 — Stabilisasi (Bulan 1–3)**
Pemantauan, perbaikan bug, audit SEO bulanan, uji kueri GEO pertama (GEO §8), tambahan konten berkelanjutan.

**Fase 7 — Kredibilitas institusional (Bulan 4–9)**
- **DOI untuk koleksi** (Zenodo/repositori institusi) — pengungkit terbesar untuk kutipan akademik sekaligus GEO
- Titip salinan pelestarian ke lembaga arsip
- IIIF untuk foto arsip
- OAI-PMH / metadata dapat dipanen
- Kemitraan dengan jurusan sejarah, antropologi, tekstil

**Fase 8 — Koleksi kedua (Bulan 9–15)**
Ujian sesungguhnya atas Prinsip 5. Kalau menambahkan koleksi kedua membutuhkan perubahan skema, berarti Fase 1 gagal. Uji ini bisa dilakukan lebih awal dan murah: buat satu koleksi dummy kedua di staging pada Fase 2.

**Fase 9 — Menu Belajar**
Baru dikerjakan bila ada kurator dan pendanaan. Dokumen internal menandainya *future development*; hormati itu. Modul belajar setengah jadi lebih merugikan daripada tidak ada.

---

## 7. Beban tambahan di luar PKS (untuk Addendum I)

| Item | Perkiraan | Dasar |
|---|---|---|
| Custom video player + façade + IFrame API + fallback | 5–8 hari | Di luar "embed YouTube" pada PKS 2.5.a |
| Object storage R2 + presigned + HLS + pemutar internal | 5–8 hari | Bukan bagian lingkup awal; PKS 11.3 |
| Alur permohonan akses peneliti | 6–9 hari | Fitur baru, PKS 14.2.a |
| AuditLog + retensi + pseudonimisasi | 3–5 hari | Fitur baru |
| Pengerasan keamanan (CSP nonce, MFA, allowlist) | 4–6 hari | Melampaui "keamanan dasar" PKS 2.9 |
| GEO (llms.txt, kebijakan crawler, schema lanjutan) | 3–4 hari | Melampaui "SEO dasar" PKS 2.8 |
| Faceted browse + kebijakan indeks | 4–6 hari | Melampaui "pencarian/filter sederhana" PKS 2.4.f |
| **Total** | **± 31–48 hari kerja tambahan** | |

Angka ini kira-kira **menggandakan** durasi PKS. Itu bukan alasan untuk membatalkan apa pun — tapi menyampaikannya sekarang jauh lebih baik daripada menemukan selisihnya di Termin 3. Kalau anggaran tidak bisa ditambah, potong lingkupnya, jangan potong waktunya: yang pertama adalah keputusan, yang kedua adalah utang teknis yang dibayar dengan kualitas.

**Rekomendasi pemotongan bila anggaran tetap:** pertahankan façade player, transkrip, SEO/GEO, MFA, dan CSP. Tunda pemutar internal R2 dan alur akses digital — pada Fase 1 permohonan akses bisa berjalan lewat email + pengiriman manual, dan itu tetap memenuhi Prinsip 4. Yang tidak boleh dipotong: apa pun yang menyangkut consent, privasi, dan backup.
