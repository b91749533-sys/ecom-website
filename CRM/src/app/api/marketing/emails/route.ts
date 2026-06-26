import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireRole(["manager", "admin"]);
    const campaigns = await prisma.emailCampaign.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, campaigns });
  } catch (error: any) {
    console.error("Email Campaigns GET error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch email campaigns" }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["manager", "admin"]);
    const body = await request.json();
    const { subject, content, segmentId, status } = body;

    if (!subject || !content || !segmentId) {
      return NextResponse.json({ error: "Subject, content, and target segment are required" }, { status: 400 });
    }

    // If campaign is marked as sent, generate simulated metrics
    const isSent = status === "sent";
    const sentAt = isSent ? new Date() : null;
    const openRate = isSent ? parseFloat((Math.random() * 30 + 15).toFixed(1)) : 0.0; // 15% - 45%
    const clickRate = isSent ? parseFloat((Math.random() * 10 + 2).toFixed(1)) : 0.0; // 2% - 12%
    const conversions = isSent ? Math.floor(Math.random() * 10) : 0;

    const campaign = await prisma.emailCampaign.create({
      data: {
        subject,
        content,
        segmentId,
        status: status || "draft",
        sentAt,
        openRate,
        clickRate,
        conversions,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        userName: user.name,
        action: isSent ? "Send Campaign" : "Create Campaign Draft",
        details: `${isSent ? "Sent" : "Created draft for"} email campaign "${subject}" targeting segment: ${segmentId}.`,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
      },
    });

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    console.error("Email Campaigns POST error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to create campaign" }, { status });
  }
}
