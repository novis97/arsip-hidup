# Arsip Hidup Indonesia

Platform arsip sejarah lisan yang mendokumentasikan pengetahuan, kehidupan, dan praktik pelaku budaya Indonesia. Proyek pertama: **Batik Tulis Pekalongan**.

- Situs: `https://arsiphidup.id`
- Panel admin: `https://api.arsiphidup.id/admin`
- Blueprint lengkap: [`docs/`](./docs) — 12 dokumen, mulai dari [`docs/PRD.md`](./docs/PRD.md)

---

## Arsitektur singkat

```
Admin (email + password + MFA)  →  Payload 3 + SQLite di VPS
                                        ↓ build hook
                        Astro statis di Cloudflare Pages  ←  pengunjung
                                        ↑
                          Cloudflare R2 (media publik & terbatas)
```

**Publik tidak pernah menyentuh VPS.** Kalau VPS berhenti dibayar, build statis terakhir tetap dilayani dan arsipnya tetap online — hanya penambahan konten yang berhenti. Ini keputusan sadar untuk proyek berdana satu tahun; penjelasan dan prosedurnya di [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) §2.

## Mulai coding (baca ini dulu)

- **[`QUICKSTART.md`](./QUICKSTART.md)** — urutan langkah hari pertama. Mulai dari sini.
- **[`AGENTS.md`](./AGENTS.md)** — aturan tetap untuk sesi coding berbantuan AI. Muat di setiap sesi.
- **[`BUILD_PLAN.md`](./BUILD_PLAN.md)** — urutan tiket. Satu tiket, satu sesi, satu commit.
- **[`SCAFFOLD_NOTES.md`](./SCAFFOLD_NOTES.md)** — apa yang sudah nyata dan apa yang masih stub.
- **[`PROMPTS.md`](./PROMPTS.md)** — prompt siap salin untuk setiap tiket.
- **[`READINESS.md`](./READINESS.md)** — apa yang sudah terverifikasi, dan apa yang akan menghentikan agent di 30 menit pertama.

Repo Git adalah satu-satunya sumber kebenaran. Jangan bekerja dari folder unduhan.

## Mulai

```bash
pnpm install
cp .env.example .env          # isi PAYLOAD_SECRET, kredensial R2, AUDIT_HASH_SALT
pnpm --filter @ahi/cms migrate
pnpm seed                     # data FIKTIF — jangan pernah pakai data narasumber asli
pnpm dev                      # CMS :3000  ·  web :4321
```

## Perintah

| Perintah | Kegunaan |
|---|---|
| `pnpm dev` | CMS + web bersamaan |
| `pnpm build` | Build statis + indeks pencarian Pagefind |
| `pnpm test:facade` | **Gate**: pastikan nol request ke Google sebelum klik Play |
| `pnpm backup` | Backup SQLite (aman saat aplikasi berjalan) |
| `pnpm export:content` | Ekspor konten ke JSON + Markdown untuk pelestarian |

## Delapan aturan yang tidak bisa ditawar

Ditegakkan oleh kode, bukan oleh disiplin. Rincian di [`docs/RULES.md`](./docs/RULES.md).

1. Consent form dan biodata narasumber **tidak pernah masuk sistem ini** — hanya kode referensi.
2. Tidak ada publikasi tanpa `consentVerified`.
3. Materi tier terbatas **tidak pernah** di YouTube, termasuk unlisted.
4. MFA wajib untuk admin/editor/archivist/reviewer.
5. Foto publik wajib bersih EXIF — metadata GPS menunjukkan rumah narasumber.
6. Tidak ada logo mitra yang belum benar-benar bermitra.
7. Angka di situs berasal dari basis data, tidak dikarang.
8. Permintaan penarikan narasumber diproses ≤ 7 hari kerja.

## Yang sengaja TIDAK dilakukan pada pemutar video

`modestbranding=1` tidak dipakai — **tidak berfungsi sejak 15 Agustus 2023**. `rel=0` dipakai tapi hanya membatasi rekomendasi ke channel yang sama, karena itu semua video wajib dari satu channel resmi. **Tidak ada overlay CSS** yang menutupi logo atau tombol "Watch on YouTube": melanggar YouTube API ToS, dan tidak menambah keamanan apa pun. Yang dipakai sebagai gantinya: façade pattern, `youtube-nocookie`, sandbox tanpa `allow-popups`, `controls=0` + kontrol kustom lewat IFrame API, dan `stopVideo()` saat video berakhir. Penjelasan penuh: [`docs/VIDEO_EMBED.md`](./docs/VIDEO_EMBED.md) §2.

## Lisensi

- **Kode**: MIT
- **Konten arsip** (transkrip, foto, rekaman): CC BY-NC-ND 4.0 kecuali dinyatakan lain per item. Materi tier terbatas tidak dilisensikan untuk redistribusi.
- **Pelatihan model AI**: tidak diizinkan sampai consent narasumber mencakupnya ([`docs/GEO.md`](./docs/GEO.md) §0).
