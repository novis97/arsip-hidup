import type { Endpoint, PayloadRequest } from "payload";
import { writeAudit } from "../lib/audit";
import { rateLimit } from "../lib/rateLimit";

const ip = (req: PayloadRequest) =>
  req.headers.get("cf-connecting-ip") ??
  req.headers.get("x-forwarded-for") ??
  "unknown";

const ua = (req: PayloadRequest) => req.headers.get("user-agent") ?? "";

/** Mencatat telemetri pemutaran anonim dari situs statis. */
export const auditEndpoint: Endpoint = {
  path: "/audit",
  method: "post",
  handler: async (req) => {
    const requestIp = ip(req);

    if (!rateLimit(`audit:${requestIp}`, 60, 60_000)) {
      return Response.json(
        { error: "Terlalu banyak permintaan telemetri. Coba lagi sebentar." },
        { status: 429 },
      );
    }

    if (!req.json) {
      return Response.json(
        { error: "Body JSON tidak tersedia." },
        { status: 400 },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return Response.json(
        { error: "Body JSON tidak valid." },
        { status: 400 },
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json(
        { error: "Body JSON tidak valid." },
        { status: 400 },
      );
    }

    const { event_type, target_type, target_id, metadata } = body as Record<
      string,
      unknown
    >;

    if (event_type !== "video.play" && event_type !== "video.complete") {
      return Response.json(
        { error: "Jenis peristiwa telemetri tidak diizinkan." },
        { status: 400 },
      );
    }

    if (
      typeof target_type !== "string" ||
      typeof target_id !== "string" ||
      (metadata !== undefined &&
        (!metadata || typeof metadata !== "object" || Array.isArray(metadata)))
    ) {
      return Response.json(
        { error: "Data telemetri tidak valid." },
        { status: 400 },
      );
    }

    await writeAudit(req.payload, {
      eventType: event_type,
      targetType: target_type,
      targetId: target_id,
      ip: requestIp,
      ua: ua(req),
      metadata: metadata as Record<string, unknown> | undefined,
      retentionClass: "short",
    });

    return new Response(null, { status: 204 });
  },
};
