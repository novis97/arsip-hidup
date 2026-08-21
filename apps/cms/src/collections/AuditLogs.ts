import type { CollectionConfig } from "payload";
import { isAdmin, denyAll } from "../access/roles";

/**
 * SCHEMA §15 + SECURITY §7.
 * IP MENTAH TIDAK PERNAH DISIMPAN. Yang disimpan adalah hash ber-salt harian,
 * sehingga korelasi lintas hari tidak mungkin dilakukan bahkan oleh kita sendiri.
 */
export const AuditLogs: CollectionConfig = {
  slug: "audit-logs",
  admin: {
    useAsTitle: "eventType",
    group: "Sistem",
    defaultColumns: ["occurredAt", "eventType", "targetId"],
  },
  access: {
    read: isAdmin,
    create: () => true,
    update: denyAll,
    delete: denyAll,
  }, // append-only
  fields: [
    {
      name: "occurredAt",
      type: "date",
      required: true,
      index: true,
      defaultValue: () => new Date().toISOString(),
    },
    { name: "actorUser", type: "relationship", relationTo: "users" },
    {
      name: "actorHash",
      type: "text",
      admin: {
        description: "sha256(ip + user-agent + salt harian). Bukan IP.",
      },
    },
    {
      name: "eventType",
      type: "select",
      required: true,
      index: true,
      options: [
        "video.play",
        "video.complete",
        "asset.signed_url_issued",
        "asset.download",
        "access_request.submitted",
        "access_grant.approved",
        "access_grant.revoked",
        "login.success",
        "login.failed",
        "content.published",
        "content.unpublished",
        "narasumber.withdrawal",
      ],
    },
    { name: "targetType", type: "text" },
    { name: "targetId", type: "text" },
    { name: "metadata", type: "json" },
    {
      name: "retentionClass",
      type: "select",
      required: true,
      defaultValue: "short",
      options: [
        { label: "short — 90 hari (telemetri perilaku)", value: "short" },
        { label: "long — 7 tahun (keputusan tata kelola)", value: "long" },
      ],
      admin: {
        description:
          "Menyimpan semuanya selamanya menciptakan liability yang tidak dibutuhkan.",
      },
    },
  ],
};
