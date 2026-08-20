import crypto from 'crypto';
import type { Payload } from 'payload';

/**
 * SECURITY §7. IP mentah tidak pernah persisten.
 * Salt dirotasi harian oleh cron (infra/scripts/rotate-salt.sh), sehingga
 * hash yang sama tidak bisa dikorelasikan lintas hari — bahkan oleh kita.
 */
export function actorHash(ip: string, ua: string): string {
  const salt = process.env.AUDIT_HASH_SALT ?? '';
  if (!salt) throw new Error('AUDIT_HASH_SALT belum diset. Menolak menulis audit tanpa salt.');
  return crypto.createHash('sha256').update(`${ip}|${ua}|${salt}`).digest('hex');
}

type Ev = { eventType: string; targetType?: string; targetId?: string;
  actorUser?: string; ip?: string; ua?: string; metadata?: Record<string, unknown>;
  retentionClass?: 'short' | 'long' };

/** Pencatatan tidak boleh menggagalkan aksi pengguna (RULES V-10). */
export async function writeAudit(payload: Payload, ev: Ev): Promise<void> {
  try {
    await payload.create({
      collection: 'audit-logs',
      data: {
        occurredAt: new Date().toISOString(),
        eventType: ev.eventType,
        targetType: ev.targetType,
        targetId: ev.targetId,
        actorUser: ev.actorUser,
        actorHash: ev.ip ? actorHash(ev.ip, ev.ua ?? '') : undefined,
        metadata: ev.metadata ?? {},
        retentionClass: ev.retentionClass ?? 'short',
      },
    });
  } catch (err) {
    console.error('[audit] gagal menulis, aksi tetap dilanjutkan:', err);
  }
}
