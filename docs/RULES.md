# RULES — Aturan Kerja Arsip Hidup Indonesia
**Versi:** 0.4 · 25 Agustus 2026
Aturan di sini bersifat mengikat. Bila sebuah aturan menghalangi pekerjaan, ubah aturannya lewat keputusan tertulis — jangan dilewati diam-diam.

---

## 1. Aturan yang tidak bisa ditawar

1. **Consent form dan biodata narasumber tidak pernah masuk aplikasi web.** Hanya `consent_ref` (kode) dan flag boolean.
2. **Tidak ada publikasi item tanpa `consent_verified = true`.** Ditegakkan CHECK constraint, bukan disiplin admin.
3. **Materi tier `restricted` tidak pernah di-upload ke YouTube**, termasuk unlisted.
4. **MFA wajib** untuk admin/editor/archivist/reviewer.
5. **Foto publik wajib bersih EXIF.** Metadata GPS foto lapangan menunjukkan rumah narasumber.
6. **Tidak ada logo mitra yang belum benar-benar bermitra.** Ditandai eksplisit di dokumen internal, dan tetap berlaku setelah launch.
7. **Angka di situs harus berasal dari database.** Tanpa angka karangan untuk "terlihat mapan".
8. **Permintaan penarikan narasumber diproses dalam 7 hari kerja**, tanpa negosiasi.

## 2. Video Security Rules

**V-1. Whitelist domain embed.** Hanya `www.youtube-nocookie.com` dan `w.soundcloud.com` boleh muncul di `frame-src`. Menambah domain embed baru = perubahan CSP, perubahan CSP = review.

**V-2. Validasi ID sebelum render.** `youtube_id` harus lolos `^[A-Za-z0-9_-]{11}$` di server. URL penuh ditolak di lapisan input, bukan "dibersihkan". Tanpa aturan ini, satu akun editor yang dibajak bisa menyuntikkan iframe sembarang ke seluruh halaman arsip.

**V-3. Tidak ada `src` iframe dari input pengguna.** `src` selalu dibentuk server dari template + ID tervalidasi. Tidak pernah dirangkai di klien dari query string.

**V-4. Façade wajib.** Nol request ke domain Google sebelum interaksi pengguna. Diuji lewat HAR di CI, bukan diperiksa manual sesekali.

**V-5. Thumbnail dari CDN sendiri.** `i.ytimg.com` dilarang. Hotlink thumbnail membocorkan kunjungan pengguna ke Google sebelum ia menyetujui apa pun.

**V-6. Sandbox minimal-hak.** `sandbox="allow-scripts allow-same-origin allow-presentation"` — tanpa `allow-popups`, tanpa `allow-top-navigation`, tanpa `allow-forms`. Kalau sandbox mematahkan fullscreen di salah satu browser target, laporkan dan putuskan sadar; jangan diam-diam menambah izin.

**V-7. Dilarang menutupi elemen player.** Tidak ada overlay CSS di atas logo YouTube, tombol "Watch on YouTube", atau kontrol. Melanggar YouTube API ToS dan merusak aksesibilitas. Kontrol kustom dibuat lewat IFrame API dengan `controls=0` — jalur yang memang disediakan.

**V-8. Satu channel resmi.** Semua video di-upload dari channel Arsip Hidup Indonesia. `rel=0` hanya membatasi rekomendasi ke channel yang sama; embed video milik channel lain berarti mengundang rekomendasi acak YouTube ke halaman arsip.

**V-9. Presigned URL untuk tier terbatas.** TTL ≤ 300 detik. Tanpa URL permanen. Tanpa "link rahasia yang panjang" sebagai pengganti otorisasi.

**V-10. Setiap Play tercatat.** `AuditLog` dengan `actor_hash`, bukan IP mentah. Pencatatan bersifat asinkron dan tidak boleh menunda pemutaran. Kegagalan pencatatan tidak boleh menggagalkan pemutaran.

**V-11. Fallback wajib ada.** Timeout 5 detik → panel fallback. Halaman tanpa jalan keluar saat YouTube diblokir adalah bug, bukan keterbatasan.

**V-12. Jangan cantumkan `contentUrl` untuk aset terbatas** di schema. Itu menerbitkan lokasi file yang aksesnya sedang dibatasi.

**V-13. Master file tidak pernah dilayani lewat web.** `is_original_master = true` berarti tidak ada jalur HTTP apa pun menuju objek itu.

**V-14. Perubahan pada komponen pemutar memerlukan pengujian ulang penuh** terhadap checklist VIDEO_EMBED §10. Pemutar adalah komponen dengan permukaan pihak ketiga terbesar di situs ini.

## 3. Aturan konten & editorial

**C-1.** (direvisi T1.3h, 25 Agustus 2026) Setiap `archive_item` publik wajib punya: `summary` (2–4 kalimat), transkrip atau ringkasan isi, minimal satu tema, `rights_statement`, dan atribusi narasumber sesuai `display_consent`.

Sejak C-4 direvisi, transkrip yang belum terverifikasi tidak terbaca publik. Arsip publik yang transkripnya belum lolos gerbang WAJIB mengisi `description` dengan uraian isi wawancara — apa yang diceritakan narasumber, bukan deskripsi katalog. `summary` tidak memenuhi syarat ini; ia sudah wajib untuk semua arsip dan berfungsi sebagai keterangan singkat, bukan pengganti isi.

Aturan ini TIDAK ditegakkan kode. Ia disiplin editorial, dan disiplin editorial di proyek ini sudah terbukti berubah jadi kelonggaran diam-diam. Penegakannya adalah utang tercatat.

**C-2.** Timeline dan Peta Warna wajib punya `source_citation`. Klaim tanpa sumber tidak masuk ke arsip.
**C-3.** Menu Berita hanya memuat **kutipan pendek + tautan** ke sumber aslinya. Menyalin artikel media secara utuh adalah pelanggaran hak cipta, dan konten duplikat merusak SEO.
**C-4.** (direvisi T1.3h, 25 Agustus 2026) Transkrip ASR berstatus is_verified = false sampai dikoreksi manusia. Transkrip yang belum terverifikasi TIDAK dibaca oleh publik anonim — gerbangnya ada di access read (transcriptPubliclyReadable), bukan di lapisan render.

Perubahan dari rumusan sebelumnya: C-4 semula mewajibkan status is_verified terlihat oleh pembaca, yang mengandaikan transkrip belum terverifikasi memang tampil di situs publik dengan peringatan. Rumusan itu dicabut.

Alasan: peringatan melindungi pembaca dari salah menganggap transkrip otoritatif. Ia tidak melindungi orang yang namanya salah didengar ASR. ASR pada campuran Indonesia-Jawa salah dengar nama orang dan nama tempat,dan orang yang disebut DI DALAM rekaman tidak menandatangani consent apa pun. lib/redactNames.ts tidak menjangkau mereka karena ia hanya menyapu nama dari record Narasumber. Selain itu, transkrip mesin atas bahasa campuran Indonesia–Jawa akan salah, dan kesalahan yang tampak otoritatif lebih berbahaya daripada tidak ada transkrip sama sekali.

Kewajiban menampilkan status tetap berlaku untuk pembaca terautentikasi dan pratinjau. Peringatan "BELUM diverifikasi" di [slug].astro DIPERTAHANKAN meski tak terjangkau anonim.

Konsekuensi operasional: tidak ada transkrip publik tanpa koreksi manusia lebih dulu. Peran korektor: editor. Beban kerja ~3-5x durasi rekaman untuk campuran Indonesia-Jawa (G-6, belum berbiaya).

**C-5.** Foto tidak diberi filter. Warna dikoreksi seperlunya, tidak digayakan.
**C-6.** Nama narasumber ditulis sesuai `display_consent` **di setiap tempat** — termasuk `alt`, judul halaman, schema, dan meta OG. Anonimisasi yang bocor di satu tempat sama dengan tidak ada anonimisasi.
**C-7.** Kutipan panjang dari narasumber selalu diberi konteks: kapan direkam, dalam percakapan tentang apa. Kutipan tanpa konteks adalah cara paling halus mendistorsi sumber.

## 4. Aturan kode

**K-1.** TypeScript strict. `any` memerlukan komentar alasan.
**K-2.** Branch: `main` (produksi, dilindungi) · `dev` · `feat/*` · `fix/*`. PR wajib, review wajib, minimal 1 approver.
**K-3.** Conventional Commits. Tag rilis semantik.
**K-4.** CI gagal → merge diblokir. Gate: typecheck, lint, unit test, build, audit dependensi, uji HAR façade, cek header keamanan.
**K-5.** Tidak ada secret di repo. `.env.example` tanpa nilai. Scanner secret aktif di pre-commit.
**K-6.** Migrasi database forward-only dan ber-versi. Tidak ada perubahan skema manual di produksi.
**K-7.** Semua query berparameter. Peninjau PR wajib menolak string concatenation pada SQL.
**K-8.** Komponen yang menyentuh pihak ketiga (pemutar, peta, embed) diisolasi di `src/integrations/*` dan tidak boleh diimpor langsung oleh halaman.
**K-9.** Tidak menambah dependensi npm untuk hal yang bisa ditulis dalam 30 baris. Setiap paket adalah pihak yang Anda beri hak eksekusi kode.
**K-10.** Setiap PR menyebut file blueprint mana yang diubah perilakunya. Blueprint yang tidak diperbarui akan berhenti dipercaya dalam dua bulan.

## 5. Aturan etika & tata kelola

**E-1. Prinsip 4 ditegakkan secara literal.** Halaman persetujuan akses wajib menyatakan bahwa pemberian akses **bukan** consent penelitian, dan bahwa peneliti harus meminta consent ulang secara independen kepada narasumber.
**E-2. Kontak narasumber tidak pernah diberikan langsung.** Platform memfasilitasi perkenalan.
**E-3. Hak menarik diri.** `withdrawal_requested = true` → seluruh item terkait auto-unpublish dalam ≤ 24 jam, konfirmasi manual ke narasumber ≤ 7 hari kerja. Materi dipertahankan di penyimpanan pelestarian (tidak dihancurkan) kecuali diminta eksplisit, tapi tidak lagi ditampilkan.
**E-4. Narasumber wafat** → tidak otomatis menggugurkan consent, tetapi keluarga inti berhak mengajukan keberatan lewat jalur yang sama dengan E-3.
**E-5. Embargo dihormati mutlak.** Sebelum `embargo_until`, hanya metadata deskriptif yang tampil.
**E-6. Setiap permohonan akses ditinjau manusia.** Tidak ada persetujuan otomatis, sebanyak apa pun antreannya.
**E-7. Konten arsip tidak dijual pada Fase 1** (PRD B-3). Perubahan atas ini butuh keputusan tertulis PIHAK PERTAMA **dan** form consent baru.
**E-8. Crawler pelatihan AI diblokir sampai consent mencakupnya** (GEO.md §5). Crawler mesin jawaban diizinkan. Ini keputusan sadar, bukan kelalaian konfigurasi.

## 6. Aturan operasional

**O-1.** Backup harian otomatis; **uji restore setiap kuartal, tercatat.** Backup yang belum pernah direstorasi berstatus "belum terbukti".
**O-2.** Perpanjangan domain & hosting diingatkan H-60 dan H-30 (PKS Pasal 11.5). Kehilangan domain `arsiphidup.id` berarti kehilangan seluruh ekuitas SEO dan seluruh tautan yang sudah tersebar.
**O-3.** Dependensi diperbarui minimal bulanan selama masa maintenance 1 tahun; setelah itu tanggung jawab pindah ke PIHAK PERTAMA (PKS Pasal 10.7 & 11.4) — sampaikan ini secara eksplisit saat serah terima, bukan hanya di kontrak.
**O-4.** Perubahan di luar ruang lingkup melalui Addendum tertulis (PKS Pasal 8 & 14). Ini melindungi kedua pihak, bukan hanya pelaksana.
**O-5.** Staging tidak boleh terindeks: `noindex` + basic auth + **data narasumber asli tidak boleh ada di sana.**
**O-6.** Serah terima mencakup: akses admin, repo, dokumentasi 11 file ini, rekaman pelatihan, dan daftar biaya berulang tahun ke-2 beserta perkiraan angkanya.
