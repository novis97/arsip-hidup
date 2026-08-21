import type { CollectionConfig } from "payload";
import { isAdmin, MFA_REQUIRED_ROLES } from "../access/roles";

/**
 * SECURITY §4. Titik masuk serangan British Library diyakini adalah server
 * akses jarak jauh TANPA MFA. Karena itu MFA di sini ditegakkan aplikasi,
 * bukan diimbau dalam SOP.
 */
export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    tokenExpiration: 60 * 60 * 12, // absolut 12 jam
    maxLoginAttempts: 5, // lockout 5 percobaan
    lockTime: 15 * 60 * 1000, // 15 menit
    useAPIKey: true, // dipakai proses build Astro (read-only)
    cookies: { sameSite: "Lax", secure: true },
    verify: true,
    forgotPassword: { expiration: 30 * 60 * 1000 },
  },
  admin: { useAsTitle: "email", group: "Sistem" },
  access: { create: isAdmin, read: isAdmin, update: isAdmin, delete: isAdmin },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "member",
      options: [
        "admin",
        "editor",
        "archivist",
        "reviewer",
        "researcher",
        "member",
      ],
    },
    {
      name: "mfaEnabled",
      type: "checkbox",
      defaultValue: false,
      admin: { readOnly: true },
    },
    { name: "mfaSecret", type: "text", hidden: true },
    {
      name: "institution",
      type: "text",
      admin: { condition: (d) => d.role === "researcher" },
    },
  ],
  hooks: {
    beforeLogin: [
      async ({ user }) => {
        if (MFA_REQUIRED_ROLES.includes(user.role) && !user.mfaEnabled) {
          // Ditolak, bukan diperingatkan. Tidak ada pengecualian "sementara" (RULES §1.4).
          throw new Error(
            "MFA wajib diaktifkan untuk peran ini sebelum dapat masuk.",
          );
        }
        return user;
      },
    ],
  },
};
