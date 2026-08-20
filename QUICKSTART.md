# QUICKSTART — hari pertama, urut

Perkiraan 30–45 menit sampai siap membuka sesi coding pertama.

---

## Prasyarat

| Yang dibutuhkan | Cek dengan | Kalau belum ada |
|---|---|---|
| Node 22+ | `node -v` | pasang via nvm: `nvm install 22` |
| pnpm | `pnpm -v` | `corepack enable` |
| Git | `git --version` | pasang dari git-scm.com |
| Agent yang bisa menjalankan perintah | — | Claude Code / Cursor / sejenisnya |

**Tentang yang terakhir:** agent Anda harus punya akses filesystem dan terminal.
Tiket T0.1 adalah `pnpm install` — kalau prompt itu ditempel ke jendela chat biasa
tanpa akses terminal, agent tidak menjalankan apa pun; ia hanya akan **mengarang
keluarannya**, dan Anda tidak akan tahu bedanya.

---

## Langkah

### 1. Bersihkan zip lama
Hapus semua zip selain `arsip-hidup-v1.zip`. Zip lama berisi dokumen versi
sebelumnya; kalau ikut terekstrak, agent akan "memperbaiki" kode yang sudah
benar agar cocok dengan dokumen usang.

```bash
unzip arsip-hidup-v1.zip
cd arsip-hidup
```

### 2. Git dulu, sebelum agent menyentuh apa pun
**Ini langkah yang paling sering dilewati, dan paling mahal kalau dilewati.**

```bash
git init
git add -A
git commit -m "chore: scaffold awal dari blueprint v0.4"
```

Tanpa ini Anda tidak bisa melihat apa yang diubah agent, tidak bisa membatalkan
sesi yang kacau, dan tidak bisa membedakan kode Anda dari karangan agent.

Lalu buat repo **privat** di `github.com/novis97/arsip-hidup` dan push:
```bash
git remote add origin git@github.com:novis97/arsip-hidup.git
git branch -M main && git push -u origin main
git checkout -b dev
```
Privat, bukan publik — repo ini akan berisi struktur data narasumber.

### 3. Isi `.env`
```bash
cp .env.example .env
openssl rand -base64 48    # tempel ke PAYLOAD_SECRET
openssl rand -hex 32       # tempel ke AUDIT_HASH_SALT
```
Kredensial R2 boleh dikosongkan dulu — baru dibutuhkan di Fase 3.
**Jangan pernah menyuruh agent mengisi berkas ini.**

### 4. Arahkan agent ke folder
Buka folder `arsip-hidup` sebagai root workspace, bukan folder induknya.
Sebagian alat membaca `AGENTS.md` otomatis; sebagian tidak — karena itu
prompt pembuka di langkah 5 tetap wajib.

### 5. Sesi pertama
Buka `PROMPTS.md`, salin **prompt pembuka** (bagian 1), tunggu ringkasannya.

Cek: kalau ringkasan agent tidak menyebut "zona tanpa vibe" dan
"satu tiket satu sesi", ia tidak benar-benar membacanya. Ulangi.

Lalu salin **prompt T0.1** (bagian 3). Berhenti di situ.

### 6. Setelah setiap tiket
```bash
git status              # lihat apa yang benar-benar berubah
git diff                # baca, jangan sekadar percaya laporan agent
# jalankan sendiri perintah verifikasi tiket tersebut, setidaknya sekali
git add -A && git commit -m "feat(T0.1): resolve dependensi"
```
Lalu **buka sesi baru** untuk tiket berikutnya. Jangan melanjutkan di sesi
yang sama — konteks yang menumpuk membuat agent mulai mencampur keputusan.

---

## Ritme kerja

```
sesi baru → prompt pembuka → prompt 1 tiket → verifikasi sendiri → commit → tutup sesi
```

Satu tiket per sesi. 32 tiket. Kalau sebuah sesi terasa melebar, hentikan,
`git checkout .`, dan mulai ulang dengan tiket yang dipecah lebih kecil.

---

## Kesalahan hari pertama yang paling sering terjadi

| Kesalahan | Akibat |
|---|---|
| Mulai coding sebelum `git init` | Tidak bisa membatalkan; kerja setengah hari hilang |
| Menempelkan beberapa prompt tiket sekaligus | Agent mengerjakan semuanya separuh-separuh |
| Percaya laporan "sudah saya uji" | Verifikasi palsu lolos sampai produksi |
| Melewati T0.1 karena "nanti saja" | Agent menebak API Payload/Astro sepanjang proyek |
| Membuka repo publik | Struktur data narasumber terekspos |
| Menyuruh agent mengisi `.env` | Rahasia bocor ke riwayat percakapan |

---

## Kalau macet di T0.1 atau T0.2

Keduanya bergantung pada alat eksternal (`pnpm`, `create-payload-app`) dan
paling mungkin gagal karena lingkungan, bukan karena kode. Pakai **prompt
"kalau agent macet"** di `PROMPTS.md` bagian 6 — ia memaksa agent menempelkan
pesan error asli alih-alih menebak perbaikan.
