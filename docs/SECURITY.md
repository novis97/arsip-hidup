# SECURITY — Arsip Hidup Indonesia
**Versi:** 0.3 · 20 Agustus 2026
**Model ancaman utama:** bukan pencurian kartu kredit. Yang dipertaruhkan adalah **identitas dan cerita hidup orang sungguhan**, sebagian besar lansia, yang mempercayakan rekamannya kepada proyek ini — dan materi yang tidak bisa dibuat ulang kalau narasumbernya wafat.

---

## 1. Studi kasus wajib: British Library, 28 Oktober 2023

Referensi yang Anda tetapkan sendiri adalah korban serangan siber besar. Ini bukan catatan kaki; ini seharusnya membentuk seluruh keputusan keamanan kita.

Yang terjadi: grup ransomware Rhysida mengeksfiltrasi data, mengenkripsi atau merusak sebagian besar server, dan mengunci seluruh pengguna dari jaringan; analisis forensik menunjukkan penyerang kemungkinan besar sudah masuk setidaknya tiga hari sebelum insiden terdeteksi. Titik masuknya tidak dapat dipastikan secara definitif, tetapi diduga sebuah terminal server untuk akses jarak jauh mitra tepercaya — dan tidak adanya multi-factor authentication pada server itu diyakini turut memudahkan penyerang masuk. Dampaknya sangat dalam: sistem rusak sampai tidak bisa dipakai, layanan terganggu berbulan-bulan, dan yang paling merusak, mereka tidak bisa pulih — banyak sistem terlalu tua untuk dibangun ulang karena perangkat lunaknya sudah tidak tersedia.

Sumber: *Learning Lessons from the Cyber-Attack — British Library Cyber Incident Review*, 8 Maret 2024 (bl.uk), bagian "Learning lessons from the attack" berisi 16 pelajaran.

**Lima pelajaran yang langsung jadi aturan di proyek ini:**

| Pelajaran BL | Aturan kita |
|---|---|
| Satu akun tanpa MFA meruntuhkan segalanya | MFA **wajib** untuk semua akun istimewa, ditegakkan aplikasi. Tidak ada pengecualian "sementara" |
| Estate legacy yang kompleks menghambat pemulihan | Stack sederhana, sedikit komponen, versi didukung. Kompleksitas adalah utang keamanan |
| Backup ada tapi infrastruktur pemulihan hancur | Backup **immutable + offsite + di luar kendali kredensial produksi**, dan **uji restore terjadwal**. Backup yang tidak pernah direstorasi adalah asumsi, bukan backup |
| 600GB data pribadi bocor lalu dibuang di dark web | Minimalkan data. Consent form & biodata narasumber tidak masuk sistem sama sekali (PRD 5.1) |
| Serangan finansial berdampak sebagai serangan terhadap akses pengetahuan | Pelestarian ≠ website. Master arsip harus selamat meski seluruh infrastruktur web hilang |

Skala kita jauh lebih kecil, tapi rasio berbeda: British Library punya tim keamanan; proyek ini akan dikelola admin non-teknis dengan anggaran perpanjangan yang belum pasti. Postur pertahanan harus mengasumsikan **tidak ada yang memantau harian**.

---

## 2. Content Security Policy

### 2.1 CSP produksi (target akhir)
```
Content-Security-Policy:
  default-src 'self';
  base-uri 'self';
  object-src 'none';
  frame-ancestors 'none';
  form-action 'self';
  script-src 'self' 'nonce-{RANDOM}' https://www.youtube.com https://www.youtube-nocookie.com;
  style-src 'self' 'nonce-{RANDOM}';
  img-src 'self' data: https://cdn.arsiphidup.id https://*.tile.openstreetmap.org;
  media-src 'self' https://cdn.arsiphidup.id https://media.arsiphidup.id blob:;
  font-src 'self';
  connect-src 'self' https://api.arsiphidup.id https://plausible.arsiphidup.id;
  frame-src 'self' https://www.youtube-nocookie.com https://w.soundcloud.com;
  worker-src 'self' blob:;
  upgrade-insecure-requests;
  report-uri /api/csp-report;
```

### 2.2 Koreksi atas CSP di brief
Brief menuliskan `default-src 'self'; frame-src 'self' https://www.youtube-nocookie.com;`. Itu benar sebagai konsep tapi **akan mematahkan pemutar** kalau diterapkan apa adanya, karena:
1. YouTube IFrame API dimuat dari `https://www.youtube.com/iframe_api` — butuh entri di `script-src`. Ini titik yang hampir selalu terlewat: iframe-nya nocookie, tapi skrip API-nya bukan.
2. `frame-src` tidak diwarisi dari `default-src` untuk SoundCloud — embed audio dalam PKS Pasal 2.5.b akan mati.
3. Player membuat blob URL untuk HLS → `media-src blob:` dan `worker-src blob:` dibutuhkan untuk tier internal.
4. Tanpa `frame-ancestors 'none'`, situs bisa di-iframe pihak lain (clickjacking) — ini yang justru relevan, bukan overlay pada logo YouTube.

**Nonce, bukan `unsafe-inline`.** CSP dengan `'unsafe-inline'` pada `script-src` praktis tidak melindungi apa pun terhadap XSS. Kalau Astro/CMS memaksa inline style, boleh `style-src 'unsafe-inline'` sebagai kompromi sementara — tapi tidak pernah untuk script.

### 2.3 Penerapan bertahap
Minggu 1–2 jalankan `Content-Security-Policy-Report-Only` dengan `report-uri` aktif, kumpulkan pelanggaran, baru kunci. Menyalakan CSP ketat di hari peluncuran adalah cara paling andal untuk merusak situs saat semua orang menonton.

## 3. Header keamanan lain
```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=(), interest-cohort=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-site
X-Frame-Options: DENY        (redundan dengan frame-ancestors, tapi murah)
```
Catatan: `Cross-Origin-Embedder-Policy: require-corp` **jangan** dipasang — akan mematahkan embed YouTube dan SoundCloud.

## 4. Autentikasi & sesi
- Argon2id untuk password (`m=64MB, t=3, p=4`).
- **MFA (TOTP) wajib** untuk `admin`, `editor`, `archivist`, `reviewer`. Peran `researcher`: dianjurkan, wajib sebelum grant pertama diberikan.
- Cookie sesi: `HttpOnly; Secure; SameSite=Lax; Path=/`, rotasi ID saat login, idle timeout 30 menit untuk admin, absolut 12 jam.
- Lockout: 5 gagal → 15 menit, eksponensial setelahnya. Rate limit per-IP **dan** per-akun (per-IP saja mudah diakali).
- Reset password: token sekali pakai, TTL 30 menit, pesan enumerasi netral.
- Panel admin di balik Cloudflare Access / allowlist IP. Ini kontrol yang absennya paling mahal di kasus British Library.

## 5. Otorisasi
- Default deny. Setiap endpoint menyatakan peran yang diizinkan secara eksplisit.
- Cek kepemilikan objek di lapisan query (`WHERE user_id = $current`), bukan hanya di UI. IDOR adalah kelas bug paling umum di aplikasi seperti ini.
- Tier aset diperiksa di server setiap permintaan, tidak pernah dari parameter klien.
- Endpoint presigned URL: rate limit ketat, kuota per grant, dan log setiap penerbitan.

## 6. Validasi input & keluaran
- Validasi skema (Zod) di batas API. Allowlist, bukan blocklist.
- `youtube_id` divalidasi regex `^[A-Za-z0-9_-]{11}$` **sebelum** masuk `src` iframe. Tanpa ini, admin yang akunnya dibajak bisa menyuntikkan URL sembarang ke dalam iframe di setiap halaman arsip.
- Rich text disanitasi server-side dengan allowlist tag (DOMPurify di worker/isolate), bukan disaring di browser.
- Unggahan: verifikasi magic bytes, bukan ekstensi. Simpan di bucket terpisah tanpa eksekusi. Nama file di-randomisasi. Strip EXIF dari foto publik — **EXIF foto lapangan berisi koordinat GPS rumah narasumber.**
- Query berparameter selalu. Tanpa string concatenation, tanpa pengecualian.

## 7. Privasi & UU PDP 27/2022
- **Minimisasi:** consent form dan biodata (NIK, alamat, nomor HP) tidak masuk aplikasi web (PRD 5.1). Kalau ada pihak yang memaksa memasukkannya, minta alasannya tertulis.
- **Pseudonimisasi:** `audit_logs.actor_hash = sha256(ip + user_agent + salt_harian)`. Salt dirotasi harian → korelasi lintas hari tidak mungkin. IP mentah tidak pernah persisten.
- **Retensi:** telemetri 90 hari; catatan keputusan akses 7 tahun; catatan login 1 tahun.
- **Hak narasumber:** koreksi, penarikan, dan takedown dalam 7 hari kerja (RULES §5). Ini bukan basa-basi etis — ini kewajiban hukum dan syarat kepercayaan komunitas.
- **Analytics cookieless** (Plausible self-host). Efek samping yang bagus: tidak perlu cookie banner, dan cookie banner adalah salah satu perusak crawlability & Core Web Vitals terbesar.
- **DPIA ringkas** disusun sebelum go-live. Satu halaman cukup, tapi harus ada.

## 8. Keamanan file & storage
- Bucket `ahi-restricted`: kebijakan default deny, tanpa akses anonim, presigned TTL ≤ 300 detik.
- Bucket `ahi-public`: read-only publik, tanpa listing.
- Kredensial R2 terpisah per layanan, hak minimum. Kunci aplikasi web **tidak boleh** bisa menghapus objek — hanya menulis dan membaca. Ransomware yang membajak aplikasi web tidak boleh bisa menghapus arsip.
- Master file (video 60 menit asli, foto RAW, audio master) **tidak berada di server yang menghadap internet.** Simpanan pelestarian: 2 salinan lokal + 1 offsite, minimal satu offline/immutable.

## 9. Rantai pasok
- Lockfile dikunci, Dependabot/Renovate aktif, CI gagal saat CVE High/Critical.
- Batasi jumlah dependensi. Setiap paket npm adalah pihak yang Anda percayai untuk mengeksekusi kode.
- SRI untuk skrip pihak ketiga apa pun yang tersisa.
- Skrip YouTube tidak bisa diberi SRI (berubah-ubah) — ini alasan tambahan mengapa ia dimuat hanya setelah klik Play, di halaman yang punya CSP nonce.

## 10. Logging & deteksi
- Log terpusat, di luar server aplikasi (kalau server dienkripsi ransomware, lognya ikut hilang — ini persis yang menyulitkan forensik di BL).
- Peringatan untuk: lonjakan `login.failed`, penerbitan presigned URL abnormal, unduhan massal oleh satu grant, perubahan peran, publish/unpublish massal.
- Uptime + sertifikat + kedaluwarsa domain dipantau (kehilangan domain = risiko nyata per PKS Pasal 11.7).

## 11. Rencana respons insiden (ringkas, tapi harus ada)
1. **Deteksi** → satu orang penanggung jawab, nomor kontak tertulis di dokumen offline.
2. **Isolasi** → matikan situs publik lebih dulu; halaman statis "sedang pemulihan" lebih baik daripada situs terkompromi yang menyajikan malware.
3. **Preservasi bukti** → snapshot sebelum membersihkan. Membersihkan duluan menghancurkan jejak.
4. **Notifikasi** → PIHAK PERTAMA segera; narasumber terdampak bila data pribadi terlibat; otoritas sesuai UU PDP.
5. **Pemulihan** dari backup bersih, rotasi seluruh kredensial, baru online kembali.
6. **Post-mortem tertulis.** British Library menerbitkan laporan pelajarannya secara terbuka pada 8 Maret 2024 dan itu membantu seluruh sektor — norma yang layak ditiru dalam skala kita.

**Kebijakan ransomware ditetapkan sekarang, bukan saat panik: tidak membayar.** Konsekuensinya, backup harus benar-benar bisa dipulihkan.

## 12. Checklist pra-peluncuran
- [ ] MFA aktif dan terverifikasi di setiap akun istimewa
- [ ] CSP aktif tanpa `unsafe-inline` pada script; pemutar YouTube tetap berfungsi
- [ ] Uji restore backup berhasil dari nol (bukan sekadar "file backup ada")
- [ ] Bucket restricted tidak dapat diakses tanpa signature (uji dengan curl polos)
- [ ] EXIF dibersihkan dari seluruh foto publik
- [ ] Tidak ada consent form / NIK / alamat / nomor HP narasumber di database produksi
- [ ] `youtube_id` tervalidasi regex di sisi server
- [ ] Rate limit terpasang di endpoint login, form, dan presigned
- [ ] Halaman admin tidak dapat diakses dari internet terbuka
- [ ] Kontak dan prosedur insiden tercetak dan disimpan offline
