# DESIGN — Arsip Hidup Indonesia
**Versi:** 0.3 · 20 Agustus 2026

---

## 0. Kritik terhadap mockup yang ada di dokumen internal

Dokumen `Garis_Besar_menu.pdf` sendiri sudah menandai mockup homepage sebagai buatan AI dan meminta logo Unhas & BCA tidak dipakai. Setuju soal logo — mencantumkan logo lembaga yang belum jadi mitra adalah risiko reputasi dan hukum, bukan sekadar salah tempel.

Tapi ada masalah yang lebih dalam dan belum ditandai:

**1. Palet mockup itu salah secara kultural untuk Pekalongan.**
Mockup memakai krem hangat + sogan cokelat + serif kontras tinggi. Itu palet **batik keraton Solo–Yogyakarta**: sogan, soklat, nila tua, terbatas dan meditatif. Batik **pesisir Pekalongan** justru dikenal karena kebalikannya — warna cerah dan berani, palet luas hasil pertemuan pengaruh Tionghoa, Arab, Belanda, dan Jepang. Buketan dan Jlamprang hidup di merah mengkudu, biru nila, kuning, hijau, ungu, di atas mori putih.
Memakai palet keraton untuk arsip batik Pekalongan seperti memberi warna gamelan Jawa Tengah pada arsip musik Betawi: kelihatan "budaya", tapi salah budayanya. Dan situs ini punya fitur bernama **Peta Warna Batik Pekalongan** — kalau warna situsnya sendiri tidak berasal dari peta itu, fiturnya jadi hiasan.

**2. Krem + serif + aksen tanah liat hangat adalah tampilan default AI tahun ini.** Ia muncul di ribuan situs "warisan budaya" tanpa memandang subjeknya. Pemberi hibah dan peneliti melihat banyak sekali situs seperti itu.

**3. Dokumen internal Anda sendiri sudah punya suara visual yang lebih kuat dan belum dipakai.** Slide `Garis_Besar_menu.pdf` disusun dengan sans kondensat tebal huruf besar, blok warna datar, biru kuat dan blok koral. Poster-like, tegas, tidak sentimental. Itu identitas yang lebih jujur untuk arsip yang berbicara tentang banjir rob dan hilangnya regenerasi pembatik daripada estetika krem nostalgik.

**Arah yang diusulkan:** lanjutkan bahasa poster dari deck Anda, ganti paletnya dengan warna celup Pekalongan yang sebenarnya. Nostalgia diganti kejelasan.

---

## 1. Posisi desain

**"Register arsip, bukan galeri warisan."**
Situs ini bukan pameran indah tentang masa lalu. Ia adalah meja registrasi yang rapi, tempat orang bisa menemukan siapa berkata apa, kapan, di mana, dan bagaimana mengaksesnya. Keindahannya datang dari ketelitian, bukan dari filter sepia.

Tiga hal yang harus dirasakan pengunjung dalam 5 detik: (1) ini arsip sungguhan, bukan blog; (2) ada manusia spesifik di baliknya, bukan "budaya" abstrak; (3) saya bisa menemukan sesuatu di sini.

## 2. Token

### 2.1 Warna — diturunkan dari bahan celup Pekalongan
| Token | Hex | Asal |
|---|---|---|
| `--mori` | `#F7F5F0` | kain mori sebelum dicelup — latar utama |
| `--wedelan` | `#1B3A5C` | indigo/nila tua — teks utama & navigasi |
| `--mengkudu` | `#B8352C` | merah akar mengkudu — aksen tunggal, aksi utama |
| `--soga-kuning` | `#D9A441` | kuning kunyit/soga muda — sorotan, highlight |
| `--nila-muda` | `#5B8CA8` | nila encer — tautan, elemen sekunder |
| `--malam` | `#14100E` | lilin malam — teks pada latar terang, blok kontras |
| `--kertas-arsip` | `#EAE4D8` | permukaan kartu, tabel bergaris |

Aturan pemakaian: `--mengkudu` **hanya** untuk aksi utama dan penanda status penting. Begitu ia dipakai untuk dekorasi, ia berhenti berarti.
Kontras: seluruh pasangan teks/latar wajib ≥ 4.5:1 (≥ 7:1 untuk badan transkrip). Diuji, bukan diperkirakan.

**Peta Warna sebagai sumber token:** warna di `color_map_entries` (SCHEMA §11) adalah data, dan palet situs berasal dari sana. Ketika koleksi baru masuk (misal tenun Sumba), palet aksennya ikut bergeser mengikuti peta warna koleksi tersebut. Ini yang membuat sistem desainnya berlaku untuk *platform*, bukan untuk satu proyek — sejalan dengan Prinsip 5.

### 2.2 Tipografi
| Peran | Typeface | Alasan |
|---|---|---|
| Display | **Archivo Expanded** 700–800, huruf besar, tracking rapat | Melanjutkan suara poster deck internal; lebar dan tegas, bukan serif nostalgik |
| Badan / prosa panjang | **Source Serif 4**, 19px/1.7 | Transkrip wawancara bisa 8.000 kata. Serif yang dirancang untuk layar terbaca jauh lebih lama daripada sans |
| Utilitas / metadata | **IBM Plex Mono** 14px | Nomor arsip, timecode, durasi, kode hak. Mono di sini bukan gaya — ia menandakan "ini data katalog, bukan narasi" |

Skala: 13 · 15 · 17 · 19 · 24 · 32 · 44 · 64 · 88. Body **19px minimum**; sebagian pengguna arsip lisan berusia lanjut, dan 16px adalah keputusan desainer, bukan keputusan pembaca.

### 2.3 Ruang & bentuk
Skala spasi 4px (4/8/12/16/24/32/48/64/96). Radius 0 untuk kartu arsip dan tabel (register, bukan aplikasi konsumen); radius 999px hanya untuk chip filter. Garis: 1px `--wedelan` pada 20% opacity. Tanpa bayangan lembut di mana pun — bayangan adalah bahasa aplikasi SaaS.

## 3. Elemen signature: **Kartu Register**
Setiap halaman arsip dibuka dengan blok mono bergaris seperti kartu katalog perpustakaan, **sebelum** prosa apa pun:
```
ARSIP  AHI/BTP/2026/014        DIREKAM  12 Maret 2026, Kauman, Pekalongan
DURASI 01:04:38                BAHASA   Indonesia, Jawa
NARASUMBER Sumarni (l. 1948)   HAK      CC BY-NC-ND 4.0
AKSES  Sorotan terbuka · Rekaman penuh melalui permohonan
```
Kenapa ini, bukan hero besar bergradasi: kartu ini menjawab semua pertanyaan pertama seorang peneliti dalam satu blok, memberi situs otoritas arsip secara instan, dan setiap barisnya adalah data nyata dari database — bukan ornamen. Ini juga blok yang paling mudah dikutip oleh mesin jawaban AI (GEO.md §4).

Ini satu-satunya tempat kita "berani". Sisa halaman tenang.

## 4. Struktur halaman kunci

### 4.1 Homepage
Hero **bukan** foto besar bertumpuk teks. Hero adalah **pernyataan + hitungan**:
```
┌──────────────────────────────────────────────────────┐
│ SETIAP BUDAYA BERTAHAN                               │
│ KARENA ADA YANG MENGINGAT.        62 sejarah lisan   │
│                                   95 jam rekaman     │
│ [Jelajahi arsip]  [Tonton cerita] 12 komunitas       │
└──────────────────────────────────────────────────────┘
```
Kalimat itu dari mockup Anda dan kuat — pertahankan. Angka di sebelahnya melakukan dua hal sekaligus: membuktikan ini arsip sungguhan, dan menjadi fakta terkutip untuk AI. Angka wajib nyata dan otomatis dari database. Angka karangan pada situs arsip adalah bunuh diri kredibilitas.
Lalu: Cerita Pilihan (3) → Jelajahi berdasarkan tema → Peta Batik Pekalongan → Koleksi → Dokumentasi terbaru → Kutipan bulan ini → Mitra (**hanya mitra nyata**) → Newsletter.

### 4.2 Halaman arsip
Kartu Register → Pemutar → Transkrip → Foto arsip → Narasumber → Arsip terkait → CTA permohonan akses.
Transkrip tampil **terbuka**, bukan di balik accordion tertutup yang isinya baru dimuat saat diklik. Boleh `<details>` (isi tetap ada di HTML); tidak boleh lazy-inject.

### 4.3 Jelajah
Panel facet kiri (tema · wilayah · periode · bahasa · jenis materi · narasumber), tiga mode tampilan: daftar · peta · linimasa. Facet mengubah URL (bisa dibagikan), dan hanya kombinasi terpilih yang boleh terindeks (SEO.md §6).

## 5. Video Player Component

### 5.1 Anatomi
```
┌─────────────────────────────────────────────┐
│                                             │
│         [ thumbnail dari CDN sendiri ]      │   status: façade
│              ( ▶ )  besar, mengambang       │   0 request ke Google
│                                             │
├─────────────────────────────────────────────┤
│ ▶ ‖   ━━━━━━━━●────────────  12:04 / 14:22  │   kontrol kustom
│ 🔊 ━━━━━   1×   CC   ⤢                      │   (muncul setelah play)
└─────────────────────────────────────────────┘
  Wawancara Ibu Sumarni · Kauman, 12 Maret 2026 · 14:22
  ── Memutar video akan memuat pemutar YouTube (mode tanpa cookie).

  TRANSKRIP  ─────────────────────────────────────────
  [00:00] Pewawancara: ...
```

### 5.2 Aturan komponen
- **Satu komponen `<ArsipPlayer>`** untuk semua tier. Halaman tidak pernah menulis `<iframe>` sendiri (ARCHITECTURE §4.1).
- **Status visual eksplisit:** `idle` (façade) → `loading` (skeleton, bukan spinner berputar tanpa akhir) → `playing` → `error` (panel fallback) → `restricted` (kartu "Ajukan akses").
- **Kontrol kustom, bukan overlay penutup.** Control bar YouTube tidak dirender (`controls=0`), jadi tidak ada yang perlu ditutupi. Menutupi elemen player melanggar ToS dan merusak aksesibilitas (VIDEO_EMBED §2.3).
- **Rasio 16:9 dikunci lewat `aspect-ratio`** agar CLS = 0.
- **Tombol Play ≥ 64×64px.** Target sentuh untuk tangan yang tidak muda.
- **Keyboard penuh:** Space play/pause, ←/→ ±5 dtk, ↑/↓ volume, M mute, C takarir, F fullscreen. Fokus terlihat jelas (outline 3px `--soga-kuning`).
- **`prefers-reduced-motion`:** tanpa animasi kemunculan kontrol.
- **Kondisi terbatas** menampilkan kartu, bukan pemutar rusak: judul, durasi, alasan pembatasan, dan tombol "Ajukan akses arsip". Pesan buntu selalu diberi jalan keluar.
- **Kondisi gagal** menampilkan panel fallback (VIDEO_EMBED §6), bukan iframe kosong.

### 5.3 Salinan antarmuka pemutar
| Situasi | Teks |
|---|---|
| Tombol play | `Putar video` + label ARIA berisi judul & durasi |
| Catatan privasi | `Memutar video akan memuat pemutar YouTube (mode tanpa cookie).` |
| Gagal muat | `Pemutar tidak dapat dimuat dari jaringan Anda. Putar dari server Arsip Hidup, atau baca transkrip lengkap di bawah.` |
| Terbatas | `Rekaman penuh (1 jam 4 menit) tersedia melalui permohonan akses riset.` |
| Setelah selesai | `Selesai. Lanjut: transkrip lengkap · 3 arsip terkait` |

Perhatikan: tidak ada permintaan maaf, tidak ada "Oops!". Pesan kegagalan menyebut apa yang terjadi dan langkah berikutnya.

## 6. Foto & media
- Rasio dikunci (3:2 lanskap, 4:5 potret), `width`/`height` selalu ditulis.
- **Tanpa filter sepia/vintage.** Foto arsip disajikan apa adanya; memberi filter pada dokumentasi adalah memalsukan sumber.
- Kredit foto + tahun wajib tampil di `<figcaption>`, bukan tersembunyi di hover.
- `alt` deskriptif, bukan "foto batik". Ditegakkan constraint database (SCHEMA §3).

## 7. Nada tulisan antarmuka
Bahasa Indonesia baku tapi manusiawi. Sebutkan orang dengan hormat sebagaimana mereka ingin disebut (`display_consent`). Hindari "melestarikan warisan leluhur di era digital" dan sejenisnya — kalimat itu tidak mengatakan apa pun. Tulis: "Sumarni membatik sejak umur sembilan tahun. Ini rekaman percakapan empat jam bersamanya."
Tombol menyebut akibatnya: `Ajukan akses`, bukan `Kirim`. Toast setelahnya: `Permohonan terkirim`.

## 8. Aksesibilitas (lantai kualitas, bukan fitur)
WCAG 2.2 AA · fokus terlihat di semua kontrol · target sentuh ≥ 44px (pemutar ≥ 64px) · situs berfungsi tanpa JS untuk membaca · takarir untuk semua video publik · transkrip untuk semua audio · `lang` benar termasuk penanda `jv` pada kutipan berbahasa Jawa · `prefers-reduced-motion` dihormati.

## 9. Performa desain
Font: hanya bobot yang benar-benar dipakai, `font-display: swap`, self-host (tanpa Google Fonts — request pihak ketiga + isu privasi). Total font < 180 KB. Tanpa pustaka animasi. Peta dan pemutar dimuat sebagai island, bukan di bundle utama.
