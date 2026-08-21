import type { CollectionConfig } from "payload";
import { isReviewer, isAdmin } from "../access/roles";

/** SCHEMA §13. Akses berbatas waktu dan dapat dicabut — yang tidak bisa diberikan YouTube. */
export const AccessGrants: CollectionConfig = {
  slug: "access-grants",
  admin: { group: "Akses", useAsTitle: "id" },
  access: {
    read: ({ req }) =>
      req.user?.role === "researcher"
        ? { user: { equals: req.user.id } }
        : isReviewer({ req } as any),
    create: isReviewer,
    update: isReviewer,
    delete: isAdmin,
  },
  fields: [
    {
      name: "accessRequest",
      type: "relationship",
      relationTo: "access-requests",
      required: true,
    },
    { name: "user", type: "relationship", relationTo: "users", required: true },
    {
      name: "scopeType",
      type: "select",
      required: true,
      options: ["collection", "item", "asset"],
    },
    { name: "scopeId", type: "text", required: true },
    {
      name: "grantedAt",
      type: "date",
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: "expiresAt",
      type: "date",
      required: true,
      defaultValue: () => new Date(Date.now() + 30 * 864e5).toISOString(),
      admin: {
        description:
          "Default 30 hari. Akses tanpa kedaluwarsa bukan akses terkendali.",
      },
    },
    { name: "revokedAt", type: "date" },
    { name: "revokeReason", type: "text" },
    { name: "maxDownloads", type: "number", defaultValue: 20 },
    {
      name: "downloadCount",
      type: "number",
      defaultValue: 0,
      admin: { readOnly: true },
    },
  ],
};
