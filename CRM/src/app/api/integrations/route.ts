import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Only Admin can configure/view integrations
    await requireRole(["admin"]);

    const [integrations, webhooks, webhookLogs] = await Promise.all([
      prisma.integrationConfig.findMany(),
      prisma.webhookConfig.findMany(),
      prisma.webhookLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 15,
      }),
    ]);

    // Mask sensitive credential values in integrations response for security
    const maskedIntegrations = integrations.map((int) => {
      try {
        const creds = JSON.parse(int.credentials);
        const maskedCreds: Record<string, string> = {};
        for (const [key, value] of Object.entries(creds)) {
          if (typeof value === "string") {
            maskedCreds[key] = value.length > 8 ? `${value.substring(0, 6)}...` : "****";
          } else {
            maskedCreds[key] = "****";
          }
        }
        return {
          ...int,
          credentials: JSON.stringify(maskedCreds),
        };
      } catch {
        return {
          ...int,
          credentials: "{}",
        };
      }
    });

    return NextResponse.json({
      success: true,
      integrations: maskedIntegrations,
      webhooks,
      webhookLogs,
    });
  } catch (error: any) {
    console.error("Integrations GET error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch integrations" }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["admin"]);
    const body = await request.json();
    const { action } = body; // toggleIntegration, createWebhook, deleteWebhook

    if (action === "toggleIntegration") {
      const { provider, enabled, credentials } = body;
      if (!provider) {
        return NextResponse.json({ error: "Provider name is required" }, { status: 400 });
      }

      const existing = await prisma.integrationConfig.findUnique({
        where: { provider },
      });

      let updated;
      if (existing) {
        // Parse credentials if updated, otherwise keep old
        let finalCreds = existing.credentials;
        if (credentials) {
          const parsedOld = JSON.parse(existing.credentials);
          const parsedNew = JSON.parse(credentials);
          // Merge and don't overwrite if input is masked
          const merged: Record<string, string> = { ...parsedOld };
          for (const [k, v] of Object.entries(parsedNew)) {
            if (typeof v === "string" && !v.includes("...")) {
              merged[k] = v;
            }
          }
          finalCreds = JSON.stringify(merged);
        }

        updated = await prisma.integrationConfig.update({
          where: { provider },
          data: {
            enabled: enabled !== undefined ? enabled : existing.enabled,
            credentials: finalCreds,
          },
        });
      } else {
        updated = await prisma.integrationConfig.create({
          data: {
            provider,
            enabled: enabled || false,
            credentials: credentials || "{}",
          },
        });
      }

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          userName: user.name,
          action: "Configure Integration",
          details: `Updated integration config for: ${provider}. Enabled: ${updated.enabled}.`,
          ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
        },
      });

      return NextResponse.json({ success: true, integration: updated });
    }

    if (action === "createWebhook") {
      const { url, events, active } = body;
      if (!url || !events) {
        return NextResponse.json({ error: "Webhook URL and events list are required" }, { status: 400 });
      }

      const secret = `whsec_${Math.random().toString(36).substring(2, 15)}`;
      const webhook = await prisma.webhookConfig.create({
        data: {
          url,
          events: Array.isArray(events) ? events.join(",") : events,
          active: active !== undefined ? active : true,
          secret,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          userName: user.name,
          action: "Create Webhook",
          details: `Created new webhook registration targeting URL: ${url}. Events: ${webhook.events}.`,
          ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
        },
      });

      return NextResponse.json({ success: true, webhook });
    }

    if (action === "deleteWebhook") {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: "Webhook ID is required" }, { status: 400 });
      }

      const webhook = await prisma.webhookConfig.findUnique({ where: { id } });
      if (!webhook) {
        return NextResponse.json({ error: "Webhook registration not found" }, { status: 404 });
      }

      await prisma.webhookConfig.delete({ where: { id } });

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          userName: user.name,
          action: "Delete Webhook",
          details: `Deleted webhook registration for URL: ${webhook.url}.`,
          ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
        },
      });

      return NextResponse.json({ success: true, message: "Webhook deleted successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Integrations POST error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to save integrations settings" }, { status });
  }
}
