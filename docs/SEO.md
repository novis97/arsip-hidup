# SEO — Arsip Hidup Indonesia
**Versi:** 0.3 · 20 Agustus 2026 · Domain kanonik: `https://arsiphidup.id`

---

## 0. Realita yang perlu disepakati lebih dulu

Situs arsip lisan tidak bersaing untuk kata kunci komersial dan sebaiknya tidak mencoba. "Batik Pekalongan" dikuasai marketplace dan toko; kita tidak akan menang dan tidak perlu menang. Nilai SEO situs ini ada di **long-tail spesifik yang tidak dimiliki siapa pun**: nama narasumber, nama motif, nama kampung, praktik teknis, dan kalimat yang benar-benar diucapkan orang dalam wawancara.

Aset SEO terbesar situs ini bukan halaman "Tentang" atau blog — melainkan **transkrip**. Satu wawancara 60 menit menghasilkan 7.000–9.000 kata teks unik yang tidak ada di internet mana pun. Enam puluh dua wawancara = ratusan ribu kata konten orisinal. Tidak ada situs batik komersial yang bisa menandingi itu.

**Konsekuensi prioritas:** transkrip lebih penting daripada desain homepage. Kalau anggaran waktu harus dipotong, potong yang lain.

## 1. Arsitektur URL
```
/                                          Beranda
/koleksi                                   Indeks koleksi
/koleksi/batik-tulis-pekalongan            Halaman koleksi (hub)
/koleksi/batik-tulis-pekalongan/{slug}     Halaman arsip
/koleksi/batik-tulis-pekalongan/{slug}/transkrip   Transkrip penuh (jika sangat panjang)
/narasumber/{slug}                         Profil narasumber
/cerita                                    Indeks editorial
/cerita/{slug}                             Artikel
/jelajah                                   Faceted browse
/tema/{slug}                               Halaman tema (halaman peringkat, bukan sekadar filter)
/wilayah/{slug}                            Halaman wilayah
/direktori                                 Direktori pelaku batik
/direktori/{slug}                          Detail pelaku
/peta-warna                                Peta Warna Batik Pekalongan
/linimasa                                  Timeline
/tentang, /tentang/metodologi, /tentang/etika, /tentang/tim, /tentang/mitra, /tentang/faq
/terlibat  (+ #rekomendasi-karya, /terlibat/akses-arsip)
/berita, /berita/{slug}
/kontak
/en/...                                    Versi Inggris
```
Aturan: huruf kecil, tanda hubung, tanpa tanggal di URL (arsip tidak basi), tanpa ID numerik, slug tidak berubah setelah publish. Kalau harus berubah → 301, selalu.

## 2. Pemetaan kata kunci

| Halaman | Primer | Sekunder |
|---|---|---|
| Beranda | arsip sejarah lisan indonesia | dokumentasi budaya, arsip digital budaya |
| Koleksi BTP | sejarah lisan batik tulis pekalongan | dokumentasi pembatik pekalongan |
| Halaman arsip | `{nama narasumber} pembatik pekalongan` | wawancara pembatik, `{motif}` |
| Narasumber | `{nama} pembatik pekalongan` | maestro batik `{kampung}` |
| Peta Warna | warna alami batik pekalongan | pewarna mengkudu, indigo/nila batik, soga |
| Linimasa | sejarah batik pekalongan | batik pesisir, pengaruh tionghoa/arab/belanda pada batik |
| Tema Lingkungan | banjir rob pekalongan pembatik | dampak rob industri batik |
| Direktori | pengrajin batik tulis pekalongan | daftar pembatik pekalongan |
| Metodologi | metode sejarah lisan | wawancara sejarah lisan, shared authority |
| Akses arsip | akses arsip penelitian batik | izin penelitian sejarah lisan |

Long-tail yang sesungguhnya bernilai muncul dari transkrip sendiri: nama motif, istilah teknis (nyanting, nembok, medel, nglorod), nama kampung (Kauman, Pesindon, Banyurip, Jenggot, Buaran). Jangan targetkan manual — pastikan saja transkrip terindeks dan halaman tema/motif ada untuk menampungnya.

## 3. Head metadata per tipe halaman
```html
<html lang="id">
<title>Sumarni, Pembatik Kauman — Arsip Hidup Indonesia</title>   <!-- ≤60 karakter -->
<meta name="description" content="Wawancara sejarah lisan 64 menit dengan Sumarni (l. 1948), pembatik tulis Kauman, Pekalongan: pewarna alam, banjir rob, dan regenerasi pembatik.">
<link rel="canonical" href="https://arsiphidup.id/koleksi/batik-tulis-pekalongan/sumarni-01">
<link rel="alternate" hreflang="id" href="https://arsiphidup.id/...">
<link rel="alternate" hreflang="en" href="https://arsiphidup.id/en/...">
<link rel="alternate" hreflang="x-default" href="https://arsiphidup.id/...">
<meta property="og:type" content="article">
<meta property="og:locale" content="id_ID">
<meta property="og:image" content="https://cdn.arsiphidup.id/og/sumarni-01.jpg"> <!-- 1200x630 -->
<meta name="twitter:card" content="summary_large_image">
```
Formula title: `{Subjek spesifik} — {Konteks} | Arsip Hidup Indonesia`. Meta description ditulis manusia, bukan potongan otomatis paragraf pertama.
**Peringatan privasi:** kalau `display_consent = anonymous`, nama tidak boleh muncul di title, description, OG, maupun URL. Ini pelanggaran yang paling mudah terjadi lewat template otomatis.

## 4. Struktur heading & konten
- Tepat satu `<h1>` per halaman = judul arsip/cerita.
- `<h2>` mengikuti struktur nyata: Tentang wawancara · Transkrip · Foto arsip · Narasumber · Arsip terkait.
- Kartu Register (DESIGN §3) ditulis sebagai `<dl>` — bukan tabel gambar, bukan div berisi teks bebas.
- Semantik: `<article>`, `<figure>/<figcaption>`, `<blockquote cite>`, `<time datetime>`.
- Minimal 300 kata teks unik di setiap halaman arsip **di luar** transkrip. Halaman yang isinya hanya embed video + judul adalah halaman tipis.

## 5. Structured data
| Halaman | Tipe |
|---|---|
| Global | `Organization` (+ `sameAs`), `WebSite` dengan `SearchAction` |
| Semua | `BreadcrumbList` |
| Koleksi | `Collection` + `ArchiveComponent` |
| Arsip | `VideoObject` (VIDEO_EMBED §7) + `ArchiveComponent` (`holdingArchive` → `ArchiveOrganization`) |
| Narasumber | `Person` — **hanya jika `display_consent = full_name`** |
| Cerita | `Article` dengan `author`, `datePublished`, `dateModified` |
| Direktori | `LocalBusiness` per pelaku, `ItemList` di indeks |
| FAQ | `FAQPage` |
| Konten terbatas | `isAccessibleForFree: false` + `hasPart` `WebPageElement` `cssSelector` untuk bagian gratis |

Aturan: markup hanya untuk konten yang benar-benar tampil di halaman. Menandai konten tersembunyi adalah risiko manual action.

## 6. Faceted navigation — jangan sampai jadi crawl trap

Ini kesalahan teknis terbesar yang menunggu di halaman `/jelajah`. Enam facet dengan masing-masing 10 nilai menghasilkan lebih dari satu juta kombinasi URL. Googlebot akan menghabiskan crawl budget di sana dan halaman arsip Anda yang sesungguhnya tidak terindeks.

**Kebijakan:**
- Facet tunggal bernilai tinggi diberi **URL bersih dan boleh diindeks**: `/tema/lingkungan-bencana`, `/wilayah/kauman`. Halaman-halaman ini diperlakukan sebagai konten (punya intro 150–300 kata, hero, arsip terpilih).
- Kombinasi 2+ facet memakai **query string** dan diberi `<meta name="robots" content="noindex,follow">` + canonical ke facet tunggal induknya.
- Parameter urutan/tampilan (`?sort=`, `?view=map`, `?page=`) selalu `noindex,follow`; kecuali paginasi indeks utama yang dibiarkan `index,follow` dengan canonical mandiri per halaman.
- `robots.txt`: `Disallow: /*?sort=` dan `Disallow: /*&`.
- Tautan facet di HTML memakai `<a>` biasa untuk facet yang boleh diindeks; kombinasi lanjutan dirender lewat JS/`rel="nofollow"`.

## 7. Sitemap
Sitemap index + sitemap per tipe: `collections`, `items`, `narasumber`, `stories`, `themes`, `directory`, `pages`. `lastmod` nyata dari `updated_at` — `lastmod` palsu yang selalu hari ini membuat Google berhenti mempercayainya. Sitemap gambar untuk foto arsip. Regenerasi tiap build.

## 8. `robots.txt`
```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /*?sort=
Disallow: /*&
Disallow: /terlibat/akses-arsip/status

Sitemap: https://arsiphidup.id/sitemap.xml
```
Kebijakan crawler AI diatur terpisah di GEO.md §5 — dan berbeda dari kebijakan crawler pencarian. Bacalah sebelum menyalin blok robots.txt standar.

## 9. Performa (Core Web Vitals)
Target: LCP < 2,0s · CLS < 0,1 · INP < 200ms.
Pendorong utama: SSG + CDN · façade video (embed YouTube penuh menambah ratusan KB dan puluhan request sebelum pengguna menonton apa pun) · font self-host terbatas · gambar WebP/AVIF dengan dimensi eksplisit · peta dan pemutar sebagai island · tanpa cookie banner (analytics cookieless).

## 10. Internal linking
- Setiap halaman arsip menaut ke: koleksinya, narasumbernya, 2–3 temanya, 3 arsip terkait, dan cerita yang mengutipnya.
- Setiap cerita menaut ke arsip sumbernya (`related_item_ids`). Ini bukan sekadar SEO — ini yang membuat klaim editorial bisa ditelusuri ke sumbernya, yang merupakan inti Public History.
- Anchor text deskriptif. Tidak ada "klik di sini".
- Kedalaman maksimal 3 klik dari beranda ke halaman arsip mana pun.

## 11. Multibahasa
`hreflang` timbal balik, `x-default` ke ID. Jangan terbitkan halaman EN hasil terjemahan mesin tanpa suntingan — terjemahan buruk atas testimoni orang adalah masalah etis sekaligus SEO.

## 12. Migrasi & pemeliharaan
- **Tidak ada rencana migrasi domain.** `arsiphidup.id` bersifat permanen (PRD B-1). Bila suatu saat ada instansi pengampu dan muncul wacana `.go.id`, perlakukan sebagai proyek tersendiri: 301 menyeluruh, `arsiphidup.id` dipertahankan minimal 2 tahun sebagai pengalih, canonical & sitemap diperbarui, properti Search Console baru didaftarkan. Bukan sekadar penggantian DNS.
- Audit bulanan: cakupan Search Console, 404, kecepatan indeks halaman baru, halaman tipis.
- Setiap URL yang mati wajib 301, bukan 404 diam-diam.

## 13. Yang sengaja TIDAK dilakukan
- Tanpa blog SEO generik ("5 Tips Merawat Kain Batik"). Merusak posisi sebagai arsip dan bersaing di ceruk yang salah.
- Tanpa penukaran backlink. Tautan dari perpustakaan, universitas, dan jurnal jauh lebih bernilai — dan datang dari kualitas arsip, bukan dari outreach.
- Tanpa halaman "coming soon". Halaman tipis merugikan seluruh domain.
- Tanpa pop-up newsletter yang menutupi konten.
