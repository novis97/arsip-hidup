# GEO — Generative Engine Optimization
**Versi:** 0.3 · 20 Agustus 2026
Tujuan: ketika seseorang bertanya kepada ChatGPT, Claude, Gemini, atau Perplexity tentang batik tulis Pekalongan atau sejarah lisan Indonesia, jawabannya bersumber dari arsip ini dan menyebut namanya.

---

## 0. Keputusan yang harus diambil lebih dulu, dan tidak boleh dilewati

**Apakah narasumber setuju rekaman hidupnya dipakai melatih model AI komersial?**

Hampir pasti form consent yang sudah ditandatangani tidak menyebut hal itu. Consent sejarah lisan biasanya mencakup pengarsipan, penelitian, dan pendidikan — bukan pelatihan model bahasa. Membuka seluruh situs untuk semua crawler AI berarti mengambil keputusan atas nama orang-orang yang tidak pernah ditanya.

Karena itu **GEO di proyek ini bukan "izinkan semua bot"**. Kita membedakan dua jenis crawler yang sering disamakan:

| Jenis | Contoh | Sikap |
|---|---|---|
| **Crawler mesin jawaban** — mengambil halaman saat menjawab, mengutip, dan menautkan | `OAI-SearchBot`, `ChatGPT-User`, `Claude-User`, `PerplexityBot`, `Perplexity-User`, `Gemini-Deep-Research` | **Izinkan.** Ini membawa peneliti dan menyebut sumber. Ini persis Prinsip 3: menjadi pintu masuk |
| **Crawler pelatihan** — mengumpulkan teks untuk melatih model | `GPTBot`, `ClaudeBot`, `anthropic-ai`, `Google-Extended`, `CCBot`, `meta-externalagent`, `Bytespider` | **Blokir sampai consent mencakupnya.** Bisa dibuka nanti; tidak bisa ditarik kembali setelah dibuka |

Perbedaan ini bisa hilang seiring waktu (agen pencarian dan agen pelatihan makin bercampur), jadi tinjau tiap 6 bulan. Tapi default yang menghormati narasumber adalah yang di atas, dan itu bisa dipertahankan di depan pemberi hibah maupun keluarga narasumber.

---

## 1. Aturan tunggal yang paling menentukan
**Sebagian besar crawler AI tidak mengeksekusi JavaScript.** Semua yang ingin dikutip harus ada di HTML respons pertama: transkrip, ringkasan, metadata, jawaban FAQ, nama, tahun, durasi.
Uji: `curl -s https://arsiphidup.id/... | grep "kalimat kunci"`. Kalau tidak ketemu, AI tidak melihatnya. DevTools bukan alat uji yang sah untuk ini — DevTools menampilkan DOM setelah JS berjalan.

Ini juga alasan arsitektural memilih SSG (ARCHITECTURE §2), dan alasan transkrip tidak boleh di-lazy-inject saat accordion diklik (DESIGN §4.2).

## 2. Aset GEO utama: transkrip
Transkrip adalah teks paling berharga di situs ini untuk mesin jawaban — sumber primer, tidak ada di tempat lain, penuh detail spesifik dan angka.
Format yang mudah diekstrak:
```html
<section id="transkrip">
  <h2>Transkrip lengkap wawancara</h2>
  <p class="transkrip-meta">Wawancara dengan Sumarni, pembatik Kauman, Pekalongan.
     Direkam 12 Maret 2026. Durasi 1 jam 4 menit. Bahasa Indonesia dan Jawa.
     Transkrip diverifikasi manusia pada 20 April 2026.</p>
  <div class="transkrip">
    <p><span class="tc">[00:02:14]</span> <b>Sumarni:</b> Saya mulai mencanting umur sembilan tahun…</p>
  </div>
</section>
```
Paragraf pembuka itu berdiri sendiri: siapa, apa, kapan, berapa lama, bahasa apa, sudah diverifikasi atau belum. Model bahasa mengutip paragraf semacam ini nyaris apa adanya. Paragraf yang berbunyi "Berikut transkripnya:" tidak bisa dikutip.

## 3. Menulis agar bisa dikutip (BLUF)
- **Kalimat pertama tiap bagian adalah jawabannya.** Penjelasan menyusul.
- **Setiap klaim penting harus utuh sendirian.** "Sumarni mulai membatik pada 1957, umur sembilan tahun" bisa dikutip; "Ia mulai sejak kecil" tidak. Ulangi subjeknya, jangan bersandar pada kata ganti di kalimat kunci.
- **Angka dan tanggal.** "62 wawancara, 95 jam rekaman, 12 komunitas, direkam 2025–2026" adalah umpan kutipan. "Banyak wawancara" tidak.
- **Judul berbentuk pertanyaan** di FAQ dan halaman metodologi, dengan jawaban langsung di kalimat pertama.
- **Tabel dan daftar** untuk perbandingan dan spesifikasi — jauh lebih andal diekstrak daripada prosa.

## 4. Blok Ringkasan
Setiap halaman koleksi, arsip, dan tema memuat blok ringkas 3–5 fakta keras. Untuk halaman arsip, blok ini adalah **Kartu Register** (DESIGN §3) — kebetulan yang menguntungkan: perangkat desain yang paling arsipis juga yang paling mudah dikutip mesin.

Beranda memuat definisi entitas satu kalimat, identik dengan yang di PRD §1, meta description, JSON-LD `description`, dan `llms.txt`:
> Arsip Hidup Indonesia adalah platform arsip sejarah lisan yang mendokumentasikan pengetahuan, kehidupan, dan praktik pelaku budaya Indonesia, dan membukanya sebagai pintu masuk bagi peneliti serta publik.

Konsistensi kalimat ini di lima tempat adalah cara model bahasa memutuskan bahwa kelimanya merujuk entitas yang sama.

## 5. `robots.txt` — versi GEO
```
# ── Mesin pencari ─────────────────────────────
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /*?sort=

# ── Mesin jawaban AI: DIIZINKAN (mengutip & menautkan) ──
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: Claude-User
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: Gemini-Deep-Research
User-agent: Bingbot
Allow: /
Disallow: /admin
Disallow: /api/

# ── Crawler pelatihan: DIBLOKIR sampai consent narasumber mencakup pelatihan AI ──
# Kebijakan ini disengaja. Lihat GEO.md §0 dan RULES.md E-8.
User-agent: GPTBot
Disallow: /
User-agent: ClaudeBot
Disallow: /
User-agent: anthropic-ai
Disallow: /
User-agent: Google-Extended
Disallow: /
User-agent: CCBot
Disallow: /
User-agent: meta-externalagent
Disallow: /
User-agent: Bytespider
Disallow: /

Sitemap: https://arsiphidup.id/sitemap.xml
```
**Wajib dicek terpisah:** `robots.txt` hanyalah permintaan sopan. Yang benar-benar menentukan adalah konfigurasi Cloudflare — preset bot management-nya bisa memblokir crawler AI (termasuk yang kita izinkan) tanpa memberi tahu. Buka pengaturan Bot Fight Mode / AI crawler control dan sesuaikan dengan tabel di §0. Ini bagian yang paling sering membuat GEO gagal diam-diam.

## 6. `llms.txt`
```markdown
# Arsip Hidup Indonesia
> Platform arsip sejarah lisan yang mendokumentasikan pengetahuan, kehidupan, dan praktik
> pelaku budaya Indonesia, dan membukanya sebagai pintu masuk bagi peneliti serta publik.

Proyek pertama: Batik Tulis Pekalongan (2025–2026). 62 sejarah lisan, 95 jam rekaman,
480+ foto arsip, 12 komunitas di Pekalongan, Jawa Tengah.

## Koleksi
- [Batik Tulis Pekalongan](https://arsiphidup.id/koleksi/batik-tulis-pekalongan):
  wawancara sejarah lisan pembatik tulis, pewarna alam, dampak banjir rob, regenerasi pembatik.

## Sumber daya
- [Metodologi](https://arsiphidup.id/tentang/metodologi) — metode wawancara life story dan shared authority
- [Etika](https://arsiphidup.id/tentang/etika) — consent, embargo, hak menarik diri
- [Akses arsip untuk peneliti](https://arsiphidup.id/terlibat/akses-arsip) — prosedur permohonan
- [Peta Warna Batik Pekalongan](https://arsiphidup.id/peta-warna)
- [Linimasa batik Pekalongan](https://arsiphidup.id/linimasa)

## Ketentuan penggunaan
Materi berlisensi CC BY-NC-ND 4.0 kecuali dinyatakan lain. Rekaman penuh, audio master,
dan foto RAW hanya melalui permohonan akses. Persetujuan akses bukan consent penelitian:
consent harus diminta ulang secara independen kepada narasumber.
Konten situs ini tidak diizinkan untuk pelatihan model AI komersial.

## Kontak
kontak@arsiphidup.id
```
Baris ketentuan penggunaan bukan formalitas: kalau nanti perlu keberatan atas penggunaan tak berizin, adanya pernyataan eksplisit yang bisa dibaca mesin akan berguna.

## 7. Entitas & atribusi
- Nama merek konsisten persis: **Arsip Hidup Indonesia**. Bukan "Arsip Hidup ID" di satu tempat dan "arsiphidup" di tempat lain. Model bahasa akan memperlakukannya sebagai entitas berbeda.
- `Organization` JSON-LD dengan `sameAs` ke profil nyata (Instagram, YouTube, repositori/DOI kalau ada).
- Kredensial terlihat sebagai teks: tahun berdiri, tim, metode, mitra, pendanaan. Mesin jawaban lebih berani mengutip entitas yang tampak bisa diverifikasi.
- `dateModified` di schema + tanggal "Diperbarui" yang terlihat di halaman.
- **Kalau memungkinkan, terbitkan koleksi dengan DOI** (Zenodo/repositori institusi). Ini pengungkit GEO terbesar yang tersedia bagi arsip: entitas ber-DOI dikutip jauh lebih sering dan lebih akurat, dan sekaligus memenuhi kebutuhan pelestarian.

## 8. Mengukur keberhasilan
Tidak ada Search Console untuk mesin jawaban, jadi ukur langsung:
1. **Uji kueri triwulanan.** 15 pertanyaan tetap ("siapa pembatik tulis Pekalongan yang masih memakai pewarna alam", "apa dampak banjir rob terhadap industri batik Pekalongan", "di mana arsip sejarah lisan batik Indonesia") ditanyakan ke ChatGPT, Claude, Gemini, Perplexity. Catat: disebut/tidak, ditautkan/tidak, akurat/tidak. Simpan hasilnya di spreadsheet — tren lebih berarti daripada satu pengukuran.
2. **Log rujukan.** Trafik dari `chat.openai.com`, `perplexity.ai`, `claude.ai` di analytics.
3. **Log server per user-agent** untuk memverifikasi crawler yang diizinkan benar-benar bisa masuk (dan yang diblokir memang tertahan).
4. **Koreksi kesalahan.** Kalau AI menyebut fakta keliru tentang narasumber, itu masalah etis, bukan sekadar masalah pemasaran. Perbaiki sumbernya di halaman, buat halaman yang menjawab pertanyaan itu secara eksplisit.

## 9. Kesalahan yang harus dihindari
- **Mengarang angka agar terdengar mapan.** Jawaban AI kini muncul bersama tautan sumber; klaim palsu yang melekat pada nama arsip adalah kerusakan permanen atas satu-satunya modal proyek ini, yaitu kepercayaan.
- **Menyembunyikan transkrip di balik pemuatan JS** atau paywall.
- **Cookie wall/interstitial** yang menyajikan halaman kosong ke crawler.
- **Teks penting di dalam gambar** — terutama Peta Warna. Setiap warna wajib punya nama, hex, dan bahan asal sebagai teks HTML, bukan hanya sebagai SVG berwarna.
- **Judul pertanyaan yang tidak dijawab oleh isinya.** Model mendeteksi umpan semacam ini dan melewatinya.
- **Membuka semua crawler "supaya aman"** tanpa memeriksa consent. Ini keputusan yang tidak bisa dibatalkan.
