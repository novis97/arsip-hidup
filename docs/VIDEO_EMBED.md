# VIDEO_EMBED — Spesifikasi Pemutar Video Arsip Hidup
**Versi:** 0.4 · 20 Agustus 2026
**Tujuan produk:** pengunjung menonton tanpa terlempar keluar dari `arsiphidup.id`.

---

## 1. Ringkasan keputusan

| Aspek | Keputusan |
|---|---|
| Domain embed | `www.youtube-nocookie.com` — **disetujui, dipakai** |
| Façade / lite embed | **Disetujui, wajib.** Nol request ke Google sebelum klik Play |
| `rel=0` | Dipakai, tapi **tidak** melakukan apa yang brief asumsikan (lihat §2.2) |
| `modestbranding=1` | **Dibuang.** Sudah tidak berfungsi sejak 15 Agustus 2023 |
| Kontrol kustom via IFrame API + `controls=0` | **Disetujui, dipakai.** Jalur resmi YouTube |
| Sandbox tanpa `allow-popups` | **Disetujui, dipakai.** Cara sah mencegah lompat ke youtube.com |
| Overlay CSS penutup logo / tombol "Watch on YouTube" | **DITOLAK.** Melanggar ToS, nol nilai keamanan (§2.3) |
| `referrerpolicy="strict-origin-when-cross-origin"` | Disetujui |
| Transkrip + deskripsi di bawah video | Disetujui, wajib |
| Schema `VideoObject` | Disetujui, dengan koreksi soal `contentUrl` (§7) |
| Fallback R2 | Disetujui, diperluas |
| Materi terbatas di YouTube | **DILARANG** — self-host R2 |

---

## 2. Koreksi terhadap brief — baca ini sebelum implementasi

### 2.1 `modestbranding=1` sudah mati
YouTube mendeprekasi parameter ini per **15 Agustus 2023**; dokumentasi resmi YouTube IFrame Player API menyatakan parameter tersebut tidak lagi berpengaruh dan player kini menentukan sendiri branding yang sesuai dengan ketentuan mereka. Logo tetap muncul apa pun yang Anda kirim.
**Tindakan:** boleh tetap dicantumkan (tidak berbahaya, sekadar diabaikan), tapi **jangan** menjanjikan ke klien bahwa logo YouTube akan hilang. Itu janji yang akan meleset saat demo.

### 2.2 `rel=0` tidak mematikan video lain
Sejak September 2018, `rel=0` hanya membatasi video terkait ke channel yang sama, bukan menghilangkannya. Tidak ada cara resmi menghapus grid video terkait dari embed standar sampai hari ini.
**Konsekuensi nyata:** semua video wajib di-upload dari **satu channel resmi Arsip Hidup Indonesia**. Kalau tidak, di akhir video akan muncul rekomendasi acak dari seluruh YouTube — persis skenario yang ingin Anda cegah. Ini keputusan operasional, bukan teknis: jangan pernah embed video dari channel orang lain di halaman arsip.
Mitigasi tambahan: pakai kontrol kustom + event `onStateChange`. Saat `PlayerState.ENDED`, panggil `stopVideo()` dan segera tampilkan panel penutup milik kita sendiri (transkrip, arsip terkait). Layar end-screen YouTube tidak sempat muncul. Ini sah — kita mengendalikan player lewat API resminya, bukan menutupinya.

### 2.3 Overlay CSS penutup logo/tombol adalah pelanggaran ToS — ditolak
YouTube API Services Terms of Service melarang memodifikasi, membangun di atas, atau **memblokir bagian mana pun maupun fungsionalitas player YouTube**, termasuk menutupi tautan dan branding. Sanksinya bukan denda — akses embed atau channel bisa dicabut, dan seluruh video arsip hilang dari situs dalam sekali kejadian.
Ada dua alasan tambahan untuk menolak, terlepas dari ToS:
1. **Nol nilai keamanan.** Overlay adalah CSS. `Ctrl+U`, DevTools, atau "salin URL video" tetap membongkar ID-nya. Kalau tujuan sesungguhnya adalah mencegah materi tersebar, overlay tidak melakukan apa-apa.
2. **Menghalangi kontrol player merusak aksesibilitas** dan berpotensi menutupi tombol takarir — bermasalah untuk arsip lisan yang penontonnya termasuk lansia dan tuli.

**Yang dipakai sebagai gantinya (semuanya sah dan lebih efektif):**
- `sandbox` tanpa `allow-popups` → browser memblokir pembukaan tab youtube.com. Kita tidak menyembunyikan apa pun; klik itu sekadar tidak membuka tab baru.
- `controls=0` + kontrol kustom → tombol "Watch on YouTube" ada di control bar, dan control bar itu memang tidak dirender.
- `stopVideo()` di `ENDED` → end-screen tidak sempat tampil.
- Materi yang benar-benar tidak boleh menyebar → tidak di YouTube sama sekali.

### 2.4 "User tidak bisa keluar ke youtube.com" adalah target UX, bukan jaminan
Katakan ini apa adanya ke PIHAK PERTAMA. Yang bisa dijamin: tidak ada tautan keluar dari kita, tidak ada pop-up, tidak ada auto-redirect, tidak ada rekomendasi lintas-channel di akhir video. Yang tidak bisa dijamin: pengguna yang niat menyalin ID video dan membuka YouTube sendiri.

---

## 3. Matriks keputusan tier

| Tier | Materi | Backend | Alasan |
|---|---|---|---|
| **PUBLIK** | Story clip, Highlight ≤15 menit, cuplikan promosi | YouTube nocookie + façade | Bandwidth gratis, transcoding gratis, CDN global. Materi ini memang dimaksudkan untuk tersebar |
| **TERBATAS** | Video lengkap ~60 menit, audio master, foto RAW | R2 + HLS + presigned URL | Butuh kontrol akses, pencabutan, dan audit. YouTube tidak menyediakan ketiganya |
| **FALLBACK** | Mirror materi publik | R2 progressive MP4 | Untuk jaringan yang memblokir YouTube (banyak jaringan kampus & instansi) |

**Aturan keras:** `access_tier='restricted'` + `video_source='youtube'` = kombinasi terlarang, ditegakkan oleh CHECK constraint di database (SCHEMA §2), bukan oleh niat baik admin. Alasannya di PRD B-5: unlisted bukan kontrol akses.

---

## 4. Implementasi façade (tier PUBLIK)

### 4.1 HTML yang dirender server (sebelum interaksi)
```html
<figure class="arsip-player" data-video-source="youtube" data-video-id="XXXXXXXXXXX"
        data-title="Ibu Sumarni — Perempuan yang Tak Pernah Berhenti Membatik">
  <div class="arsip-player__frame" style="aspect-ratio:16/9">
    <img src="https://cdn.arsiphidup.id/thumbs/sumarni-01-1280.webp"
         srcset="https://cdn.arsiphidup.id/thumbs/sumarni-01-640.webp 640w,
                 https://cdn.arsiphidup.id/thumbs/sumarni-01-1280.webp 1280w"
         width="1280" height="720" loading="lazy" decoding="async"
         alt="Ibu Sumarni mencanting kain di teras rumahnya, Pekalongan, 2026">
    <button type="button" class="arsip-player__play"
            aria-label="Putar video: Ibu Sumarni — 14 menit 22 detik">
      <svg aria-hidden="true" ...>...</svg>
    </button>
    <noscript>
      <p>Aktifkan JavaScript untuk memutar video, atau
         <a href="/koleksi/batik-tulis-pekalongan/sumarni-01/transkrip">baca transkrip lengkapnya</a>.</p>
    </noscript>
  </div>
  <figcaption>Wawancara dengan Ibu Sumarni, Pekalongan, 12 Maret 2026. Durasi 14:22.</figcaption>
</figure>
```
**Thumbnail wajib dari CDN sendiri.** Ini titik yang paling sering salah: memakai `i.ytimg.com` berarti browser pengunjung menghubungi server Google saat halaman dimuat — persis hal yang façade seharusnya cegah. Salin thumbnail saat proses ingest.

### 4.2 Iframe yang di-inject setelah klik Play
```html
<iframe
  src="https://www.youtube-nocookie.com/embed/VIDEO_ID?autoplay=1&rel=0&iv_load_policy=3&controls=0&disablekb=1&playsinline=1&enablejsapi=1&origin=https%3A%2F%2Farsiphidup.id&hl=id&cc_lang_pref=id"
  title="Wawancara Ibu Sumarni — Arsip Hidup Indonesia"
  sandbox="allow-scripts allow-same-origin allow-presentation"
  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
  referrerpolicy="strict-origin-when-cross-origin"
  loading="lazy"
  width="1280" height="720"></iframe>
```

**Penjelasan tiap parameter (jangan cargo-cult):**

| Parameter | Fungsi nyata |
|---|---|
| `autoplay=1` | Aman di sini — user sudah klik, jadi ada gesture |
| `rel=0` | Batasi rekomendasi ke channel sendiri. Bukan mematikan |
| `iv_load_policy=3` | Matikan anotasi. Masih berfungsi |
| `controls=0` | Sembunyikan control bar bawaan **karena kita menyediakan kontrol sendiri** lewat API resmi |
| `disablekb=1` | Matikan keyboard bawaan — kita tangani sendiri agar tetap aksesibel. Jangan pakai kalau kontrol kustom belum punya dukungan keyboard |
| `playsinline=1` | Cegah iOS masuk fullscreen paksa. Penting untuk mobile |
| `enablejsapi=1` | Prasyarat mutlak IFrame API |
| `origin=` | Pembatasan postMessage. Sering dilupakan; tanpa ini API rawan |
| `hl` / `cc_lang_pref` | UI dan takarir bahasa Indonesia |
| ~~`modestbranding=1`~~ | Dihapus. Tidak berfungsi (§2.1) |

**Tentang `sandbox`:** perlu diluruskan dari brief. `allow-same-origin` di sini **tidak** memberi YouTube akses ke halaman kita — iframe berasal dari origin berbeda (`youtube-nocookie.com`), jadi "same-origin" yang dimaksud adalah origin YouTube sendiri, yang memang dibutuhkan agar player berfungsi. Nilai keamanan sandbox di kasus ini justru dari yang **tidak** diberikan:
- tanpa `allow-popups` → tab ke youtube.com diblokir browser
- tanpa `allow-top-navigation` → iframe tidak bisa membajak halaman induk
- `allow-presentation` diberikan agar Cast/AirPlay tetap jalan

**Peringatan uji:** kombinasi `sandbox` + fullscreen bisa bermasalah di sebagian browser. Fullscreen diizinkan lewat atribut `allow="fullscreen"`, bukan lewat sandbox. **Wajib diuji di Safari iOS, Chrome Android, dan Firefox desktop sebelum go-live.** Kalau ternyata patah, hapus `sandbox` dan pertahankan `allow-popups` mitigation lewat `referrerpolicy` + tanpa tautan keluar; jangan mengorbankan fungsi pemutar demi atribut yang manfaatnya marginal.

### 4.3 Kontrol kustom (YouTube IFrame Player API)
```js
// Muat API hanya setelah klik Play pertama di halaman.
let player;
function mountPlayer(el, videoId) {
  player = new YT.Player(el, {
    videoId,
    playerVars: { autoplay:1, rel:0, controls:0, playsinline:1,
                  iv_load_policy:3, enablejsapi:1, origin: location.origin, hl:'id' },
    host: 'https://www.youtube-nocookie.com',
    events: {
      onReady: () => { clearTimeout(fallbackTimer); renderControls(); },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.PLAYING) logAudit('video.play');
        if (e.data === YT.PlayerState.ENDED) {
          player.stopVideo();          // cegah end-screen YouTube
          showAfterVideoPanel();       // panel kita: transkrip, arsip terkait
          logAudit('video.complete');
        }
      },
      onError: () => showFallback()
    }
  });
}
```
Kontrol minimum: Play/Pause · Seek bar (progress + buffered) · Volume + Mute · Kecepatan (0,75×/1×/1,25×/1,5× — penting untuk wawancara panjang) · Takarir on/off · Fullscreen · Waktu berjalan/total.
**Aksesibilitas wajib (kontrol kustom sering gagal di sini):** semua tombol `<button>` asli, `aria-pressed` untuk toggle, Space = play/pause, ←/→ = ±5 dtk, ↑/↓ = volume, fokus terlihat, dan seluruh kontrol terjangkau keyboard. Kalau ini tidak dikerjakan, kontrol kustom lebih buruk daripada control bar bawaan YouTube — dan hilangnya aksesibilitas jauh lebih merugikan daripada munculnya logo YouTube.

---

## 5. Tier TERBATAS — pemutar internal

### 5.1 Masalah yang tidak boleh diselesaikan dengan presigned URL polos

Presigned URL untuk manifest `.m3u8` **tidak mengamankan apa pun**. Manifest hanyalah daftar teks; setiap segmen adalah request HTTP terpisah yang tidak ikut ditandatangani. Sebaliknya, mem-presign seluruh segmen dengan TTL 300 detik akan mematikan video 60 menit di menit keenam.

Pola yang dipakai: **sesi + redirect.**

```
1. GET /api/media/:assetId/playback           (butuh login)
   -> authorizeAsset(): master? penarikan izin? embargo? grant aktif? kuota?
   -> terbitkan token sesi HMAC (TTL 300 dtk)
   -> AuditLog: asset.signed_url_issued  [retensi long]

2. GET /api/media/:assetId/manifest.m3u8?t=…
   -> verifikasi token
   -> OTORISASI DIPERIKSA ULANG dari database, bukan dipercayakan pada token
   -> ambil manifest dari R2, tulis ulang setiap URI segmen menuju endpoint kita
   -> Cache-Control: private, no-store   (manifest berisi token)

3. GET /api/media/:assetId/segment?p=seg-042.ts&t=…
   -> verifikasi token + rate limit + safeSegmentKey (cegah path traversal)
   -> 302 ke presigned R2 dengan TTL 60 detik
   -> byte video mengalir LANGSUNG dari R2 ke pengguna; VPS hanya melayani redirect

4. Klien menyegarkan sesi pada detik ke-240 (refresh_at = TTL - 60)
```

### 5.2 Yang didapat dari pola ini
- **Pencabutan berlaku di tengah pemutaran.** Karena langkah 2 memeriksa ulang ke database, begitu grant dicabut atau narasumber menarik izin, penyegaran berikutnya gagal. Presigned URL polos tidak bisa ditarik kembali setelah terbit.
- **Bandwidth VPS mendekati nol.** Kita me-redirect, bukan mem-proxy. VPS 2 GB tidak pernah jadi leher botol.
- **Urutan pemeriksaan bermakna.** Penarikan izin narasumber diperiksa **sebelum** grant, karena tidak ada persetujuan apa pun yang membatalkannya (RULES E-3).

### 5.3 Yang TIDAK didapat, dan harus dikatakan apa adanya
- **Jendela paparan = TTL (maks 300 detik).** Token bersifat stateless, jadi yang sudah terbit tidak bisa dibatalkan seketika. Menambah tabel sesi akan menutup celah ini dengan harga satu tulis SQLite per segmen — mahal, dan 5 menit adalah trade-off yang wajar untuk arsip budaya. Kalau suatu saat tidak wajar lagi, ganti dengan tabel sesi.
- **Perekaman layar tetap mungkin.** Siapa pun yang punya akses sah bisa merekam. Yang dibeli sistem ini adalah **akuntabilitas** dan **pencabutan**, bukan kemustahilan penyalinan. Jangan menjual DRM yang tidak ada kepada pemangku kepentingan.
- **Watermark bersifat atribusi, bukan proteksi.** Ditempel di klien sebagai overlay teks berisi email + timestamp. Transcoding per-pengguna di luar anggaran, dan efek jera penyebaran ulang justru datang dari nama yang terlihat.
- **Segmen tidak dicatat di AuditLog.** Satu baris per segmen berarti ratusan tulis per pemutaran tanpa menambah informasi apa pun di atas `asset.signed_url_issued`. Keputusan sadar, bukan kelalaian.

### 5.4 Konsekuensi arsitektural yang baru terlihat saat implementasi

**Halaman pemutaran tier TERBATAS tidak bisa berada di situs statis.** Situs publik adalah HTML statis tanpa sesi, jadi ia tidak bisa mengautentikasi siapa pun. Karena itu:

| Konteks | Lokasi | Isi |
|---|---|---|
| Publik | `arsiphidup.id` (statis) | Metadata, transkrip, video tier PUBLIK, dan kartu **"Ajukan akses"** — bukan pemutar |
| Peneliti terautentikasi | `api.arsiphidup.id/arsip/…` (aplikasi Payload) | Pemutar internal HLS, unduhan, status permohonan |

Ini justru memperkuat pemisahan bidang: seluruh permukaan yang menyentuh materi terbatas berada di satu tempat, di balik login + MFA + Cloudflare Access. `ARCHITECTURE.md` §2 perlu dibaca dengan tambahan ini.

## 6. Fallback (VP-10)
Urutan pemicu:
1. Timer 5 detik sejak klik Play tanpa event `onReady` → asumsikan YouTube diblokir/down.
2. Event `onError` dari API.
3. `navigator.onLine === false` → pesan offline, bukan panel fallback.

Panel fallback menampilkan:
- Judul + durasi + penjelasan singkat ("Pemutar YouTube tidak dapat dimuat dari jaringan Anda.")
- **Tombol "Putar dari server Arsip Hidup"** bila `assets` punya mirror publik di R2
- **Tombol "Unduh video (MP4, 240 MB)"** — sebut format dan ukurannya; jangan pernah tombol unduh tanpa ukuran
- **Tautan ke transkrip lengkap** — yang memang sudah ada di halaman, sehingga isi arsip tetap tersampaikan meski video gagal total
- Tautan "Ajukan akses arsip lengkap" untuk peneliti

Poin desain: transkrip di halaman berarti kegagalan video bukan kegagalan total. Ini juga alasan mengapa transkrip bukan sekadar urusan SEO.

---

## 7. Schema `VideoObject` (SEO + GEO)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "@id": "https://arsiphidup.id/koleksi/batik-tulis-pekalongan/sumarni-01#video",
  "name": "Ibu Sumarni — Perempuan yang Tak Pernah Berhenti Membatik",
  "description": "Wawancara sejarah lisan dengan Ibu Sumarni (lahir 1948), pembatik tulis Pekalongan, tentang pewarna alam, banjir rob, dan regenerasi pembatik.",
  "thumbnailUrl": ["https://cdn.arsiphidup.id/thumbs/sumarni-01-1280.webp"],
  "uploadDate": "2026-03-20T09:00:00+07:00",
  "duration": "PT14M22S",
  "embedUrl": "https://www.youtube-nocookie.com/embed/VIDEO_ID",
  "transcript": "…teks transkrip penuh…",
  "inLanguage": ["id","jv"],
  "isPartOf": { "@type": "Collection", "@id": "https://arsiphidup.id/koleksi/batik-tulis-pekalongan#collection" },
  "contributor": { "@type": "Person", "name": "Sumarni" },
  "publisher": { "@type": "Organization", "@id": "https://arsiphidup.id/#organization" },
  "isAccessibleForFree": true,
  "license": "https://creativecommons.org/licenses/by-nc-nd/4.0/",
  "contentLocation": { "@type": "Place", "name": "Pekalongan, Jawa Tengah, Indonesia" }
}
</script>
```
**Koreksi atas brief:** brief meminta `embedUrl` **dan** `contentUrl`. Jangan isi `contentUrl` untuk video YouTube — `contentUrl` berarti URL file media yang bisa diambil langsung, dan mengisinya dengan URL YouTube adalah markup yang salah. Untuk video internal, `contentUrl` diisi URL MP4 publik. Untuk aset **terbatas**, jangan pernah cantumkan `contentUrl` sama sekali — itu sama dengan menerbitkan lokasi file yang aksesnya sedang Anda batasi.
Untuk aset terbatas gunakan: `"isAccessibleForFree": false` + `conditionsOfAccess": "Akses melalui permohonan riset. Lihat /terlibat/akses-arsip."`.

Tambahan bernilai tinggi: `hasPart` dengan `Clip` bertimestamp untuk penanda bab (`startOffset`, `name`) — meningkatkan peluang key-moments di hasil pencarian dan sangat membantu ekstraksi AI.

---

## 8. Privasi & cookie
- Sebelum Play: nol cookie pihak ketiga, nol request ke domain Google. Buktikan lewat HAR, jangan diasumsikan.
- Setelah Play: `youtube-nocookie.com` tetap menaruh penyimpanan lokal saat pemutaran. Nyatakan ini di Kebijakan Privasi, jangan klaim "tanpa pelacakan sama sekali".
- Tampilkan baris kecil di bawah tombol Play: "Memutar video akan memuat pemutar dari YouTube (mode tanpa cookie)." Ini consent yang jujur dan tidak butuh cookie banner yang merusak crawlability.

## 9. Audit `video.play`
```json
{ "event_type":"video.play", "target_type":"archive_item", "target_id":"uuid",
  "actor_user_id": null,
  "actor_hash":"sha256(ip + ua + salt_harian)",
  "metadata": {"source":"youtube","tier":"public","referrer_path":"/cerita/ketika-air-rob-datang"},
  "retention_class":"short" }
```
Dikirim `navigator.sendBeacon`, non-blocking, gagal diam-diam. **Tidak boleh menunda pemutaran.** IP mentah tidak disimpan; salt dirotasi harian sehingga korelasi lintas hari tidak mungkin.

## 10. Checklist penerimaan
- [ ] HAR sebelum klik Play: 0 request ke `youtube.com`, `ytimg.com`, `googlevideo.com`, `doubleclick.net`
- [ ] Thumbnail dilayani dari `cdn.arsiphidup.id`
- [ ] Klik "Watch on YouTube" (bila control bar dimunculkan saat uji) tidak membuka tab baru
- [ ] Video selesai → panel Arsip Hidup, bukan end-screen YouTube
- [ ] Semua kontrol dapat dioperasikan dengan keyboard; screen reader menyebut fungsi tombol
- [ ] Blokir `youtube.com` di hosts file → panel fallback muncul ≤5 detik
- [ ] `access_tier=restricted` + `video_source=youtube` ditolak database
- [ ] `VideoObject` lolos Rich Results Test
- [ ] Transkrip tampil di HTML awal (uji `curl` + `view-source`, bukan DevTools)
- [ ] `video.play` masuk AuditLog tanpa IP mentah
- [ ] LCP halaman arsip < 2,0 dtk di 4G tersimulasi
