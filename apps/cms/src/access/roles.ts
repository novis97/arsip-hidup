import type { Access, FieldAccess, Where } from "payload";

export type Role =
  "admin" | "editor" | "archivist" | "reviewer" | "researcher" | "member";

/** Peran yang WAJIB MFA (SECURITY §4, RULES §1.4). */
// KEPUTUSAN TERTULIS (22 Agustus 2026, Yusuf): "admin" dikecualikan
// sementara dari gerbang MFA karena alur TOTP belum dibangun —
// mfaSecret/mfaEnabled saat ini hanya field tanpa implementasi.
// Ini pelonggaran RULES 1.4 yang disengaja dan tercatat.
// SYARAT: VPS TIDAK BOLEH ONLINE sebelum T3.0 selesai.
// TODO(T3.0): bangun alur TOTP penuh, lalu kembalikan "admin" ke daftar ini.
export const MFA_REQUIRED_ROLES: Role[] = [
  "editor",
  "archivist",
  "reviewer",
];

const has = (req: any, ...roles: Role[]) =>
  !!req.user && roles.includes(req.user.role);

export const isAdmin: Access = ({ req }) => has(req, "admin");
export const isStaff: Access = ({ req }) =>
  has(req, "admin", "editor", "archivist");
export const isReviewer: Access = ({ req }) => has(req, "admin", "reviewer");
export const isAdminField: FieldAccess = ({ req }) => has(req, "admin");

/** Konten ber-draft hanya dapat dibaca publik setelah diterbitkan. */
export const publishedOnly: Access = ({ req }) => {
  if (has(req, "admin", "editor", "archivist")) return true;
  return { _status: { equals: "published" } };
};

/**
 * Arsip yang ditarik narasumber TIDAK PERNAH lolos untuk publik,
 * meski statusnya masih published (RULES E-3).
 */
export const publishedNotWithdrawn: Access = ({ req }) => {
  if (has(req, "admin", "editor", "archivist")) return true;
  const filter: Where = {
    and: [
      { _status: { equals: "published" } },
      { withdrawalRequested: { equals: false } },
    ],
  };
  return filter;
};

/** Transkrip publik hanya terbaca selama arsip induknya tetap diterbitkan. */
export const transcriptPubliclyReadable: Access = ({ req }) => {
  if (has(req, "admin", "editor", "archivist")) return true;
  const filter: Where = {
    and: [
      { visibility: { equals: "public" } },
      { "archiveItem._status": { equals: "published" } },
      { "archiveItem.withdrawalRequested": { equals: false } },
    ],
  };
  return filter;
};

/** Koleksi tanpa status draft memakai field visibilitasnya sendiri. */
export const publicReadable: Access = ({ req }) => {
  if (has(req, "admin", "editor", "archivist")) return true;
  return { visibility: { equals: "public" } };
};

export const denyAll: Access = () => false;
