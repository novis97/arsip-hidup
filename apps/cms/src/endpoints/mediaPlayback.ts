import type { Endpoint, PayloadRequest } from 'payload';
import { authorizeAsset } from '../lib/authorizeAsset';
import { mintPlaybackToken, verifyPlaybackToken } from '../lib/playbackToken';
import { presignGet, getObjectText, bucketFor, TTL } from '../lib/r2';
import { rewriteManifest, safeSegmentKey } from '../lib/hls';
import { rateLimit } from '../lib/rateLimit';
import { writeAudit } from '../lib/audit';

/**
 * VIDEO_EMBED §5 — satu-satunya jalur menuju materi tier TERBATAS.
 *
 * Empat endpoint, satu rantai otorisasi (authorizeAsset):
 *   GET /api/media/:assetId/playback        -> terbitkan sesi + URL manifest
 *   GET /api/media/:assetId/manifest.m3u8   -> manifest yang ditulis ulang
 *   GET /api/media/:assetId/segment         -> 302 ke presigned R2 (TTL 60s)
 *   GET /api/media/:assetId/download        -> presigned unduhan + hitung kuota
 *
 * Yang dibeli sistem ini adalah AKUNTABILITAS dan PENCABUTAN, bukan
 * kemustahilan penyalinan. Siapa pun yang punya akses sah bisa merekam layar.
 * Nyatakan ini ke pemangku kepentingan; jangan menjual DRM yang tidak ada.
 */

const ip = (req: PayloadRequest) =>
  req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for') ?? 'unknown';
const ua = (req: PayloadRequest) => req.headers.get('user-agent') ?? '';
const baseUrl = () => process.env.PAYLOAD_PUBLIC_SERVER_URL ?? '';

const deny = (r: { status: number; error: string; next?: string }) =>
  Response.json({ error: r.error, next: r.next }, { status: r.status });

/** 1 — Mulai sesi pemutaran. */
export const mediaPlayback: Endpoint = {
  path: '/media/:assetId/playback',
  method: 'get',
  handler: async (req) => {
    const { assetId } = req.routeParams as { assetId: string };

    if (!rateLimit(`playback:${req.user?.id ?? ip(req)}`, 30, 60_000)) {
      return Response.json({ error: 'Terlalu banyak permintaan. Coba lagi sebentar.' }, { status: 429 });
    }

    const authz = await authorizeAsset(req.payload, assetId, req.user as any);
    if (!authz.ok) return deny(authz);
    const { asset, item, grantId } = authz;

    const ttl = TTL();
    const token = mintPlaybackToken(
      { assetId, userId: String(req.user!.id), grantId },
      ttl,
    );

    await writeAudit(req.payload, {
      eventType: 'asset.signed_url_issued',
      targetType: 'asset', targetId: assetId,
      actorUser: String(req.user!.id),
      ip: ip(req), ua: ua(req),
      metadata: { grantId, tier: asset.tier, item: item?.slug },
      retentionClass: 'long',   // keputusan akses = catatan tata kelola, bukan telemetri
    });

    // Watermark forensik: ditempel di sisi klien sebagai overlay teks.
    // Bukan proteksi — ATRIBUSI. Transcoding per-pengguna di luar anggaran,
    // dan efek jera penyebaran ulang justru datang dari nama yang terlihat.
    return Response.json({
      manifest: asset.hlsManifestKey
        ? `${baseUrl()}/api/media/${assetId}/manifest.m3u8?t=${token}`
        : null,
      progressive: asset.hlsManifestKey ? null : `${baseUrl()}/api/media/${assetId}/download?t=${token}`,
      expires_in: ttl,
      refresh_at: ttl - 60,       // klien menyegarkan sebelum kedaluwarsa
      watermark: {
        text: `${(req.user as any).email} · ${new Date().toISOString().slice(0, 16)}`,
      },
      notice:
        'Akses ini tercatat dan berbatas waktu. Persetujuan akses bukan consent penelitian: ' +
        'consent harus diminta ulang secara independen kepada narasumber.',
    });
  },
};

/** 2 — Manifest HLS, ditulis ulang agar segmennya melewati kita. */
export const mediaManifest: Endpoint = {
  path: '/media/:assetId/manifest.m3u8',
  method: 'get',
  handler: async (req) => {
    const { assetId } = req.routeParams as { assetId: string };
    const url = new URL(req.url!, 'http://localhost');
    const token = url.searchParams.get('t') ?? '';
    const variant = url.searchParams.get('v');

    const claims = verifyPlaybackToken(token);
    if (!claims || claims.assetId !== assetId) {
      return Response.json({ error: 'Sesi pemutaran tidak sah atau sudah berakhir.' }, { status: 401 });
    }

    // Otorisasi diperiksa ULANG di sini, bukan dipercayakan pada token.
    // Inilah yang membuat pencabutan berlaku di tengah pemutaran: begitu grant
    // dicabut atau narasumber menarik izin, penyegaran berikutnya gagal.
    const authz = await authorizeAsset(req.payload, assetId, { id: claims.userId } as any);
    if (!authz.ok) return deny(authz);

    const bucket = bucketFor(authz.asset.tier);
    const key = variant
      ? safeSegmentKey(authz.asset.hlsManifestKey, variant)
      : authz.asset.hlsManifestKey;
    if (!key) return Response.json({ error: 'Path manifest tidak valid.' }, { status: 400 });

    const raw = await getObjectText(bucket, key);
    const rewritten = rewriteManifest(raw, { assetId, token, baseUrl: baseUrl() });

    return new Response(rewritten, {
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        // Manifest berisi token. Tidak boleh disinggahi cache mana pun.
        'Cache-Control': 'private, no-store, max-age=0',
      },
    });
  },
};

/** 3 — Segmen: validasi token, lalu 302 ke presigned R2 berumur sangat pendek. */
export const mediaSegment: Endpoint = {
  path: '/media/:assetId/segment',
  method: 'get',
  handler: async (req) => {
    const { assetId } = req.routeParams as { assetId: string };
    const url = new URL(req.url!, 'http://localhost');
    const token = url.searchParams.get('t') ?? '';
    const part = url.searchParams.get('p') ?? '';

    const claims = verifyPlaybackToken(token);
    if (!claims || claims.assetId !== assetId) {
      return Response.json({ error: 'Sesi pemutaran tidak sah atau sudah berakhir.' }, { status: 401 });
    }

    // Video 60 menit ≈ ratusan segmen. Batas longgar, tapi tetap ada —
    // tanpa ini satu token bisa dipakai memanen seluruh pustaka.
    if (!rateLimit(`seg:${claims.userId}:${assetId}`, 600, 60_000)) {
      return Response.json({ error: 'Laju permintaan segmen tidak wajar.' }, { status: 429 });
    }

    const asset: any = await req.payload.findByID({ collection: 'assets', id: assetId, depth: 0 }).catch(() => null);
    if (!asset) return Response.json({ error: 'Aset tidak ditemukan.' }, { status: 404 });

    const key = safeSegmentKey(asset.hlsManifestKey ?? '', part);
    if (!key) return Response.json({ error: 'Path segmen tidak valid.' }, { status: 400 });

    // TTL 60 detik: cukup untuk satu redirect + unduh segmen, tidak cukup untuk dibagikan.
    const signed = await presignGet({ bucket: bucketFor(asset.tier), key, ttlSeconds: 60 });

    // Redirect, bukan proxy. Byte video mengalir langsung dari R2 ke pengguna,
    // sehingga VPS 2 GB tidak pernah menjadi leher botol bandwidth.
    return new Response(null, {
      status: 302,
      headers: { Location: signed, 'Cache-Control': 'private, no-store' },
    });
    // Catatan sadar: segmen TIDAK dicatat di AuditLog. Satu baris per segmen
    // berarti ratusan tulis SQLite per pemutaran — mahal dan tidak menambah
    // informasi apa pun di atas `asset.signed_url_issued`.
  },
};

/** 4 — Unduhan berkas utuh (MP4 progresif, foto, dokumen). */
export const mediaDownload: Endpoint = {
  path: '/media/:assetId/download',
  method: 'get',
  handler: async (req) => {
    const { assetId } = req.routeParams as { assetId: string };

    const authz = await authorizeAsset(req.payload, assetId, req.user as any);
    if (!authz.ok) return deny(authz);
    const { asset, grantId } = authz;

    if (!rateLimit(`dl:${req.user!.id}`, 20, 3_600_000)) {
      return Response.json({ error: 'Batas unduhan per jam tercapai.' }, { status: 429 });
    }

    const signed = await presignGet({
      bucket: bucketFor(asset.tier),
      key: asset.filename ?? asset.storageKey,
      downloadFilename: asset.filename,
    });

    if (grantId !== 'public') {
      const g: any = await req.payload.findByID({ collection: 'access-grants', id: grantId });
      await req.payload.update({
        collection: 'access-grants', id: grantId,
        data: { downloadCount: (g.downloadCount ?? 0) + 1 },
      });
    }

    await writeAudit(req.payload, {
      eventType: 'asset.download',
      targetType: 'asset', targetId: assetId,
      actorUser: String(req.user!.id),
      ip: ip(req), ua: ua(req),
      metadata: { grantId, tier: asset.tier },
      retentionClass: 'long',
    });

    return Response.json({ url: signed, expires_in: TTL() });
  },
};

export const mediaEndpoints = [mediaPlayback, mediaManifest, mediaSegment, mediaDownload];
