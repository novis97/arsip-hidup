import type { CollectionConfig } from "payload";
import { isStaff, publishedOnly } from "../access/roles";

/**
 * SCHEMA §5 — SENSITIF.
 * Yang TIDAK ada di sini, dan tidak boleh ditambahkan:
 *   NIK, nama lengkap legal, alamat, nomor telepon, email, kontak keluarga,
 *   dan dokumen consent.
 * Semua itu tinggal di luar sistem (PRD 5.1). Yang tidak ada di server
 * tidak bisa dicuri — pelajaran langsung dari kebocoran 600GB British Library.
 * Jika ada permintaan menambahkannya, minta alasannya tertulis lebih dulu.
 */
export const Narasumber: CollectionConfig = {
  slug: "narasumber",
  labels: { singular: "Narasumber", plural: "Narasumber" },
  admin: { useAsTitle: "displayName", group: "Arsip" },
  versions: { drafts: true },
  access: {
    read: publishedOnly,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  hooks: {
    afterRead: [
      ({ doc, req }) => {
        if (req.user) return doc;

        const honorific =
          typeof doc.honorific === "string" ? doc.honorific.trim() : "";
        const birthDecade =
          typeof doc.birthYear === "number" && Number.isFinite(doc.birthYear)
            ? `${Math.floor(doc.birthYear / 10) * 10}-an`
            : null;

        if (doc.displayConsent === "full_name") {
          const displayName =
            typeof doc.displayName === "string" ? doc.displayName.trim() : "";
          return {
            ...doc,
            publicLabel:
              [honorific, displayName].filter(Boolean).join(" ") ||
              "Narasumber (anonim)",
            birthDecade,
          };
        }

        if (doc.displayConsent === "initials") {
          const initials =
            typeof doc.initials === "string" ? doc.initials.trim() : "";
          return {
            ...doc,
            publicLabel: initials
              ? [honorific, initials].filter(Boolean).join(" ")
              : "Narasumber (anonim)",
            displayName: null,
            slug: null,
            birthYear: null,
            birthDecade,
            deceasedYear: null,
          };
        }

        return {
          ...doc,
          publicLabel: "Narasumber (anonim)",
          displayName: null,
          slug: null,
          initials: null,
          honorific: null,
          birthYear: null,
          birthDecade,
          deceasedYear: null,
        };
      },
    ],
  },
  fields: [
    {
      name: "publicLabel",
      type: "text",
      virtual: true,
    },
    {
      name: "displayName",
      type: "text",
      required: true,
      admin: { description: "Nama sebagaimana narasumber ingin disebut." },
    },
    {
      name: "initials",
      type: "text",
      admin: { description: "Dipakai bila displayConsent = initials." },
    },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    {
      name: "honorific",
      type: "select",
      options: ["Ibu", "Bapak", "Mbah", "Nyai", "-"],
    },
    { name: "bioShort", type: "textarea" },
    { name: "bioLong", type: "richText" },
    {
      name: "birthYear",
      type: "number",
      admin: {
        description:
          "TAHUN saja. Tanggal lahir lengkap tidak dibutuhkan dan tidak disimpan.",
      },
    },
    {
      name: "birthDecade",
      type: "text",
      virtual: true,
    },
    {
      name: "roleTags",
      type: "select",
      hasMany: true,
      options: [
        "pembatik",
        "pewarna-alami",
        "juragan",
        "pedagang",
        "tukang-cap",
        "pengurus-komunitas",
      ],
    },
    { name: "location", type: "relationship", relationTo: "locations" },
    { name: "isDeceased", type: "checkbox", defaultValue: false },
    {
      name: "deceasedYear",
      type: "number",
      admin: { condition: (d) => d.isDeceased },
    },
    {
      name: "displayConsent",
      type: "select",
      required: true,
      defaultValue: "full_name",
      options: [
        { label: "Nama lengkap boleh ditampilkan", value: "full_name" },
        { label: "Inisial saja", value: "initials" },
        { label: "Anonim", value: "anonymous" },
      ],
      admin: {
        description:
          "Dihormati di SETIAP tempat: judul, alt, meta OG, schema, URL. Bocor di satu titik = tidak ada anonimisasi.",
      },
    },
    {
      name: "contactViaPlatformOnly",
      type: "checkbox",
      defaultValue: true,
      admin: {
        readOnly: true,
        description:
          "Platform memfasilitasi perkenalan; kontak tidak pernah diberikan langsung (RULES E-2).",
      },
    },
  ],
};
