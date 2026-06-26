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
    const { sessionId, customerEmail, items, value, isCheckedOut } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const cart = await prisma.cart.upsert({
      where: { sessionId },
      update: {
        customerEmail: customerEmail || undefined,
        items: typeof items === "string" ? items : JSON.stringify(items),
        value: value !== undefined ? value : 0.0,
        isCheckedOut: isCheckedOut !== undefined ? isCheckedOut : false,
        lastActive: new Date(),
      },
      create: {
        sessionId,
        customerEmail,
        items: typeof items === "string" ? items : JSON.stringify(items),
        value: value || 0.0,
        isCheckedOut: isCheckedOut || false,
        lastActive: new Date(),
      },
    });

    return NextResponse.json({ success: true, cartId: cart.id });
  } catch (error) {
    console.error("Cart Sync API error:", error);
    return NextResponse.json({ error: "Failed to sync cart data" }, { status: 500 });
  }
}
