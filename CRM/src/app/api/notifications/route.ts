import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    // Query recent audit logs representing system notifications
    // Actions of interest: "Order Synced", "Low Stock Alert", "Customer Synced", "User Login", "Low Stock Alert", etc.
    const notifications = await prisma.auditLog.findMany({
      where: {
        action: {
          in: ["Order Synced", "Customer Synced", "Low Stock Alert", "Configure Integration", "Send Recovery Email", "Update Order"],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    console.error("Notifications GET error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch notifications" }, { status });
  }
}
