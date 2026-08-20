# SCHEMA — Model Data Arsip Hidup Indonesia
**Versi:** 0.3 · **SQLite** (Drizzle via `@payloadcms/db-sqlite`) · Semua tabel `snake_case`.

> **Sumber kebenaran skema adalah Payload Config**, bukan file ini. Dokumen ini adalah model konseptual dan daftar aturan; Payload menghasilkan tabel dan migrasi dari konfigurasinya.

**Pemetaan tipe (dokumen ini ditulis dengan istilah relasional umum; begini wujudnya di SQLite):**
| Ditulis di sini | SQLite / Payload |
|---|---|
| `uuid PK` | `TEXT` (UUID v4 sebagai string) |
| `timestamptz` | `TEXT` ISO-8601 UTC |
| `enum` | `TEXT` + `CHECK (col IN (...))`, di Payload = field `select` |
| `text[]` | tabel relasi anak (Payload `hasMany`), bukan kolom array |
| `jsonb` | `TEXT` berisi JSON, di Payload = field `json` |
| `boolean` | `INTEGER` 0/1 |
| `tsvector` | tabel virtual **FTS5** terpisah (lihat §17) |
| `GIST` geospasial | tidak ada di SQLite. Lat/lng disimpan sebagai `REAL`, filter jarak dihitung di aplikasi. Skala <500 titik, ini cukup |

---

## Aturan lintas tabel
- Setiap tabel konten punya: `id`, `slug`, `created_at`, `updated_at`, `published_at`, `status`.
- **Soft delete wajib** (`deleted_at`) untuk semua entitas terkait narasumber. Arsip yang terhapus permanen karena salah klik admin tidak bisa dibuat ulang.
- `slug` unik per tipe, immutable setelah publish (ganti slug = kehilangan peringkat; kalau harus, wajib redirect 301).
- Kolom yang mengandung data pribadi diberi komentar SQL `-- PII` agar terlihat saat audit dan saat menyusun DPIA.

---

## 1. `collections` — proyek/tema kajian
Mewujudkan Prinsip 5 (platform, bukan situs proyek tunggal).

| Kolom | Tipe | Catatan |
|---|---|---|
| id | uuid PK | |
| slug | text UNIQUE | `batik-tulis-pekalongan` |
| title | text | |
| subtitle | text | |
| description_short | text | ≤ 200 kata, dipakai sebagai kutipan GEO |
| description_long | text (rich) | |
| region | text | `Pekalongan, Jawa Tengah` |
| period_start / period_end | int | tahun cakupan |
| status | enum | `planned \| active \| completed` |
| cover_asset_id | uuid FK assets | |
| og_image_asset_id | uuid FK assets | 1200×630 |
| funder | text[] | tampilkan hanya mitra nyata — dokumen internal secara eksplisit menandai logo di mockup sebagai contoh AI, jangan pakai logo lembaga yang belum menjadi mitra |
| sort_order | int | |

## 2. `archive_items` — satu unit dokumentasi (biasanya satu sesi wawancara)

| Kolom | Tipe | Catatan |
|---|---|---|
| id | uuid PK | |
| collection_id | uuid FK | |
| slug | text | `/koleksi/batik-tulis-pekalongan/sumarni-01` |
| title | text | |
| summary | text | 2–4 kalimat, BLUF, jadi bahan kutipan AI |
| description | text (rich) | |
| **video_source** | enum `'youtube' \| 'internal' \| 'none'` | **Wajib per brief.** Menentukan backend `<ArsipPlayer>` |
| **youtube_id** | varchar(20) NULL | Hanya ID (`dQw4w9WgXcQ`), bukan URL penuh. CHECK regex `^[A-Za-z0-9_-]{11}$` — mencegah injeksi URL sembarang ke src iframe |
| **thumbnail_url** | text NULL | **Wajib menunjuk CDN sendiri**, bukan `i.ytimg.com`. Hotlink = request ke Google sebelum user klik Play, merusak seluruh tujuan façade |
| youtube_privacy | enum `public \| unlisted` | Jika `unlisted`, item **dilarang** bertier restricted (PRD B-5). CHECK constraint |
| internal_asset_id | uuid FK assets NULL | dipakai bila `video_source='internal'` |
| duration_seconds | int | untuk `VideoObject.duration` |
| recorded_at | date | |
| recorded_place | text | |
| language | text[] | `['id','jv']` |
| access_tier | enum `public \| restricted` | |
| embargo_until | date NULL | materi sensitif; sebelum tanggal ini, hanya metadata yang tampil |
| rights_statement | text | pakai vocabulary rightsstatements.org |
| license | text | mis. `CC BY-NC-ND 4.0` |
| consent_ref | text | **kode dokumen saja**, mis. `CNS-2026-014`. Dokumennya tidak di sistem |
| consent_verified | boolean | default false. Item **tidak bisa publish** jika false — dipaksa lewat constraint, bukan lewat disiplin admin |
| withdrawal_requested | boolean | default false. True → seluruh item auto-unpublish |
| featured | boolean | |
| view_count | int | |
| search_vector | tsvector | GENERATED dari title+summary+description+transcript |

**Constraint yang bukan sekadar hiasan:**
```sql
CHECK (video_source <> 'youtube' OR youtube_id IS NOT NULL)
CHECK (video_source <> 'internal' OR internal_asset_id IS NOT NULL)
CHECK (NOT (access_tier = 'restricted' AND video_source = 'youtube'))  -- PRD B-5
CHECK (published_at IS NULL OR consent_verified = true)                -- tidak ada publish tanpa consent
```

## 3. `assets` — file media

| Kolom | Tipe | Catatan |
|---|---|---|
| id | uuid PK | |
| archive_item_id | uuid FK NULL | |
| kind | enum | `video_full \| video_highlight \| video_story \| audio \| photo \| photo_raw \| document \| transcript_file` |
| tier | enum `public \| restricted` | menentukan bucket |
| storage_bucket | text | `ahi-public` / `ahi-restricted` |
| storage_key | text | |
| mime_type / file_size_bytes / checksum_sha256 | | checksum untuk verifikasi integritas jangka panjang |
| width / height / duration_seconds | int NULL | width+height wajib untuk `<img>` (cegah CLS) |
| alt_text | text | wajib untuk `kind='photo'`. Constraint |
| caption | text | |
| hls_manifest_key | text NULL | untuk video internal |
| is_original_master | boolean | master tidak pernah dilayani lewat web |

## 4. `transcripts`

| Kolom | Tipe | Catatan |
|---|---|---|
| id / archive_item_id | | |
| language | text | |
| format | enum `plain \| timecoded \| vtt` | |
| body | text | teks penuh — **inilah aset GEO terbesar situs ini** |
| segments | jsonb | `[{start, end, speaker, text}]` untuk transkrip berjalan |
| is_verified | boolean | hasil ASR mentah vs sudah dikoreksi manusia. Tampilkan bedanya ke pengguna |
| visibility | enum `public \| restricted` | transkrip bisa publik meski video terbatas — ini justru pola yang dianjurkan: penemuan maksimal, paparan minimal |

## 5. `narasumber` — SENSITIF

Pemisahan tegas: kolom publik vs kolom internal. Idealnya dua tabel di dua skema berbeda, dan **`narasumber_private` sebaiknya tidak berada di database aplikasi web sama sekali** (PRD 5.1).

**Publik (`narasumber`)**
| Kolom | Catatan |
|---|---|
| id, slug, display_name | nama sebagaimana narasumber ingin disebut |
| honorific | `Ibu`, `Pak`, `Mbah` |
| bio_short / bio_long | |
| birth_year | int NULL — tahun saja, bukan tanggal lahir lengkap |
| role_tags | text[] — `pembatik`, `pewarna alami`, `juragan` |
| location_id | FK |
| portrait_asset_id | |
| is_deceased, deceased_year | memengaruhi bahasa halaman & etika kontak |
| display_consent | enum `full_name \| initials \| anonymous` — **hormati pilihan ini di setiap render** |
| contact_via_platform_only | boolean default true |

**Privat (`narasumber_private`) — di luar aplikasi web**
`nik` -- PII (sebaiknya jangan disimpan sama sekali; kalau wajib untuk pertanggungjawaban hibah, simpan di luar sistem), `full_legal_name` -- PII, `address` -- PII, `phone` -- PII, `email` -- PII, `next_of_kin` -- PII, `consent_document_ref`, `notes`.

## 6. `item_contributors` (n:m)
`archive_item_id`, `narasumber_id`, `role` (`narasumber | pewawancara | juru kamera | penerjemah`), `credit_order`. Mewujudkan Prinsip 1: manusia sejajar dengan artefak, bukan metadata pelengkap.

## 7. `stories` — editorial (menu Cerita)
`id, slug, title, dek, body(rich), hero_asset_id, author_id, published_at, reading_time_minutes, story_type(esai|foto-esai|penjelasan), related_item_ids uuid[]`.
Contoh dari dokumen internal: "Ketika Air Rob Datang — bagaimana banjir mengubah ritme kerja pembatik selama tiga dekade terakhir."

## 8. `batik_businesses` — direktori (PKS Pasal 2.4)
`id, slug, business_name, owner_name, description, batik_types text[], year_established, address, location_id, lat, lng, phone -- PII, whatsapp -- PII, email -- PII, instagram, website, photos uuid[], contact_visibility enum(public|form_only|hidden), verified_at, verified_by, linked_narasumber_id`.
`contact_visibility` bukan fitur tambahan: menerbitkan nomor HP puluhan pengrajin tanpa opsi ini adalah masalah PDP dan undangan spam.

## 9. `locations`
`id, name, type(kota|kecamatan|kelurahan|situs), parent_id, lat, lng, geojson`. Dipakai peta sebaran + facet Jelajah.

## 10. `themes` / `tags`
Hierarkis (`parent_id`), sesuai tema di mockup: Perempuan, Kerja & Ekonomi, Pengetahuan & Keterampilan, Lingkungan & Bencana, Identitas & Tradisi, Keluarga & Komunitas, Regenerasi, Agama & Kepercayaan, Motif & Seni, Perdagangan & Kewirausahaan.
Tema = halaman berperingkat SEO. Perlakukan sebagai konten (punya deskripsi, hero, intro 150–300 kata), bukan sekadar label.

## 11. `color_map_entries` — Peta Warna Batik Pekalongan
`id, color_name_local (soga, indigo/nila, ...), hex, source_material, process_note, region_id, related_item_ids`. Fitur pembeda; render sebagai HTML+SVG dengan tabel teks agar bisa diekstrak AI.

## 12. `timeline_events`
`id, collection_id, year_start, year_end, title, description, event_type, source_citation, related_item_ids`. `source_citation` wajib — timeline tanpa sumber adalah klaim, bukan arsip.

## 13. `access_requests` & `access_grants`
**access_requests:** `id, requester_user_id, institution, position, research_title, research_abstract, requested_scope jsonb, intended_output, ethics_statement bool, supervisor_contact -- PII, status enum(draft|submitted|under_review|approved|rejected|expired), reviewer_id, review_note, decided_at`.
**access_grants:** `id, access_request_id, user_id, scope_type(collection|item|asset), scope_id, granted_at, expires_at (default +30 hari), revoked_at, revoke_reason, max_downloads, download_count`.
Teks wajib tampil di halaman persetujuan: pemberian akses ini **bukan** consent penelitian; consent harus diminta ulang secara independen kepada narasumber (Prinsip 4).

## 14. `users` & `roles`
Peran: `admin`, `editor`, `archivist`, `reviewer`, `researcher`, `member`.
`users`: `id, email, password_hash (argon2id), mfa_secret, mfa_enabled, role, last_login_at, failed_login_count, locked_until`.
**MFA wajib untuk admin/editor/archivist/reviewer** — dipaksa di aplikasi, bukan diimbau. Titik masuk serangan British Library diyakini adalah server akses jarak jauh tanpa MFA.

## 15. `audit_logs`

| Kolom | Catatan |
|---|---|
| id | bigserial |
| occurred_at | timestamptz, index |
| actor_user_id | NULL untuk anonim |
| actor_hash | sha256(ip + user_agent + salt harian). **Jangan simpan IP mentah** |
| event_type | `video.play`, `video.complete`, `asset.signed_url_issued`, `asset.download`, `access_request.submitted`, `access_grant.approved`, `login.success`, `login.failed`, `content.published`, `content.unpublished`, `narasumber.withdrawal` |
| target_type / target_id | |
| metadata | jsonb — untuk `video.play`: `{source:'youtube'|'internal', position:0, tier:'public'}` |
| retention_class | `short` (90 hari, telemetri) / `long` (7 tahun, keputusan akses) |

Pemisahan retensi ini penting. `video.play` untuk seluruh pengunjung publik adalah data perilaku — simpan singkat dan ter-pseudonimisasi. Keputusan pemberian akses adalah catatan tata kelola — simpan lama. Menyimpan semuanya selamanya menciptakan liability yang tidak dibutuhkan.

## 16. `content_access` (konten terbatas, PKS 2.6)
`id, content_type, content_id, access_level(free|member|paid), preview_html, price_idr, payment_mode(manual|gateway)`.
`preview_html` wajib berisi teks yang bermakna dan sama untuk manusia dan crawler. Menyajikan HTML penuh ke Googlebot lalu memotongnya untuk manusia adalah cloaking.

## 17. Index & pencarian (SQLite)
```sql
CREATE INDEX idx_items_collection  ON archive_items (collection_id, published_at DESC);
CREATE INDEX idx_items_tier        ON archive_items (access_tier, published_at DESC);
CREATE INDEX idx_items_slug        ON archive_items (slug);
CREATE INDEX idx_assets_item       ON assets (archive_item_id, kind);
CREATE INDEX idx_audit_time        ON audit_logs (occurred_at DESC);
CREATE INDEX idx_audit_actor       ON audit_logs (actor_user_id, event_type);
CREATE INDEX idx_business_location ON batik_businesses (location_id);

-- Pencarian teks penuh (menggantikan tsvector Postgres)
CREATE VIRTUAL TABLE archive_search USING fts5(
  item_id UNINDEXED,
  title, summary, description, transcript, narasumber, tags,
  tokenize = 'unicode61 remove_diacritics 2'
);
-- disinkronkan lewat trigger AFTER INSERT/UPDATE/DELETE pada archive_items & transcripts
```

**Dua lapis pencarian, sengaja dipisah:**
| Lapis | Mesin | Untuk siapa |
|---|---|---|
| Publik | **Pagefind** — indeks statis dibangun saat build, berjalan di browser | Pengunjung situs. Tidak menyentuh VPS sama sekali, jadi tetap berfungsi meski VPS mati |
| Admin & API | **SQLite FTS5** | Admin mencari di seluruh koleksi termasuk item belum terbit |

Konsekuensi yang perlu disadari: pencarian publik hanya mencakup konten yang **sudah dibangun**. Item yang baru diterbitkan belum bisa dicari sampai build berikutnya selesai (1–3 menit). Ini konsisten dengan seluruh model publikasi statis.

Catatan tokenizer: `remove_diacritics 2` membantu, tapi FTS5 tidak mengenal morfologi bahasa Indonesia — "membatik", "dibatik", dan "batik" adalah tiga token berbeda. Mitigasi murah: simpan daftar sinonim/varian pada field `tags` per item, diisi manual oleh kurator. Stemming Indonesia yang sungguhan berada di luar anggaran Fase 1.

## 18. Migrasi & seed
- Migrasi Payload (`payload migrate:create` / `migrate`) ber-versi, forward-only, dijalankan CI. Tidak ada perubahan skema manual di produksi.
- **File SQLite tidak pernah di-commit ke repo.** Yang di-commit adalah migrasi dan ekspor konten (JSON/Markdown), bukan database itu sendiri.
- Seed: 1 collection, 12 archive_items, 5 stories, 20 batik_businesses, 10 timeline_events, 8 color_map_entries. Cukup untuk menguji tampilan, paginasi, dan sitemap secara nyata.
- Data seed **wajib fiktif atau sudah berizin.** Jangan pakai nama dan foto narasumber asli di lingkungan staging yang bisa terindeks.
