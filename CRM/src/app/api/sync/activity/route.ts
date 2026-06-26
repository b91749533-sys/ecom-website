import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const syncToken = request.headers.get("X-Sync-Token");
    const expectedToken = process.env.CRM_SYNC_TOKEN || "secure-crm-sync-token-987654";

    if (!syncToken || syncToken !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized sync request" }, { status: 401 });
    }

    const body = await request.json();
    const { customerEmail, page, duration, device, browser } = body;

    if (!page) {
      return NextResponse.json({ error: "Missing page parameter" }, { status: 400 });
    }

    const activity = await prisma.browsingHistory.create({
      data: {
        customerEmail,
        page,
        duration: duration || 0,
        device,
        browser,
      },
    });

    return NextResponse.json({ success: true, activityId: activity.id });
  } catch (error) {
    console.error("Activity Sync API error:", error);
    return NextResponse.json({ error: "Failed to sync activity data" }, { status: 500 });
  }
}
