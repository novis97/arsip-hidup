import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";

import { Users } from "./src/collections/Users";
import { Collections } from "./src/collections/Collections";
import { ArchiveItems } from "./src/collections/ArchiveItems";
import { Assets } from "./src/collections/Assets";
import { Transcripts } from "./src/collections/Transcripts";
import { Narasumber } from "./src/collections/Narasumber";
import { Stories } from "./src/collections/Stories";
import { BatikBusinesses } from "./src/collections/BatikBusinesses";
import { Themes } from "./src/collections/Themes";
import { Locations } from "./src/collections/Locations";
import { TimelineEvents } from "./src/collections/TimelineEvents";
import { ColorMapEntries } from "./src/collections/ColorMapEntries";
import { AccessRequests } from "./src/collections/AccessRequests";
import { AccessGrants } from "./src/collections/AccessGrants";
import { AuditLogs } from "./src/collections/AuditLogs";
import { mediaEndpoints } from "./src/endpoints/mediaPlayback";
import { triggerDeploy } from "./src/lib/deploy";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: { titleSuffix: " — Arsip Hidup Indonesia" },
  },

  // SQLite: satu file. Backup = menyalin satu file (ARCHITECTURE §2.1).
  // Payload resmi mendukung MongoDB, Postgres, SQLite. MySQL tidak tersedia.
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URI || "file:./payload.db" },
  }),

  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET!,
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,

  // CORS/CSRF ketat — hanya domain kita (SECURITY §5).
  cors: [process.env.PUBLIC_SITE_URL!].filter(Boolean),
  csrf: [process.env.PUBLIC_SITE_URL!].filter(Boolean),

  collections: [
    Users,
    Collections,
    ArchiveItems,
    Assets,
    Transcripts,
    Narasumber,
    Stories,
    BatikBusinesses,
    Themes,
    Locations,
    TimelineEvents,
    ColorMapEntries,
    AccessRequests,
    AccessGrants,
    AuditLogs,
  ],

  endpoints: [...mediaEndpoints],

  plugins: [
    s3Storage({
      collections: {
        assets: {
          // Bucket ditentukan per-dokumen oleh tier. Materi terbatas
          // TIDAK PERNAH masuk bucket publik (RULES V-9).
          bucket: process.env.R2_BUCKET_PUBLIC!,
          disablePayloadAccessControl: false,
          generateFileURL: ({ filename }) =>
            `${process.env.PUBLIC_CDN_URL}/${filename}`,
        },
      },
      config: {
        endpoint: process.env.R2_ENDPOINT,
        region: "auto",
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        },
      },
    }),
  ],

  // Publish memicu build statis. Jeda 1–3 menit adalah konsekuensi sadar
  // dari memisahkan situs publik dari VPS (ARCHITECTURE §2.2).
  hooks: { afterChange: [triggerDeploy] },

  typescript: { outputFile: path.resolve(dirname, "src/payload-types.ts") },
});
