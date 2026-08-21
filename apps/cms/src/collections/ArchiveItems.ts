import type { CollectionConfig } from "payload";
import { isStaff, publishedNotWithdrawn } from "../access/roles";

const YT_ID = /^[A-Za-z0-9_-]{11}$/;

/**
 * Koleksi inti. SCHEMA.md §2.
 * Empat aturan keras dari blueprint ditegakkan di hook validasi di bawah —
 * bukan diserahkan pada disiplin admin.
 */
export const ArchiveItems: CollectionConfig = {
  slug: "archive-items",
  labels: { singular: "Arsip", plural: "Arsip" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "collection", "accessTier", "_status"],
    group: "Arsip",
  },
  versions: { drafts: true }, // riwayat versi = bagian dari integritas arsip
  access: {
    read: publishedNotWithdrawn,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  fields: [
    {
      name: "archiveNumber",
      type: "text",
      required: true,
      unique: true,
      admin: { description: "Format: AHI/BTP/2026/014" },
    },
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          "Tidak boleh diubah setelah terbit. Perubahan slug wajib disertai 301.",
      },
    },
    {
      name: "collection",
      type: "relationship",
      relationTo: "collections",
      required: true,
    },
    {
      name: "summary",
      type: "textarea",
      required: true,
      maxLength: 600,
      admin: {
        description:
          "2–4 kalimat, kalimat pertama = jawaban (BLUF). Ini yang dikutip mesin jawaban.",
      },
    },
    { name: "description", type: "richText" },

    // ── Video (brief wajib) ──────────────────────────────────────────
    {
      name: "videoSource",
      type: "select",
      required: true,
      defaultValue: "none",
      options: [
        { label: "YouTube (hanya untuk tier publik)", value: "youtube" },
        {
          label: "Internal / R2 (tier terbatas & fallback)",
          value: "internal",
        },
        { label: "Tanpa video", value: "none" },
      ],
    },
    {
      name: "youtubeId",
      type: "text",
      admin: {
        condition: (d) => d.videoSource === "youtube",
        description: "ID 11 karakter saja (dQw4w9WgXcQ), bukan URL penuh.",
      },
      validate: (val: string | null | undefined, { siblingData }: any) => {
        if (siblingData?.videoSource !== "youtube") return true;
        if (!val) return "Wajib diisi bila sumber video YouTube.";
        // RULES V-2 — mencegah injeksi URL sembarang ke src iframe.
        return (
          YT_ID.test(val) || "ID YouTube harus tepat 11 karakter [A-Za-z0-9_-]."
        );
      },
    },
    {
      name: "thumbnailUrl",
      type: "text",
      required: true,
      admin: {
        description:
          "WAJIB dari cdn.arsiphidup.id. Hotlink ke i.ytimg.com merusak façade.",
      },
      validate: (val: string) =>
        !/ytimg\.com|youtube\.com/.test(val || "") ||
        "Thumbnail tidak boleh hotlink ke domain Google (RULES V-5).",
    },
    {
      name: "youtubePrivacy",
      type: "select",
      options: ["public", "unlisted"],
      defaultValue: "public",
      admin: { condition: (d) => d.videoSource === "youtube" },
    },
    {
      name: "internalAsset",
      type: "relationship",
      relationTo: "assets",
      admin: { condition: (d) => d.videoSource === "internal" },
    },
    {
      name: "fallbackMp4",
      type: "text",
      admin: {
        description: "Mirror publik di R2 untuk panel fallback (RULES V-11).",
      },
    },
    { name: "durationSeconds", type: "number", required: true },

    // ── Perekaman & hak ──────────────────────────────────────────────
    { name: "recordedAt", type: "date", required: true },
    { name: "recordedPlace", type: "text", required: true },
    {
      name: "language",
      type: "select",
      hasMany: true,
      required: true,
      options: ["id", "jv", "en"],
      defaultValue: ["id"],
    },
    {
      name: "accessTier",
      type: "select",
      required: true,
      defaultValue: "public",
      options: ["public", "restricted"],
    },
    {
      name: "embargoUntil",
      type: "date",
      admin: {
        description:
          "Sebelum tanggal ini hanya metadata yang tampil (RULES E-5).",
      },
    },
    { name: "rightsStatement", type: "text", required: true },
    {
      name: "license",
      type: "text",
      required: true,
      defaultValue: "CC BY-NC-ND 4.0",
    },

    // ── Consent: gerbang publikasi ───────────────────────────────────
    {
      name: "consentRef",
      type: "text",
      required: true,
      admin: {
        description:
          "KODE dokumen saja (CNS-2026-014). Dokumen fisiknya TIDAK PERNAH diunggah ke sistem ini.",
      },
    },
    { name: "consentVerified", type: "checkbox", defaultValue: false },
    {
      name: "withdrawalRequested",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "Dicentang = seluruh item ditarik dari publik dalam ≤24 jam (RULES E-3).",
      },
    },

    {
      name: "contributors",
      type: "array",
      fields: [
        {
          name: "narasumber",
          type: "relationship",
          relationTo: "narasumber",
          required: true,
        },
        {
          name: "role",
          type: "select",
          options: ["narasumber", "pewawancara", "juru-kamera", "penerjemah"],
          required: true,
        },
      ],
    },
    {
      name: "themes",
      type: "relationship",
      relationTo: "themes",
      hasMany: true,
    },
    { name: "location", type: "relationship", relationTo: "locations" },
    { name: "featured", type: "checkbox", defaultValue: false },
  ],

  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data;

        // PRD B-5 / RULES V-7 — unlisted bukan kontrol akses.
        if (
          data.accessTier === "restricted" &&
          data.videoSource === "youtube"
        ) {
          throw new Error(
            "Materi tier TERBATAS tidak boleh di YouTube, termasuk unlisted. " +
              "YouTube tidak menyediakan pencabutan maupun audit akses. Gunakan videoSource=internal. (PRD B-5)",
          );
        }
        // RULES §1.2 — tidak ada publikasi tanpa consent terverifikasi.
        if (data._status === "published" && !data.consentVerified) {
          throw new Error(
            "Item tidak dapat diterbitkan sebelum consentVerified dicentang. (RULES §1.2)",
          );
        }
        // RULES E-3 — penarikan mengalahkan status terbit.
        if (data.withdrawalRequested) data._status = "draft";
        return data;
      },
    ],
  },
};
