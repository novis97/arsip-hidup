/**
 * Pembatas laju in-memory.
 *
 * Keterbatasan yang harus diketahui, bukan disembunyikan: state ini per-proses.
 * Aman selama CMS berjalan sebagai SATU instance — dan itu memang arsitektur
 * kita (ARCHITECTURE §2). Kalau suatu saat di-scale horizontal, pembatas ini
 * berhenti akurat dan harus dipindah ke Redis atau Cloudflare Rate Limiting.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}

// Bersihkan bucket kedaluwarsa agar Map tidak tumbuh tanpa batas.
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
}, 60_000).unref?.();
