/**
 * Pengambilan data SAAT BUILD saja. Tidak pernah dipanggil dari browser.
 * Inilah yang membuat situs publik tidak punya kredensial dan tidak
 * bergantung pada VPS saat runtime (ARCHITECTURE §2.1).
 */
const API = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? "http://localhost:3000";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}/api${path}`, {
    headers: {
      Authorization: `users API-Key ${process.env.PAYLOAD_BUILD_KEY ?? ""}`,
    },
  });
  if (!res.ok) throw new Error(`Payload ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

/** Hanya item terbit, tidak ditarik, tidak dalam embargo. Difilter di sumber, bukan di template. */
export const getPublishedItems = () =>
  get<{ docs: any[] }>(
    "/archive-items?limit=500&depth=2" +
      "&where[_status][equals]=published" +
      "&where[withdrawalRequested][equals]=false",
  ).then((r) => r.docs);

export const getCollections = () =>
  get<{ docs: any[] }>("/collections?limit=100").then((r) => r.docs);

export const getStories = () =>
  get<{ docs: any[] }>(
    "/stories?limit=200&depth=1&where[_status][equals]=published",
  ).then((r) => r.docs);
