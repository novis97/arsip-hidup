# AGENTS.md — aturan tetap untuk sesi coding berbantuan AI

Berkas ini dibaca **setiap sesi**, sebelum apa pun. Berlaku untuk Claude Code, Cursor, Copilot, atau agent mana pun.
Nama alternatif yang dikenali sebagian alat: salin juga sebagai `CLAUDE.md` bila perlu.

---

## 1. Konteks proyek dalam lima kalimat

Arsip sejarah lisan pelaku budaya Indonesia; proyek pertama Batik Tulis Pekalongan.
Stack: **Payload 3 + SQLite** (CMS di VPS) → build → **Astro statis** di Cloudflare Pages; media di **Cloudflare R2**.
Situs publik tidak pernah memanggil VPS saat runtime — itu yang membuatnya tetap hidup kalau pendanaan berhenti.
Data yang ditangani adalah cerita hidup orang sungguhan, sebagian besar lansia, dan sebagian materi tidak bisa dibuat ulang.
Karena itu kesalahan di sini tidak berbiaya "UI jelek", melainkan "identitas seseorang bocor".

## 2. Zona tanpa vibe

Berkas berikut **tidak boleh diubah tanpa membaca dokumen rujukannya lebih dulu dan menjalankan ujinya sesudahnya.** Kalau Anda merasa perlu mengubahnya "supaya jalan", berhenti dan tanyakan ke manusia.

| Berkas | Dokumen wajib dibaca | Uji wajib |
|---|---|---|
| `apps/web/src/components/player/*` | `docs/VIDEO_EMBED.md` | `pnpm test:facade` |
| `apps/cms/src/collections/ArchiveItems.ts` | `docs/SCHEMA.md` §2, `docs/RULES.md` §1 | `pnpm test` |
| `apps/cms/src/collections/Users.ts` | `docs/SECURITY.md` §4 | — |
| `apps/cms/src/collections/AuditLogs.ts` | `docs/SECURITY.md` §7 | — |
| `apps/cms/src/collections/Narasumber.ts` | `docs/PRD.md` §5.1 | — |
| `apps/cms/src/lib/{playbackToken,authorizeAsset,hls}.ts` | `docs/VIDEO_EMBED.md` §5 | `pnpm test` |
| `apps/cms/src/endpoints/mediaPlayback.ts` | `docs/VIDEO_EMBED.md` §5 | `pnpm test` |
| `infra/caddy/Caddyfile` | `docs/SECURITY.md` §2 | gate `headers` di CI |

## 3. Larangan keras

Jangan lakukan hal-hal berikut, meski terlihat menyelesaikan masalah:

1. **Jangan melonggarkan CSP** untuk membuat sesuatu jalan. Kalau ada yang terblokir, cari tahu domainnya dan usulkan penambahan eksplisit — jangan tambahkan `'unsafe-inline'` pada `script-src`, jangan ganti dengan `*`.
2. **Jangan menambah `modestbranding`, `showinfo`, atau overlay CSS di atas player YouTube.** Yang pertama dua sudah mati, yang ketiga melanggar ToS YouTube. Sudah dibahas di `docs/VIDEO_EMBED.md` §2 — jangan "menemukan ulang" solusinya.
3. **Jangan menaikkan TTL presigned URL di atas 300 detik.** Ada tiga tempat yang menjaganya; jangan lepas satu pun.
4. **Jangan menambahkan NIK, alamat, nomor telepon, atau dokumen consent** ke koleksi mana pun. Kalau ada permintaan begitu, tolak dan minta klarifikasi manusia.
5. **Jangan menghapus `CHECK`/validasi** yang menghalangi seed atau uji. Perbaiki datanya, bukan aturannya.
6. **Jangan meng-hotlink `i.ytimg.com`.** Thumbnail selalu dari `cdn.arsiphidup.id`.
7. **Jangan commit `.env`, `*.db`, atau media.**
8. **Jangan memakai nama/foto narasumber asli** di seed, fixture, uji, atau staging. Prefiks `[SEED]` wajib.
9. **Jangan merangkai SQL dengan string concatenation.**
10. **Jangan mengubah isi `docs/` diam-diam.** Kalau perilaku berubah, katakan dokumen mana yang perlu diperbarui dan tunggu persetujuan.

## 4. Aturan anti-halusinasi

Payload 3 dan Astro 5 punya permukaan API yang berubah cepat, dan ini area paling rawan karangan.

- **Jangan menebak nama API.** Kalau tidak yakin bentuk sebuah fungsi Payload/Astro, baca tipenya di `node_modules/payload/dist/**/*.d.ts` atau dokumentasi resminya. Menebak lalu "memperbaiki error" berulang kali adalah cara paling cepat merusak berkas yang tadinya benar.
- **Jangan berpindah versi mayor** (Payload 2 → 3, Astro 4 → 5) untuk menyelesaikan error. Versi sudah dipilih; error impor biasanya salah path, bukan salah versi.
- **Kalau sebuah paket tidak ada**, laporkan. Jangan gantikan dengan paket lain yang mirip namanya.
- **Kalau instruksi tiket bertabrakan dengan `docs/`**, dokumen menang. Laporkan tabrakannya.
- **Satu tiket, satu sesi.** Jangan mengerjakan tiket berikutnya karena "sekalian".

## 5. Alur kerja tiap tiket

```
1. Baca AGENTS.md (ini) + berkas konteks yang disebut tiket. TIDAK LEBIH.
   Memuat 12 dokumen sekaligus membuat agent kehilangan fokus dan mulai mengarang.
2. Nyatakan rencana dalam <=5 poin. Tunggu konfirmasi bila tiket menyentuh zona tanpa vibe.
3. Tulis kode.
4. Jalankan perintah verifikasi yang tertulis di tiket. Bukan "sepertinya sudah benar".
5. Laporkan: apa yang berubah, apa yang belum, dokumen mana yang perlu diperbarui.
6. Commit: Conventional Commits, satu tiket satu commit.
```

## 6. Kalau macet

Sampaikan apa adanya: "tiket ini terhambat karena X". Jangan:
- menonaktifkan uji agar hijau
- menambahkan `// @ts-ignore` untuk menutup error tipe
- mengganti implementasi nyata dengan mock lalu menyebutnya selesai
- menghapus fitur yang menghalangi

Tiga hal pertama akan lolos review manusia yang lelah, dan itulah masalahnya.

## 7. Bahasa

Komentar kode, pesan commit, pesan error yang dilihat pengguna, dan konten: **Bahasa Indonesia**.
Nama variabel, fungsi, dan slug koleksi: bahasa Inggris (`archiveItem`, `access-grants`).
