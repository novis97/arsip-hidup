import type { CollectionConfig, PayloadRequest } from "payload";
import { isStaff, publishedNotWithdrawn } from "../access/roles";
import { triggerDeploy } from "../lib/deploy";
import {
  redactNames,
  redactNamesInValue,
  type NameRedaction,
} from "../lib/redactNames";

const YT_ID = /^[A-Za-z0-9_-]{11}$/;
const INTERNAL_REDACTION_USER: NonNullable<PayloadRequest["user"]> = {
  id: -1,
  name: "Proses redaksi internal",
  role: "admin",
  email: "redaksi-internal@localhost.invalid",
  createdAt: "1970-01-01T00:00:00.000Z",
  updatedAt: "1970-01-01T00:00:00.000Z",
  collection: "users",
};

type NarasumberReference = {
  id?: number | string;
  publicLabel?: string | null;
};

type OriginalNarasumber = {
  displayConsent?: string | null;
  displayName?: string | null;
};

const originalNarasumberByRequest = new WeakMap<
  object,
  Map<number | string, Promise<OriginalNarasumber | null>>
>();

const getOriginalNarasumber = (
  req: PayloadRequest,
  id: number | string,
): Promise<OriginalNarasumber | null> => {
  let requestCache = originalNarasumberByRequest.get(req);
  if (!requestCache) {
    requestCache = new Map();
    originalNarasumberByRequest.set(req, requestCache);
  }

  const cached = requestCache.get(id);
  if (cached) return cached;

  const lookup = req.payload
    .findByID({
      collection: "narasumber",
      id,
      depth: 0,
      overrideAccess: true,
      req: {
        ...req,
        query: { ...req.query },
        user: INTERNAL_REDACTION_USER,
      },
    })
    .then((narasumber) => narasumber as OriginalNarasumber);

  requestCache.set(id, lookup);
  return lookup;
};

const addRedactions = (
  totals: Map<string, number>,
  redactions: NameRedaction[],
) => {
  for (const { word, count } of redactions) {
    totals.set(word, (totals.get(word) ?? 0) + count);
  }
};

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
      validate: (val: string | string[] | null | undefined) =>
        !/ytimg\.com|youtube\.com/.test(String(val ?? "")) ||
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
    afterRead: [
      async ({ doc, req }) => {
        if (req.user) return doc;

        const contributors = Array.isArray(doc.contributors)
          ? doc.contributors
          : [];
        const references = new Map<
          number | string,
          NarasumberReference | undefined
        >();

        for (const contributor of contributors) {
          const narasumber = contributor?.narasumber;
          const reference =
            narasumber && typeof narasumber === "object"
              ? (narasumber as NarasumberReference)
              : undefined;
          const id = reference?.id ?? narasumber;
          if (typeof id === "number" || typeof id === "string") {
            if (!references.has(id) || reference?.publicLabel) {
              references.set(id, reference);
            }
          }
        }

        for (const [id, reference] of references) {
          const original = await getOriginalNarasumber(req, id);
          if (
            !original ||
            original.displayConsent === "full_name" ||
            typeof original.displayName !== "string" ||
            typeof reference?.publicLabel !== "string"
          ) {
            continue;
          }

          const totals = new Map<string, number>();
          const names = [original.displayName];
          const title = redactNames(doc.title, names, reference.publicLabel);
          doc.title = title.text;
          addRedactions(totals, title.redactions);

          const summary = redactNames(
            doc.summary,
            names,
            reference.publicLabel,
          );
          doc.summary = summary.text;
          addRedactions(totals, summary.redactions);

          const description = redactNamesInValue(
            doc.description,
            names,
            reference.publicLabel,
          );
          doc.description = description.value;
          addRedactions(totals, description.redactions);

          if (doc.transcript && typeof doc.transcript === "object") {
            const transcript = doc.transcript as { body?: unknown };
            const body = redactNames(
              typeof transcript.body === "string" ? transcript.body : null,
              names,
              reference.publicLabel,
            );
            if (typeof transcript.body === "string") {
              transcript.body = body.text;
            }
            addRedactions(totals, body.redactions);
          }

          for (const [word, count] of totals) {
            console.info("AHI-REDACT", {
              archiveItemId: doc.id,
              word,
              count,
            });
          }
        }

        return doc;
      },
    ],
    // Publish memicu build statis. Jeda 1–3 menit adalah konsekuensi sadar
    // dari memisahkan situs publik dari VPS (ARCHITECTURE §2.2).
    afterChange: [triggerDeploy],
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
