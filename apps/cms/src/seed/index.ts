/**
 * Seed FIKTIF. RULES O-5 / SCHEMA §18:
 * dilarang memakai nama, foto, atau cerita narasumber asli di staging.
 */
import { getPayload } from "payload";
import config from "../../payload.config";

const run = async () => {
  const payload = await getPayload({ config });

  const koleksiAda = await payload.find({
    collection: "collections",
    where: { slug: { equals: "seed-batik-tulis-pekalongan" } },
    limit: 1,
  });
  const koleksi = koleksiAda.docs[0] ?? await payload.create({
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

  const narasumberAda = await payload.find({
    collection: "narasumber",
    where: { slug: { equals: "seed-ratmi" } },
    limit: 1,
  });
  const n = narasumberAda.docs[0] ?? await payload.create({
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

  const arsipAda = await payload.find({
    collection: "archive-items",
    where: { slug: { equals: "seed-ratmi-01" } },
    limit: 1,
  });
  const arsip = arsipAda.docs[0] ?? await payload.create({
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

  const transkripAda = await payload.find({
    collection: "transcripts",
    where: { archiveItem: { equals: arsip.id } },
    limit: 1,
  });
  if (transkripAda.totalDocs === 0) {
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
  }

  const narasumberInisialAda = await payload.find({
    collection: "narasumber",
    where: { slug: { equals: "seed-sari-ningsih" } },
    limit: 1,
  });
  const narasumberInisial = narasumberInisialAda.docs[0] ?? await payload.create({
    collection: "narasumber",
    data: {
      displayName: "[SEED] Sari Ningsih",
      slug: "seed-sari-ningsih",
      initials: "S.N.",
      honorific: "Ibu",
      birthYear: 1962,
      displayConsent: "initials",
      roleTags: ["pembatik"],
      _status: "published",
    },
  });

  const arsipInisialAda = await payload.find({
    collection: "archive-items",
    where: { archiveNumber: { equals: "AHI/BTP/2026/002" } },
    limit: 1,
  });
  const arsipInisial = arsipInisialAda.docs[0]
    ? await payload.update({
        collection: "archive-items",
        id: arsipInisialAda.docs[0].id,
        data: {
          slug: "seed-resep-warna-keluarga-01",
          thumbnailUrl: "https://cdn.arsiphidup.id/thumbs/seed-resep-warna-keluarga-01-1280.webp",
        },
      })
    : await payload.create({
    collection: "archive-items",
    data: {
      archiveNumber: "AHI/BTP/2026/002",
      title: "[SEED] Sari Ningsih — merawat resep warna keluarga",
      slug: "seed-resep-warna-keluarga-01",
      collection: koleksi.id,
      summary:
        "Wawancara fiktif dengan [SEED] Sari Ningsih tentang pencatatan resep warna dan pembagian pengetahuan antargenerasi.",
      videoSource: "none",
      thumbnailUrl: "https://cdn.arsiphidup.id/thumbs/seed-resep-warna-keluarga-01-1280.webp",
      durationSeconds: 735,
      recordedAt: "2026-04-08",
      recordedPlace: "Kergon, Pekalongan",
      language: ["id"],
      accessTier: "public",
      rightsStatement: "InC-EDU",
      license: "CC BY-NC-ND 4.0",
      consentRef: "SEED-001",
      consentVerified: true,
      withdrawalRequested: false,
      contributors: [{ narasumber: narasumberInisial.id, role: "narasumber" }],
      _status: "published",
    },
  });

  const transkripInisialAda = await payload.find({
    collection: "transcripts",
    where: { archiveItem: { equals: arsipInisial.id } },
    limit: 1,
  });
  if (transkripInisialAda.totalDocs === 0) {
    await payload.create({
      collection: "transcripts",
      data: {
        archiveItem: arsipInisial.id,
        language: "id",
        format: "plain",
        body: "[SEED] Sari Ningsih menjelaskan cara fiktif mencatat campuran warna agar dapat dipelajari generasi berikutnya.",
        isVerified: true,
        visibility: "public",
      },
    });
  }

  const narasumberAnonimAda = await payload.find({
    collection: "narasumber",
    where: { slug: { equals: "seed-laras-wening" } },
    limit: 1,
  });
  const narasumberAnonim = narasumberAnonimAda.docs[0] ?? await payload.create({
    collection: "narasumber",
    data: {
      displayName: "[SEED] Laras Wening",
      slug: "seed-laras-wening",
      honorific: "Ibu",
      birthYear: 1958,
      displayConsent: "anonymous",
      roleTags: ["pembatik"],
      _status: "published",
    },
  });

  const arsipAnonimAda = await payload.find({
    collection: "archive-items",
    where: { archiveNumber: { equals: "AHI/BTP/2026/003" } },
    limit: 1,
  });
  const arsipAnonim = arsipAnonimAda.docs[0]
    ? await payload.update({
        collection: "archive-items",
        id: arsipAnonimAda.docs[0].id,
        data: {
          slug: "seed-musim-rob-01",
          thumbnailUrl: "https://cdn.arsiphidup.id/thumbs/seed-musim-rob-01-1280.webp",
        },
      })
    : await payload.create({
    collection: "archive-items",
    data: {
      archiveNumber: "AHI/BTP/2026/003",
      title: "[SEED] Laras Wening — bekerja bersama menghadapi musim rob",
      slug: "seed-musim-rob-01",
      collection: koleksi.id,
      summary:
        "Wawancara fiktif dengan [SEED] Laras Wening mengenai kerja bersama para pembatik saat musim rob.",
      videoSource: "none",
      thumbnailUrl: "https://cdn.arsiphidup.id/thumbs/seed-musim-rob-01-1280.webp",
      durationSeconds: 648,
      recordedAt: "2026-05-17",
      recordedPlace: "Pasirsari, Pekalongan",
      language: ["id", "jv"],
      accessTier: "public",
      rightsStatement: "InC-EDU",
      license: "CC BY-NC-ND 4.0",
      consentRef: "SEED-002",
      consentVerified: true,
      withdrawalRequested: false,
      contributors: [{ narasumber: narasumberAnonim.id, role: "narasumber" }],
      _status: "published",
    },
  });

  const transkripAnonimAda = await payload.find({
    collection: "transcripts",
    where: { archiveItem: { equals: arsipAnonim.id } },
    limit: 1,
  });
  if (transkripAnonimAda.totalDocs === 0) {
    await payload.create({
      collection: "transcripts",
      data: {
        archiveItem: arsipAnonim.id,
        language: "id",
        format: "plain",
        body: "[SEED] Laras Wening menceritakan kisah fiktif tentang pembagian tempat kerja ketika air rob datang.",
        isVerified: false,
        visibility: "public",
      },
    });
  }

  console.log("Seed selesai. Semua data fiktif.");
  process.exit(0);
};
run();
