---
jenis: halaman
tipe_konten: halaman_jelajah   # CATATAN DEV: nilai baru, belum ada di enum standar template-output.md (yang lama tidak punya varian untuk Jelajah karena template-output.md menandai Jelajah sebagai "bukan konten sendiri"). Ditambahkan mengikuti pola halaman_koleksi: Jelajah tetap butuh SATU halaman hub/indeks nyata (intro, microcopy filter, empty-state) meski isinya dirakit otomatis dari Tulisan yang sudah ditag, bukan ditulis manual per entri.
judul: "Jelajah"
slug: "jelajah"
lapis_arsip: akses_publik
tema: []
lokasi: ""
tahun_konteks: ""
narasumber: []
consent_note: "Halaman ini hanya menampilkan filter/indeks atas Tulisan (Cerita, Koleksi, Berita, Profil Narasumber) yang sudah dipublikasikan dan ditag tema; consent masing-masing narasumber tercatat di level Tulisan aslinya, bukan di halaman indeks ini."
status_konten: placeholder_pengembangan
meta_title: "Jelajah Berdasarkan Tema | Arsip Hidup Indonesia"
meta_description: "Jelajahi Cerita, Koleksi, Berita, dan Profil Narasumber Arsip Hidup Indonesia lewat 10 tema — dari Perempuan hingga Regenerasi."
keywords:
  - "Jelajah Arsip Hidup Indonesia"
  - "jelajah tema batik Pekalongan"
  - "cari wawancara pembatik berdasarkan tema"
  - "tema arsip lisan Indonesia"
  - "apa itu halaman Jelajah di Arsip Hidup Indonesia"
ringkasan_geo: "Jelajah adalah halaman indeks di Arsip Hidup Indonesia yang mengumpulkan seluruh Tulisan — Cerita, Koleksi, Berita, dan Profil Narasumber — berdasarkan 10 tema, mulai dari Perempuan sampai Perdagangan & Kewirausahaan. Berbeda dari halaman Koleksi yang hanya memuat entri Koleksi, Jelajah menyilangkan semua jenis Tulisan sekaligus lewat satu tema yang sama."
jumlah_kata: 723
---

*(Halaman indeks — placeholder pengembangan. Belum ada Tulisan bertanda tema yang benar-benar terhubung ke halaman ini; struktur di bawah disiapkan supaya listing bisa terisi otomatis begitu Cerita/Koleksi/Berita/Profil Narasumber mulai dipublikasikan dan ditag.)*

## Jelajah

Jelajah adalah cara menyusuri arsip Arsip Hidup Indonesia bukan dari jenis kontennya, tapi dari benang tema yang menghubungkannya. Satu tema seperti Perempuan bisa menautkan sebuah Cerita tentang pembatik tunggal, sebuah Koleksi yang menghimpun beberapa wawancara, sebuah liputan Berita dari media luar, dan sebuah Profil Narasumber — semuanya tampil berdampingan di satu halaman yang sama.

Ini yang membedakan Jelajah dari halaman Koleksi: Koleksi hanya memuat entri Koleksi itu sendiri (kurasi tematik dari tim), sementara Jelajah menyilangkan **semua** jenis Tulisan yang sudah ditag ke tema tertentu, apa pun bentuknya. Karena proyek awal platform ini adalah Batik Tulis Pekalongan, sebagian besar tema di bawah untuk saat ini akan lebih banyak berisi kisah dari Pekalongan — tapi arsitektur tema ini dirancang agar tetap relevan kalau suatu saat proyek/lokasi lain didokumentasikan.

### 10 tema

| Tema | Tautan |
|---|---|
| Perempuan | [Jelajahi →](/jelajah/tema/perempuan) |
| Kerja & Ekonomi | [Jelajahi →](/jelajah/tema/kerja-ekonomi) |
| Pengetahuan & Keterampilan | [Jelajahi →](/jelajah/tema/pengetahuan-keterampilan) |
| Lingkungan & Bencana | [Jelajahi →](/jelajah/tema/lingkungan-bencana) |
| Identitas & Tradisi | [Jelajahi →](/jelajah/tema/identitas-tradisi) |
| Keluarga & Komunitas | [Jelajahi →](/jelajah/tema/keluarga-komunitas) |
| Regenerasi | [Jelajahi →](/jelajah/tema/regenerasi) |
| Agama & Kepercayaan | [Jelajahi →](/jelajah/tema/agama-kepercayaan) |
| Motif & Seni | [Jelajahi →](/jelajah/tema/motif-seni) |
| Perdagangan & Kewirausahaan | [Jelajahi →](/jelajah/tema/perdagangan-kewirausahaan) |

Setiap tema di atas punya halaman turunannya sendiri (lihat daftar 10 halaman tema terpisah) — bukan submenu navigasi tetap seperti di Tentang, tapi tampilan terfilter yang tetap punya intro singkat dan meta SEO sendiri, supaya masing-masing tema bisa ditemukan lewat pencarian atau dikutip AI answer engine secara spesifik, bukan hanya sebagai satu baris di tabel ini.

## Microcopy komponen kartu (lintas jenis Tulisan)

Kartu di halaman Jelajah menggabungkan empat jenis Tulisan sekaligus, jadi badge jenisnya penting supaya pengunjung tidak bingung membedakan esai editorial dari liputan luar.

| Elemen | Teks | Konteks pemakaian |
|---|---|---|
| Badge jenis — Cerita | `CERITA` | Kartu yang mengarah ke esai editorial (interpretasi tim dari satu wawancara/narasumber) |
| Badge jenis — Koleksi | `KOLEKSI` | Kartu yang mengarah ke kurasi tematik dari beberapa wawancara sekaligus. Angka wawancara BELUM ditampilkan — field `jumlah_wawancara` dicabut per RULES 1.7 sampai terhitung dari database. |
| Badge jenis — Berita | `BERITA` | Kartu yang mengarah ke ringkasan liputan dari sumber luar |
| Badge jenis — Profil Narasumber | `PROFIL` | Kartu yang mengarah ke profil individual narasumber |
| Chip tema pada kartu | Nama tema persis dari 10 tag resmi | Maksimal tampilkan 2 chip per kartu; tema yang sedang difilter selalu ditampilkan lebih dulu |
| Tombol/CTA kartu | `Baca Selengkapnya` (Cerita/Berita) · `Jelajahi Koleksi` (Koleksi) · `Lihat Profil` (Profil Narasumber) | CTA menyesuaikan jenis Tulisan, bukan teks generik tunggal |

## Microcopy filter & urutan

| Elemen | Teks | Konteks pemakaian |
|---|---|---|
| Label filter tema | `Jelajah berdasarkan tema` | Baris chip 10 tema di bagian atas halaman; multi-pilih diperbolehkan (pengunjung bisa memilih lebih dari satu tema sekaligus) |
| Label filter jenis | `Tampilkan` | Filter sekunder berupa checkbox: "Semua" · "Cerita" · "Koleksi" · "Berita" · "Profil Narasumber" |
| Label urutan | `Urutkan berdasarkan` | Opsi: "Terbaru" · "Judul A-Z" |
| Label breadcrumb (hub) | `Beranda / Jelajah` | Navigasi di bagian atas halaman hub |
| Label breadcrumb (halaman tema) | `Beranda / Jelajah / {Nama Tema}` | Navigasi di bagian atas tiap halaman tema turunan, mis. "Beranda / Jelajah / Perempuan" |

## Microcopy kondisi kosong (empty state)

| Kondisi | Teks | Konteks pemakaian |
|---|---|---|
| Kombinasi tema + jenis tidak menemukan hasil | "Belum ada Tulisan untuk kombinasi filter ini. Coba longgarkan filter jenis, atau jelajahi tema lain — arsip ini terus bertambah seiring wawancara baru didokumentasikan." | Tampil saat filter tema dan filter jenis bersamaan menghasilkan nol kartu |
| Satu halaman tema belum punya Tulisan sama sekali | "Tema ini belum punya Cerita, Koleksi, Berita, atau Profil Narasumber yang tertaut. Karena arsip masih di tahap awal (proyek Batik Tulis Pekalongan), sebagian tema mungkin baru terisi belakangan." | Tampil di halaman tema turunan saat belum ada satu pun Tulisan yang ditag ke tema tersebut |

Jelajahi juga: [Koleksi](/koleksi) · [Cerita](/cerita) · [Tentang Arsip Hidup Indonesia](/tentang)
