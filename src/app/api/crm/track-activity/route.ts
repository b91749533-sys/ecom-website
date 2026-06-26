import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { syncActivityToCRM } from "@/lib/crm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { page, duration, device, browser } = body;

    if (!page) {
      return NextResponse.json({ error: "Page is required" }, { status: 400 });
    }

    const user = await getAuthUser();
    const customerEmail = user?.email || null;

    const success = await syncActivityToCRM({
      customerEmail,
      page,
      duration: duration ? Math.round(duration) : 0,
      device: device || "Desktop",
      browser: browser || "Unknown",
    });

    return NextResponse.json({ success });
  } catch (error) {
    console.error("Track activity error:", error);
    return NextResponse.json({ error: "Failed to track activity" }, { status: 500 });
  }
}
