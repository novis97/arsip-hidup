---
jenis: halaman
tipe_konten: halaman_koleksi   # CATATAN DEV: nilai baru, belum ada di enum standar template-output.md (yang lama hanya punya halaman_home/tentang/berpartisipasi/kontak/belajar/rekomendasi_karya). Ditambahkan karena menu "02 — Koleksi" ternyata TIDAK punya submenu resmi seperti Tentang (dicek langsung ke "Garis Besar menu.pdf": slide Koleksi hanya bilang "isinya menyusul"). Halaman ini berfungsi sebagai hub/listing, bukan halaman statis biasa.
judul: "Koleksi"
slug: "koleksi"
lapis_arsip: akses_publik
tema: []
lokasi: ""
tahun_konteks: ""
narasumber: []
consent_note: "Halaman ini hanya menampilkan daftar (listing) Koleksi yang sudah melalui proses interpretasi tim; consent masing-masing narasumber tercatat di level Koleksi/wawancara individual, bukan di halaman listing ini."
status_konten: placeholder_pengembangan
meta_title: "Koleksi — Kurasi Tematik | Arsip Hidup Indonesia"
meta_description: "Jelajahi Koleksi: kurasi tematik wawancara pembatik Pekalongan, dikelompokkan berdasarkan tema seperti perempuan, regenerasi, dan lingkungan."
keywords:
  - "Koleksi Arsip Hidup Indonesia"
  - "koleksi tematik batik Pekalongan"
  - "kurasi wawancara pembatik"
  - "arsip lisan berdasarkan tema"
  - "apa itu Koleksi di Arsip Hidup Indonesia"
ringkasan_geo: "Koleksi adalah kurasi tematik dari beberapa wawancara sekaligus di Arsip Hidup Indonesia, berbeda dari Cerita yang berfokus pada satu narasumber. Setiap Koleksi mengelompokkan wawancara berdasarkan kesamaan tema, seperti peran perempuan dalam batik tulis Pekalongan atau dampak rob terhadap kehidupan pesisir."
jumlah_kata: 452
---

*(Halaman listing — placeholder pengembangan. Tiga Koleksi di bawah adalah contoh untuk mengisi struktur situs di tahap development, konsisten dengan mockup homepage awal. Karena menu Koleksi belum punya submenu resmi dari tim proyek, halaman ini dirancang sebagai arsip yang bertambah otomatis setiap kali entri Koleksi baru dipublikasikan — bukan daftar submenu tetap seperti Tentang.)*

## Koleksi

Koleksi adalah kumpulan wawancara yang dirangkai tim editorial berdasarkan kesamaan tema, bukan satu wawancara tunggal seperti pada Cerita. Setiap Koleksi menautkan beberapa suara narasumber yang berbeda — kadang beda usia, beda kampung, bahkan beda generasi — yang ketika dibaca bersama, memperlihatkan pola yang tidak selalu terlihat dari satu wawancara saja.

Arsip ini masih di tahap awal. Sesuai rencana proyek, Batik Tulis Pekalongan adalah proyek pertama yang didokumentasikan, dan platform ini dirancang agar suatu saat dapat menampung tema atau proyek dokumentasi lain di luar Pekalongan. Jumlah dan variasi Koleksi di halaman ini akan terus bertambah seiring proses wawancara dan kurasi berjalan.

### Koleksi pilihan

**Perempuan yang Membentuk Batik Pekalongan**
Tema: Perempuan · Identitas & Tradisi · Kerja & Ekonomi
[Jelajahi Koleksi →](/koleksi/perempuan-yang-membentuk-batik-pekalongan)

**Belajar Membatik: Pengetahuan dari Generasi ke Generasi**
Tema: Pengetahuan & Keterampilan · Regenerasi · Keluarga & Komunitas
[Jelajahi Koleksi →](/koleksi/belajar-membatik-pengetahuan-dari-generasi-ke-generasi)

**Kenangan Banjir: Hidup Berdampingan dengan Rob**
Tema: Lingkungan & Bencana · Kerja & Ekonomi
[Jelajahi Koleksi →](/koleksi/kenangan-banjir-hidup-berdampingan-dengan-rob)

## Microcopy komponen kartu Koleksi

| Elemen | Teks | Konteks pemakaian |
|---|---|---|
| Label badge kecil di kartu | `KOLEKSI` | Muncul di pojok atas setiap kartu, membedakan dari kartu Cerita/Berita di listing gabungan |
| Angka cakupan wawancara | `{{jumlah_wawancara}} Wawancara` | Field `jumlah_wawancara` SENGAJA BELUM ADA di frontmatter — dicabut per RULES 1.7 sampai jumlahnya bisa dihitung dari database. Jangan tambahkan kembali sebagai angka manual. |
| Tombol/CTA kartu | `Jelajahi Koleksi` | Mengarah ke halaman detail Koleksi tersebut |
| Chip tema pada kartu | Nama tema persis dari 10 tag resmi | Maksimal tampilkan 2 chip di kartu, sisanya bisa "+1" jika Koleksi ditag 3 tema |

## Microcopy filter & urutan

| Elemen | Teks | Konteks pemakaian |
|---|---|---|
| Label filter | `Filter berdasarkan tema` | Dropdown/chip filter di atas listing, memakai 10 tag resmi yang sama dengan Jelajah |
| Label urutan | `Urutkan berdasarkan` | Opsi: "Terbaru" · "Jumlah wawancara terbanyak" |
| Label breadcrumb | `Beranda / Koleksi` | Navigasi di bagian atas halaman |

## Microcopy kondisi kosong (empty state)

| Kondisi | Teks | Konteks pemakaian |
|---|---|---|
| Filter tema tidak menemukan Koleksi apa pun | "Belum ada Koleksi untuk tema ini. Koleksi baru terus ditambahkan seiring arsip berkembang — coba jelajahi tema lain atau lihat semua Koleksi yang tersedia." | Tampil saat hasil filter kosong, terutama karena arsip masih di tahap awal (baru mencakup proyek Batik Tulis Pekalongan) |

Jelajahi juga: [Jelajah berdasarkan tema](/jelajah) · [Cerita](/cerita) · [Tentang Arsip Hidup Indonesia](/tentang)
