/**
 * Penulisan ulang manifest HLS.
 *
 * INI BAGIAN YANG SERING SALAH. Manifest .m3u8 hanyalah daftar teks; setiap
 * segmen adalah request HTTP terpisah. Mem-presign manifest saja TIDAK
 * mengamankan apa pun — segmennya tetap terbuka. Sebaliknya, mem-presign semua
 * segmen dengan TTL 300 detik akan mematikan video 60 menit di menit keenam.
 *
 * Solusinya: segmen diarahkan ke endpoint kita sendiri yang memvalidasi token
 * sesi lalu me-redirect ke presigned URL berumur sangat pendek. Byte-nya tetap
 * mengalir langsung dari R2 (kita hanya melayani redirect, bukan video), jadi
 * biaya bandwidth VPS tetap mendekati nol.
 */
export function rewriteManifest(
  manifest: string,
  opts: { assetId: string; token: string; baseUrl: string },
): string {
  const seg = (uri: string) =>
    `${opts.baseUrl}/api/media/${opts.assetId}/segment?p=${encodeURIComponent(uri)}&t=${opts.token}`;

  return manifest
    .split("\n")
    .map((line) => {
      const l = line.trim();
      if (!l) return line;

      // Kunci enkripsi dan map segment juga harus dialihkan, bukan hanya .ts/.m4s.
      if (l.startsWith("#EXT-X-KEY") || l.startsWith("#EXT-X-MAP")) {
        return l.replace(/URI="([^"]+)"/, (_m, uri) => `URI="${seg(uri)}"`);
      }
      if (l.startsWith("#")) return line;

      // Manifest bertingkat (master playlist) menunjuk ke .m3u8 varian —
      // dialihkan ke endpoint manifest agar ikut ditulis ulang secara rekursif.
      if (l.endsWith(".m3u8")) {
        return `${opts.baseUrl}/api/media/${opts.assetId}/manifest.m3u8?v=${encodeURIComponent(l)}&t=${opts.token}`;
      }
      return seg(l);
    })
    .join("\n");
}

/** Cegah path traversal pada parameter yang berasal dari manifest. */
export function safeSegmentKey(prefix: string, rawUri: string): string | null {
  if (/^https?:\/\//i.test(rawUri)) return null; // URI absolut tidak diterima
  if (rawUri.includes("..") || rawUri.startsWith("/")) return null;
  const key = `${prefix.replace(/\/[^/]*$/, "")}/${rawUri}`.replace(
    /\/+/g,
    "/",
  );
  return key.startsWith(prefix.split("/")[0]) ? key : null;
}
