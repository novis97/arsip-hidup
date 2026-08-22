import type { CollectionConfig } from "payload";
import { isStaff, denyAll } from "../access/roles";

/** SCHEMA §3. Tier menentukan bucket. Master tidak pernah dilayani lewat web (RULES V-13). */
export const Assets: CollectionConfig = {
  slug: "assets",
  upload: {
    staticDir: undefined,
    mimeTypes: ["image/*", "video/*", "audio/*", "application/pdf"],
  },
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        const uploadedFilename = req.file?.name ?? data?.filename;

        if (!uploadedFilename) return data;

        return {
          ...data,
          storageBucket: process.env.R2_BUCKET_PUBLIC,
          storageKey: uploadedFilename,
        };
      },
    ],
    beforeChange: [
      ({ data }) => {
        if (!data.filename) return data;

        return {
          ...data,
          storageBucket: process.env.R2_BUCKET_PUBLIC,
          storageKey: data.filename,
        };
      },
    ],
  },
  admin: { group: "Arsip" },
  access: {
    // Aset terbatas tidak pernah terbaca publik. Aksesnya hanya lewat endpoint presigned.
    read: ({ req }) => (req.user ? true : { tier: { equals: "public" } }),
    create: isStaff,
    update: isStaff,
    delete: denyAll, // hapus = lewat admin DB, disengaja
  },
  fields: [
    { name: "archiveItem", type: "relationship", relationTo: "archive-items" },
    {
      name: "kind",
      type: "select",
      required: true,
      options: [
        "video_full",
        "video_highlight",
        "video_story",
        "audio",
        "photo",
        "photo_raw",
        "document",
        "transcript_file",
      ],
    },
    {
      name: "tier",
      type: "select",
      required: true,
      defaultValue: "public",
      // FASE 1: hanya bucket publik yang tersambung. Opsi "restricted"
      // dikunci agar tidak ada aset yang ditandai terbatas tapi tersimpan
      // di bucket publik — data yang berbohong lebih buruk daripada
      // fitur yang belum ada.
      // TODO(T3.x): buka kembali setelah routing dua bucket + presigned
      // URL tersedia.
      options: ["public"],
    },
    {
      name: "storageBucket",
      type: "text",
      required: true,
      admin: { readOnly: true },
    },
    {
      name: "storageKey",
      type: "text",
      required: true,
      admin: { readOnly: true },
    },
    { name: "fileSizeBytes", type: "number" },
    { name: "durationSeconds", type: "number" },
    {
      name: "altText",
      type: "text",
      validate: (
        val: string | string[] | null | undefined,
        { siblingData }: any,
      ) =>
        siblingData?.kind !== "photo" ||
        !!val ||
        "Alt text wajib untuk foto (aksesibilitas + SEO).",
    },
    { name: "caption", type: "text" },
    {
      name: "checksumSha256",
      type: "text",
      admin: {
        description: "Verifikasi integritas jangka panjang. Bit rot itu nyata.",
      },
    },
    // V-13: master tidak pernah dilayani lewat web.
    // Penegakan ada di authorizeAsset (Fase 3) — field ini BELUM
    // menegakkan apa pun.
    // TODO(T3.x): tolak di authorizeAsset bila isOriginalMaster === true.
    {
      name: "isOriginalMaster",
      type: "checkbox",
      defaultValue: false,
      access: {
        create: ({ req }) => req.user?.role === "admin",
        update: ({ req }) => req.user?.role === "admin",
      },
      admin: {
        description:
          "Master TIDAK PERNAH dilayani lewat HTTP. Simpan di penyimpanan pelestarian.",
      },
    },
  ],
};
