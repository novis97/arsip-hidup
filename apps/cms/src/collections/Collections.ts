import type { CollectionConfig } from "payload";
import { isStaff, publishedOnly } from "../access/roles";

/** SCHEMA §1. Mewujudkan Prinsip 5: platform, bukan situs proyek tunggal. */
export const Collections: CollectionConfig = {
  slug: "collections",
  labels: { singular: "Koleksi", plural: "Koleksi" },
  admin: { useAsTitle: "title", group: "Arsip" },
  versions: { drafts: true },
  access: {
    read: publishedOnly,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "subtitle", type: "text" },
    {
      name: "descriptionShort",
      type: "textarea",
      required: true,
      maxLength: 1200,
    },
    { name: "descriptionLong", type: "richText" },
    { name: "region", type: "text" },
    { name: "periodStart", type: "number" },
    { name: "periodEnd", type: "number" },
    {
      name: "status",
      type: "select",
      options: ["planned", "active", "completed"],
      defaultValue: "active",
    },
    {
      name: "funders",
      type: "array",
      fields: [{ name: "name", type: "text", required: true }],
      admin: {
        description:
          "HANYA mitra dan pendana yang benar-benar terlibat. Jangan cantumkan logo lembaga yang belum bermitra (RULES §1.6).",
      },
    },
  ],
};
