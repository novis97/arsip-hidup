import { describe, it, expect, beforeAll } from 'vitest';
import { mintPlaybackToken, verifyPlaybackToken } from '../playbackToken';
import { rewriteManifest, safeSegmentKey } from '../hls';

beforeAll(() => { process.env.PAYLOAD_SECRET = 'uji-rahasia-yang-cukup-panjang-untuk-hmac'; });

describe('token pemutaran', () => {
  const claims = { assetId: 'a1', userId: 'u1', grantId: 'g1' };

  it('menerima token yang sah', () => {
    const t = mintPlaybackToken(claims, 300);
    expect(verifyPlaybackToken(t)?.assetId).toBe('a1');
  });

  it('menolak token yang dirusak', () => {
    const t = mintPlaybackToken(claims, 300);
    const [p] = t.split('.');
    expect(verifyPlaybackToken(`${p}.tandatanganpalsu`)).toBeNull();
  });

  it('menolak payload yang diubah walau tanda tangan lama disertakan', () => {
    const t = mintPlaybackToken(claims, 300);
    const [, sig] = t.split('.');
    const jahat = Buffer.from(JSON.stringify({ ...claims, assetId: 'aset-lain', exp: 9e9 })).toString('base64url');
    expect(verifyPlaybackToken(`${jahat}.${sig}`)).toBeNull();
  });

  it('menolak token kedaluwarsa', () => {
    const t = mintPlaybackToken(claims, 1);
    const decoded = JSON.parse(Buffer.from(t.split('.')[0], 'base64url').toString());
    decoded.exp = Math.floor(Date.now() / 1000) - 10;
    expect(verifyPlaybackToken(t.replace(/^[^.]+/, Buffer.from(JSON.stringify(decoded)).toString('base64url')))).toBeNull();
  });

  it('menolak TTL di atas 300 detik (RULES V-9)', () => {
    expect(() => mintPlaybackToken(claims, 3600)).toThrow(/RULES V-9/);
  });
});

describe('penulisan ulang manifest HLS', () => {
  const m = ['#EXTM3U', '#EXT-X-VERSION:3',
    '#EXT-X-KEY:METHOD=AES-128,URI="kunci.bin"',
    '#EXTINF:6.0,', 'seg-000.ts', '#EXTINF:6.0,', 'seg-001.ts', '#EXT-X-ENDLIST'].join('\n');

  it('mengalihkan segmen ke endpoint kita, bukan ke R2 langsung', () => {
    const out = rewriteManifest(m, { assetId: 'a1', token: 'tok', baseUrl: 'https://api.arsiphidup.id' });
    expect(out).toContain('/api/media/a1/segment?p=seg-000.ts&t=tok');
    expect(out).not.toMatch(/^seg-000\.ts$/m);
  });

  it('ikut mengalihkan URI kunci enkripsi', () => {
    const out = rewriteManifest(m, { assetId: 'a1', token: 'tok', baseUrl: 'https://api.arsiphidup.id' });
    expect(out).toMatch(/#EXT-X-KEY.*URI="https:\/\/api\.arsiphidup\.id\/api\/media\/a1\/segment/);
  });

  it('mempertahankan baris tag lain apa adanya', () => {
    const out = rewriteManifest(m, { assetId: 'a1', token: 'tok', baseUrl: 'https://x' });
    expect(out).toContain('#EXT-X-VERSION:3');
    expect(out).toContain('#EXT-X-ENDLIST');
  });
});

describe('safeSegmentKey — pencegahan path traversal', () => {
  const prefix = 'hls/a1/master.m3u8';
  it('menolak traversal', () => expect(safeSegmentKey(prefix, '../../rahasia.mp4')).toBeNull());
  it('menolak path absolut', () => expect(safeSegmentKey(prefix, '/etc/passwd')).toBeNull());
  it('menolak URI absolut', () => expect(safeSegmentKey(prefix, 'https://jahat.example/x.ts')).toBeNull());
  it('menerima segmen relatif biasa', () => expect(safeSegmentKey(prefix, 'seg-000.ts')).toBe('hls/a1/seg-000.ts'));
});
