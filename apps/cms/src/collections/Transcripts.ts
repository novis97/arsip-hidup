import type { CollectionConfig, PayloadRequest } from "payload";
import { isStaff, transcriptPubliclyReadable } from "../access/roles";
import { redactNames } from "../lib/redactNames";

const INTERNAL_REDACTION_USER: NonNullable<PayloadRequest["user"]> = {
  id: -1,
  name: "Proses redaksi internal",
  role: "admin",
  email: "redaksi-internal@localhost.invalid",
  createdAt: "1970-01-01T00:00:00.000Z",
  updatedAt: "1970-01-01T00:00:00.000Z",
  collection: "users",
};

type ArchiveItemForRedaction = {
  contributors?: Array<{
    narasumber?: number | string | { id?: number | string } | null;
  }> | null;
};

type OriginalNarasumber = {
  displayConsent?: string | null;
  displayName?: string | null;
  publicLabel?: string | null;
  initials?: string | null;
  honorific?: string | null;
};

const archiveItemByRequest = new WeakMap<
  object,
  Map<number | string, Promise<ArchiveItemForRedaction | null>>
>();

const narasumberByRequest = new WeakMap<
  object,
  Map<number | string, Promise<OriginalNarasumber | null>>
>();

const internalRequest = (req: PayloadRequest): PayloadRequest => ({
  ...req,
  query: { ...req.query },
  user: INTERNAL_REDACTION_USER,
});

const getArchiveItem = (
  req: PayloadRequest,
  id: number | string,
): Promise<ArchiveItemForRedaction | null> => {
  let requestCache = archiveItemByRequest.get(req);
  if (!requestCache) {
    requestCache = new Map();
    archiveItemByRequest.set(req, requestCache);
  }

  const cached = requestCache.get(id);
  if (cached) return cached;

  const lookup = req.payload
    .findByID({
      collection: "archive-items",
      id,
      depth: 0,
      overrideAccess: true,
      req: internalRequest(req),
    })
    .then((archiveItem) => archiveItem as ArchiveItemForRedaction);

  requestCache.set(id, lookup);
  return lookup;
};

const getOriginalNarasumber = (
  req: PayloadRequest,
  id: number | string,
): Promise<OriginalNarasumber | null> => {
  let requestCache = narasumberByRequest.get(req);
  if (!requestCache) {
    requestCache = new Map();
    narasumberByRequest.set(req, requestCache);
  }

  const cached = requestCache.get(id);
  if (cached) return cached;

  const lookup = req.payload
    .findByID({
      collection: "narasumber",
      id,
      depth: 0,
      overrideAccess: true,
      req: internalRequest(req),
    })
    .then((narasumber) => narasumber as OriginalNarasumber);

  requestCache.set(id, lookup);
  return lookup;
};

const getPublicLabel = (narasumber: OriginalNarasumber): string => {
  if (typeof narasumber.publicLabel === "string") {
    return narasumber.publicLabel;
  }

  if (narasumber.displayConsent === "initials") {
    const honorific =
      typeof narasumber.honorific === "string"
        ? narasumber.honorific.trim()
        : "";
    const initials =
      typeof narasumber.initials === "string" ? narasumber.initials.trim() : "";
    return (
      [honorific, initials].filter(Boolean).join(" ") || "Narasumber (anonim)"
    );
  }

  return "Narasumber (anonim)";
};

/** SCHEMA §4. Aset SEO/GEO terbesar situs ini. */
export const Transcripts: CollectionConfig = {
  slug: "transcripts",
  admin: { group: "Arsip", useAsTitle: "id" },
  access: {
    read: transcriptPubliclyReadable,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  hooks: {
    afterRead: [
      async ({ doc, req }) => {
        if (req.user) return doc;

        if (doc.segments != null) {
          console.warn("AHI-SEGMENTS-DIBUANG", { transcriptId: doc.id });
        }
        let body = doc.body;

        const archiveItemReference = doc.archiveItem;
        const archiveItemId =
          archiveItemReference && typeof archiveItemReference === "object"
            ? archiveItemReference.id
            : archiveItemReference;
        if (
          typeof archiveItemId !== "number" &&
          typeof archiveItemId !== "string"
        ) {
          return { ...doc, body, segments: null };
        }

        const archiveItem = await getArchiveItem(req, archiveItemId);
        const contributors = Array.isArray(archiveItem?.contributors)
          ? archiveItem.contributors
          : [];
        const narasumberIds = new Set<number | string>();

        for (const contributor of contributors) {
          const reference = contributor?.narasumber;
          const id =
            reference && typeof reference === "object"
              ? reference.id
              : reference;
          if (typeof id === "number" || typeof id === "string") {
            narasumberIds.add(id);
          }
        }

        const narasumberForRedaction: Array<{
          displayName: string;
          publicLabel: string;
        }> = [];

        for (const id of narasumberIds) {
          const narasumber = await getOriginalNarasumber(req, id);
          if (
            !narasumber ||
            narasumber.displayConsent === "full_name" ||
            typeof narasumber.displayName !== "string"
          ) {
            continue;
          }

          narasumberForRedaction.push({
            displayName: narasumber.displayName,
            publicLabel: getPublicLabel(narasumber),
          });
        }

        narasumberForRedaction.sort(
          (left, right) => right.displayName.length - left.displayName.length,
        );

        for (const narasumber of narasumberForRedaction) {
          const result = redactNames(
            body,
            [narasumber.displayName],
            narasumber.publicLabel,
          );
          body = result.text;

          for (const { word, count } of result.redactions) {
            console.info("AHI-REDACT-TRANSCRIPT", {
              transcriptId: doc.id,
              word,
              count,
            });
          }
        }

        return { ...doc, body, segments: null };
      },
    ],
  },
  fields: [
    {
      name: "archiveItem",
      type: "relationship",
      relationTo: "archive-items",
      required: true,
    },
    {
      name: "language",
      type: "select",
      required: true,
      options: ["id", "jv", "en"],
      defaultValue: "id",
    },
    {
      name: "format",
      type: "select",
      required: true,
      options: ["plain", "timecoded", "vtt"],
      defaultValue: "timecoded",
    },
    { name: "body", type: "textarea", required: true },
    { name: "segments", type: "json" },
    {
      name: "isVerified",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "Status ini DITAMPILKAN ke pembaca. Transkrip ASR yang tampak otoritatif lebih berbahaya daripada tidak ada transkrip (RULES C-4).",
      },
    },
    {
      name: "visibility",
      type: "select",
      required: true,
      options: ["public", "restricted"],
      defaultValue: "public",
      admin: {
        description:
          "Transkrip boleh publik meski videonya terbatas — penemuan maksimal, paparan minimal.",
      },
    },
  ],
};
