import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Klien R2. Satu instance dipakai ulang — membuat S3Client per request
 * membocorkan socket pada beban tinggi.
 */
let client: S3Client | null = null;

export function r2(): S3Client {
  if (client) return client;
  const required = ["R2_ENDPOINT", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length)
    throw new Error(`Konfigurasi R2 belum lengkap: ${missing.join(", ")}`);

  client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  return client;
}

export const TTL = () => {
  const ttl = Number(process.env.SIGNED_URL_TTL_SECONDS ?? 300);
  if (!Number.isFinite(ttl) || ttl <= 0 || ttl > 300) {
    throw new Error(
      `SIGNED_URL_TTL_SECONDS tidak valid atau melebihi 300 detik (RULES V-9): ${ttl}`,
    );
  }
  return ttl;
};

export function bucketFor(tier: "public" | "restricted"): string {
  const b =
    tier === "restricted"
      ? process.env.R2_BUCKET_RESTRICTED
      : process.env.R2_BUCKET_PUBLIC;
  if (!b) throw new Error(`Bucket untuk tier ${tier} belum dikonfigurasi.`);
  return b;
}

/**
 * @param ttlOverride dipakai untuk segmen HLS (TTL sangat pendek, cukup untuk
 *        satu redirect + unduh segmen). Tidak pernah melebihi TTL() global.
 */
export async function presignGet(opts: {
  bucket: string;
  key: string;
  ttlSeconds?: number;
  downloadFilename?: string;
}): Promise<string> {
  const ttl = Math.min(opts.ttlSeconds ?? TTL(), TTL());
  const cmd = new GetObjectCommand({
    Bucket: opts.bucket,
    Key: opts.key,
    ...(opts.downloadFilename
      ? {
          ResponseContentDisposition: `attachment; filename="${opts.downloadFilename.replace(/"/g, "")}"`,
        }
      : {}),
  });
  return getSignedUrl(r2(), cmd, { expiresIn: ttl });
}

/** Ambil isi objek sebagai teks — dipakai untuk membaca manifest .m3u8 lalu menulis ulangnya. */
export async function getObjectText(
  bucket: string,
  key: string,
): Promise<string> {
  const res = await r2().send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );
  return res.Body!.transformToString();
}
