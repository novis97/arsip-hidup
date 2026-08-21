import type { CollectionConfig } from "payload";
import { isStaff, denyAll } from "../access/roles";

/** SCHEMA §3. Tier menentukan bucket. Master tidak pernah dilayani lewat web (RULES V-13). */
export const Assets: CollectionConfig = {
  slug: "assets",
  upload: {
    staticDir: undefined,
    mimeTypes: ["image/*", "video/*", "audio/*", "application/pdf"],
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
      options: ["public", "restricted"],
    },
    {
      name: "altText",
      type: "text",
      validate: (val: string, { siblingData }: any) =>
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
    { name: "hlsManifestKey", type: "text" },
    {
      name: "isOriginalMaster",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "Master TIDAK PERNAH dilayani lewat HTTP. Simpan di penyimpanan pelestarian.",
      },
    },
  ],
};
