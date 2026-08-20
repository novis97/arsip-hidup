# READINESS — apakah repo ini siap dieksekusi agent AI?

Diperiksa 21 Agustus 2026 terhadap worktree lokal dan remote Git terakhir.

## Jawaban singkat

**Dependensi sudah dikunci dan boilerplate Payload sudah tersedia. Verifikasi runtime T0.2 masih harus diselesaikan.**

`pnpm-lock.yaml` dihasilkan pada commit `2e7a5ab`. Boilerplate Next.js/Payload dipasang pada commit `3a9a281`. Keberadaan berkas tidak otomatis menutup T0.2: halaman login `/admin` tetap harus dimuat dengan konfigurasi lokal yang valid.

---

## Yang sudah terverifikasi

| Aspek | Status |
|---|---|
| 12 dokumen blueprint konsisten satu sama lain (v0.3–v0.4) | ✅ |
| 12 uji unit media (token, HLS, path traversal) lolos | ✅ dijalankan, hijau |
| CSP mencakup `www.youtube.com` di `script-src` | ✅ dicek gate |
| Semua paket ada di npm | ✅ 15/15 |
| Versi dependensi sesuai registry | ✅ dikoreksi 20 Agustus 2026 — lihat di bawah |
| Peer dependency Payload↔Next dipatuhi | ✅ |
| Aturan privasi/consent ditegakkan kode, bukan SOP | ✅ |
| Tiket kerja beserta konteks & verifikasi | ✅ 32 tiket |
| `pnpm-lock.yaml` | ✅ tersedia (`2e7a5ab`) |
| Boilerplate Next.js/Payload | ✅ berkas tersedia (`3a9a281`); runtime belum diverifikasi |

## Koreksi yang baru ditemukan saat verifikasi

Scaffold awal ditulis dengan versi dari ingatan. Tiga di antaranya **salah versi mayor**:

| Paket | Ditulis semula | Sebenarnya |
|---|---|---|
| `astro` | `^5.0.0` | **7.2.4** (dua mayor tertinggal) |
| `next` | `^15.0.0` | **16.3.1** |
| `vitest` | `^2.1.0` | **4.1.11** |

Sudah dikoreksi. Konsekuensi teknis yang mengikat: `@payloadcms/next@3.88.0` mensyaratkan `payload` **persis** `3.88.0` dan `next >=16.2.6 <17`. Seluruh paket `@payloadcms/*` di-pin tanpa caret. Menaikkan satu saja akan memutus peer dependency.

Ini bukan catatan kaki. Ini bukti langsung bahwa aturan anti-halusinasi di `AGENTS.md` §4 bukan kehati-hatian berlebihan: kalau penyusun blueprint bisa salah menebak versi, agent coding pasti bisa.

---

## Yang masih memerlukan tindakan

| Penghambat | Tiket | Bisa diselesaikan agent sendiri? |
|---|---|---|
| Halaman login `/admin` belum diverifikasi dengan konfigurasi lokal | T0.2 | Ya, setelah rahasia lokal tersedia |
| `PAYLOAD_SECRET`, kredensial R2, `AUDIT_HASH_SALT` kosong | — | **Tidak.** Butuh manusia |
| Akun R2 & VPS belum dibeli | G-3 | **Tidak.** Butuh Addendum I lebih dulu |
| `sameAs` di schema Organization kosong | T4.2 | Tidak — butuh URL profil nyata |
| API Astro 7 berbeda dari yang saya tulis | T1.2–T1.6 | Ya, setelah T0.1 tipe bisa dibaca |

Baris terakhir jujur: scaffold `.astro` berasal dari rancangan awal sebelum dependensi Astro 7 dikunci. **Baca tipe Astro 7 dan jalankan `astro check`; jangan menganggap sintaksnya pasti kompatibel hanya karena berkasnya ada.** Berkas Payload dan library media (`lib/*.ts`, `endpoints/*.ts`) lebih matang, tetapi tetap harus melewati gate tiketnya.

---

## Peringkat keandalan per bagian

| Bagian | Keandalan | Alasan |
|---|---|---|
| `apps/cms/src/lib/*`, `endpoints/mediaPlayback.ts` | **Tinggi** | Node/crypto/AWS SDK standar, 12 uji hijau |
| `apps/cms/src/collections/*` | **Tinggi** | API Payload 3 stabil; validasi & hook sudah teruji bentuknya |
| `infra/*`, `.github/workflows/*`, skrip shell | **Tinggi** | Tidak bergantung versi framework |
| `apps/web/src/components/player/arsip-player.ts` | **Tinggi** | TypeScript murni, tidak menyentuh API Astro |
| `apps/web/**/*.astro`, `astro.config.mjs` | **Sedang** | Scaffold mendahului penguncian Astro 7; verifikasi tipe/API di T1.2 |
| `docs/*` | **Tinggi** | Keputusan arsitektural, bukan sintaks |

---

## Langkah berikutnya

Pastikan `.env` lokal diisi oleh manusia berdasarkan `.env.example`, lalu buka sesi berikut dengan prompt:

> Baca `AGENTS.md` dan `BUILD_PLAN.md`. Kerjakan **hanya verifikasi tiket T0.2**.
> Jalankan CMS dan buktikan `/admin` memuat halaman login. Jangan sentuh T0.3.

Setelah T0.2 benar-benar lolos, lanjutkan T0.3. Dua commit lokal fondasi belum berada pada remote-tracking `origin/dev`; push adalah tindakan terpisah dan tidak tersirat oleh status ini.

## Empat hal yang tidak boleh diserahkan ke agent

1. **Rahasia dan kredensial.** Isi `.env` sendiri.
2. **T1.4 — pemutar façade.** Menyentuh ToS, CSP, privasi, aksesibilitas sekaligus. Awasi.
3. **T3.5 — penarikan izin narasumber.** Kalau ini tidak bekerja end-to-end, seluruh janji etis situs kosong, dan kegagalannya tidak terlihat dari tampilan.
4. **Keputusan yang masih terbuka (G-3..G-7).** Bukan keputusan teknis.
