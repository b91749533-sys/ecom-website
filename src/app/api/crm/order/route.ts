import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const syncToken = request.headers.get("X-Sync-Token");
    const expectedToken = process.env.CRM_SYNC_TOKEN || "secure-crm-sync-token-987654";

    if (!syncToken || syncToken !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized sync call" }, { status: 401 });
    }

    const body = await request.json();
    const { orderNumber, status } = body;

    if (!orderNumber || !status) {
      return NextResponse.json({ error: "Missing required order sync fields" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found on website database" }, { status: 404 });
    }

    // Update storefront order status
    // Map CRM statuses like processing/shipped/refunded/cancelled to storefront status
    const updatedOrder = await prisma.order.update({
      where: { orderNumber },
      data: {
        status,
      },
    });

    return NextResponse.json({ success: true, orderId: updatedOrder.id });
  } catch (error) {
    console.error("CRM Order sync receiver error:", error);
    return NextResponse.json({ error: "Internal sync error" }, { status: 500 });
  }
}
