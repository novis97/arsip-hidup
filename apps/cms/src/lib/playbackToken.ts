import crypto from 'crypto';

/**
 * Token sesi pemutaran — HMAC-SHA256, stateless, berumur pendek.
 *
 * Kenapa stateless dan bukan tabel sesi: menambah tabel berarti menambah tulis
 * ke SQLite pada setiap segmen video. Konsekuensinya harus dinyatakan terus terang —
 * token yang sudah terbit tidak bisa dicabut seketika. Pencabutan berlaku pada
 * penyegaran berikutnya, jadi jendela paparan maksimum = TTL (300 detik).
 * Untuk arsip budaya, jendela 5 menit adalah trade-off yang wajar; kalau suatu
 * saat tidak wajar lagi, ganti dengan tabel sesi dan cek per segmen.
 */

export interface PlaybackClaims {
  assetId: string;
  userId: string;
  grantId: string;
  exp: number;   // epoch detik
}

const b64u = (b: Buffer) => b.toString('base64url');

function sign(payload: string): string {
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) throw new Error('PAYLOAD_SECRET belum diset. Menolak menerbitkan token pemutaran.');
  return b64u(crypto.createHmac('sha256', secret).update(payload).digest());
}

export function mintPlaybackToken(claims: Omit<PlaybackClaims, 'exp'>, ttlSeconds: number): string {
  if (ttlSeconds > 300) {
    // RULES V-9. Dijaga di sini juga, bukan hanya di endpoint, supaya tidak bisa
    // dilonggarkan diam-diam lewat pemanggil baru.
    throw new Error(`TTL token ${ttlSeconds}s melebihi batas 300s (RULES V-9).`);
  }
  const full: PlaybackClaims = { ...claims, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const payload = b64u(Buffer.from(JSON.stringify(full)));
  return `${payload}.${sign(payload)}`;
}

export function verifyPlaybackToken(token: string): PlaybackClaims | null {
  const [payload, sig] = (token ?? '').split('.');
  if (!payload || !sig) return null;

  const expected = sign(payload);
  // Perbandingan waktu-tetap. Perbandingan `===` di sini adalah timing oracle.
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString()) as PlaybackClaims;
    if (claims.exp < Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}
