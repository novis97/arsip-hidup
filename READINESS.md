# READINESS — apakah repo ini siap dieksekusi agent AI?

Diperiksa 20 Agustus 2026, terhadap registry npm yang sesungguhnya.

## Jawaban singkat

**Belum bisa dijalankan hari ini. Sudah bisa dikerjakan hari ini.**

Bedanya penting. `pnpm dev` akan gagal — boilerplate Next.js untuk Payload 3 belum ada dan lockfile belum dihasilkan. Tapi rencana kerjanya sudah cukup rinci untuk agent mulai dari T0.1 tanpa mengarang.

---

## Yang sudah terverifikasi

| Aspek | Status |
|---|---|
| 12 dokumen blueprint konsisten satu sama lain (v0.3–v0.4) | ✅ |
| 12 uji unit media (token, HLS, path traversal) lolos | ✅ dijalankan, hijau |
| CSP mencakup `www.youtube.com` di `script-src` | ✅ dicek gate |
| Semua paket ada di npm | ✅ 15/15 |
| Versi dependensi sesuai registry | ✅ **dikoreksi hari ini — lihat di bawah** |
| Peer dependency Payload↔Next dipatuhi | ✅ |
| Aturan privasi/consent ditegakkan kode, bukan SOP | ✅ |
| Tiket kerja beserta konteks & verifikasi | ✅ 32 tiket |

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

## Yang akan menghentikan agent di 30 menit pertama

| Penghambat | Tiket | Bisa diselesaikan agent sendiri? |
|---|---|---|
| Tidak ada `pnpm-lock.yaml` / `node_modules` | T0.1 | Ya |
| Boilerplate Next.js Payload 3 belum ada | T0.2 | Ya, tapi harus jalankan `create-payload-app` — **tidak boleh dikarang** |
| `PAYLOAD_SECRET`, kredensial R2, `AUDIT_HASH_SALT` kosong | — | **Tidak.** Butuh manusia |
| Akun R2 & VPS belum dibeli | G-3 | **Tidak.** Butuh Addendum I lebih dulu |
| `sameAs` di schema Organization kosong | T4.2 | Tidak — butuh URL profil nyata |
| API Astro 7 berbeda dari yang saya tulis | T1.2–T1.6 | Ya, setelah T0.1 tipe bisa dibaca |

Baris terakhir jujur: `astro.config.mjs` dan berkas `.astro` di repo ini ditulis untuk Astro 5. Astro 7 kemungkinan mengubah sebagian API. **Anggap berkas `.astro` sebagai rancangan yang benar secara struktur, bukan kode yang pasti kompilasi.** Berkas Payload dan library media (`lib/*.ts`, `endpoints/*.ts`) jauh lebih aman karena hanya memakai API yang stabil.

---

## Peringkat keandalan per bagian

| Bagian | Keandalan | Alasan |
|---|---|---|
| `apps/cms/src/lib/*`, `endpoints/mediaPlayback.ts` | **Tinggi** | Node/crypto/AWS SDK standar, 12 uji hijau |
| `apps/cms/src/collections/*` | **Tinggi** | API Payload 3 stabil; validasi & hook sudah teruji bentuknya |
| `infra/*`, `.github/workflows/*`, skrip shell | **Tinggi** | Tidak bergantung versi framework |
| `apps/web/src/components/player/arsip-player.ts` | **Tinggi** | TypeScript murni, tidak menyentuh API Astro |
| `apps/web/**/*.astro`, `astro.config.mjs` | **Sedang** | Ditulis untuk Astro 5; sesuaikan ke 7 di T1.2 |
| `docs/*` | **Tinggi** | Keputusan arsitektural, bukan sintaks |

---

## Cara memulai yang benar

```bash
unzip arsip-hidup-v1.zip && cd arsip-hidup
git init && git add -A && git commit -m "chore: scaffold awal"
# push ke github.com/novis97/arsip-hidup (PRIVAT)
```

Lalu buka sesi coding pertama dengan prompt persis seperti ini:

> Baca `AGENTS.md` dan `BUILD_PLAN.md`. Kerjakan **hanya tiket T0.1**.
> Jangan sentuh tiket lain. Laporkan versi apa saja yang tidak ter-resolve.

Setelah T0.1 hijau, barulah agent punya tipe untuk dibaca — dan mulai dari titik itu, kualitas keluarannya akan meningkat tajam.

## Empat hal yang tidak boleh diserahkan ke agent

1. **Rahasia dan kredensial.** Isi `.env` sendiri.
2. **T1.4 — pemutar façade.** Menyentuh ToS, CSP, privasi, aksesibilitas sekaligus. Awasi.
3. **T3.5 — penarikan izin narasumber.** Kalau ini tidak bekerja end-to-end, seluruh janji etis situs kosong, dan kegagalannya tidak terlihat dari tampilan.
4. **Keputusan yang masih terbuka (G-3..G-7).** Bukan keputusan teknis.
