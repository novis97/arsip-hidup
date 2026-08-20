import type { Payload } from 'payload';

/**
 * Rantai otorisasi tunggal untuk seluruh akses media.
 * Diekstrak agar tiga endpoint (playback, manifest, segment/download) memakai
 * pemeriksaan yang PERSIS sama — otorisasi yang disalin-tempel akan menyimpang.
 *
 * Urutan sengaja: yang paling menentukan dan paling murah diperiksa lebih dulu.
 */

export type AuthzResult =
  | { ok: true; asset: any; item: any; grantId: string }
  | { ok: false; status: number; error: string; next?: string };

export async function authorizeAsset(
  payload: Payload,
  assetId: string,
  user: { id: string | number; role?: string } | null,
): Promise<AuthzResult> {
  if (!user) {
    return { ok: false, status: 401, error: 'Perlu masuk sebagai peneliti terdaftar.', next: '/masuk' };
  }

  const asset: any = await payload.findByID({ collection: 'assets', id: assetId, depth: 2 }).catch(() => null);
  if (!asset) return { ok: false, status: 404, error: 'Aset tidak ditemukan.' };

  // RULES V-13 — master tidak pernah dilayani lewat HTTP, untuk siapa pun,
  // termasuk admin. Yang butuh master mengambilnya dari penyimpanan pelestarian.
  if (asset.isOriginalMaster) {
    return { ok: false, status: 403, error: 'Master file tidak dilayani melalui web.' };
  }

  const item: any = asset.archiveItem;

  // RULES E-3 — penarikan izin narasumber mengalahkan grant yang sudah terbit.
  // Diperiksa SEBELUM grant, karena tidak ada persetujuan apa pun yang membatalkannya.
  if (item?.withdrawalRequested) {
    return { ok: false, status: 403, error: 'Narasumber menarik izin publikasi materi ini.' };
  }

  // RULES E-5 — embargo dihormati mutlak.
  if (item?.embargoUntil && new Date(item.embargoUntil) > new Date()) {
    return {
      ok: false, status: 403,
      error: `Materi masih dalam masa embargo hingga ${new Date(item.embargoUntil).toLocaleDateString('id-ID')}.`,
    };
  }

  if (asset.tier === 'public') {
    return { ok: true, asset, item, grantId: 'public' };
  }

  const grants = await payload.find({
    collection: 'access-grants',
    depth: 0,
    where: {
      and: [
        { user: { equals: user.id } },
        { expiresAt: { greater_than: new Date().toISOString() } },
        { revokedAt: { exists: false } },
      ],
    },
  });

  const grant = grants.docs.find((g: any) =>
    (g.scopeType === 'asset' && g.scopeId === String(assetId)) ||
    (g.scopeType === 'item' && g.scopeId === String(item?.id)) ||
    (g.scopeType === 'collection' && g.scopeId === String(item?.collection?.id ?? item?.collection)));

  if (!grant) {
    // Pesan buntu selalu diberi jalan keluar (DESIGN §5.2).
    return {
      ok: false, status: 403,
      error: 'Belum ada persetujuan akses untuk materi ini.',
      next: '/terlibat/akses-arsip',
    };
  }

  if ((grant as any).maxDownloads && (grant as any).downloadCount >= (grant as any).maxDownloads) {
    return {
      ok: false, status: 429,
      error: 'Kuota unduhan untuk persetujuan akses ini sudah habis. Hubungi tim arsip.',
      next: '/kontak',
    };
  }

  return { ok: true, asset, item, grantId: String(grant.id) };
}
