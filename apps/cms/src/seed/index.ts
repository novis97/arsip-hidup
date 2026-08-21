/**
 * Seed FIKTIF. RULES O-5 / SCHEMA §18:
 * dilarang memakai nama, foto, atau cerita narasumber asli di staging.
 */
import { getPayload } from "payload";
import config from "../../payload.config";

const run = async () => {
  const payload = await getPayload({ config });

  const koleksi = await payload.create({
    collection: "collections",
    data: {
      title: "[SEED] Batik Tulis Pekalongan",
      slug: "seed-batik-tulis-pekalongan",
      descriptionShort:
        "Dokumentasi sejarah lisan pembatik tulis di Pekalongan, Jawa Tengah, mencakup pewarna alam, dampak banjir rob, dan regenerasi pembatik.",
      region: "Pekalongan, Jawa Tengah",
      periodStart: 1950,
      periodEnd: 2026,
      status: "active",
      funder: [],
      _status: "published",
    },
  });

  const n = await payload.create({
    collection: "narasumber",
    data: {
      displayName: "[SEED] Ratmi",
      slug: "seed-ratmi",
      honorific: "Ibu",
      birthYear: 1951,
      displayConsent: "full_name",
      roleTags: ["pembatik"],
      _status: "published",
    },
  });

  const arsip = await payload.create({
    collection: "archive-items",
    data: {
      archiveNumber: "AHI/BTP/2026/001",
      title: "[SEED] Ratmi — mencanting sejak umur sembilan tahun",
      slug: "seed-ratmi-01",
      collection: koleksi.id,
      summary:
        "Wawancara sejarah lisan dengan seorang pembatik tulis Pekalongan tentang pewarna alam dan perubahan ritme kerja akibat banjir rob.",
      videoSource: "youtube",
      youtubeId: "aaaaaaaaaaa",
      thumbnailUrl: "https://cdn.arsiphidup.id/thumbs/seed-ratmi-01-1280.webp",
      durationSeconds: 862,
      recordedAt: "2026-03-12",
      recordedPlace: "Kauman, Pekalongan",
      language: ["id", "jv"],
      accessTier: "public",
      rightsStatement: "InC-EDU",
      license: "CC BY-NC-ND 4.0",
      consentRef: "SEED-000",
      consentVerified: true,
      withdrawalRequested: false,
      contributors: [{ narasumber: n.id, role: "narasumber" }],
      _status: "published",
    },
  });

  await payload.create({
    collection: "transcripts",
    data: {
      archiveItem: arsip.id,
      language: "id",
      format: "plain",
      body: "[SEED] Transkrip fiktif tentang proses mencanting dan pewarna alam.",
      isVerified: true,
      visibility: "public",
    },
  });

  console.log("Seed selesai. Semua data fiktif.");
  process.exit(0);
};
run();
