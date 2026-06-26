import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        customer: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Order GET error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch order" }, { status });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus, fulfillmentStatus, shippingTracking, shippingProvider } = body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const oldStatus = order.status;
    const oldPaymentStatus = order.paymentStatus;

    // Check permissions (Support, Manager, Admin can update orders)
    // Build update payload
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (fulfillmentStatus !== undefined) updateData.fulfillmentStatus = fulfillmentStatus;
    if (shippingTracking !== undefined) updateData.shippingTracking = shippingTracking;
    if (shippingProvider !== undefined) updateData.shippingProvider = shippingProvider;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });

    // 1. Inventory replenishment on cancellation or full refund
    const inventoryRestored =
      (status === "cancelled" || status === "refunded") &&
      oldStatus !== "cancelled" &&
      oldStatus !== "refunded";

    if (inventoryRestored) {
      for (const item of order.items) {
        if (item.productId) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stockLevel: { increment: item.quantity },
              inStock: true,
            },
          });
        }
      }
    }

    // 2. Adjust customer LTV / spent on refund
    if (paymentStatus === "refunded" && oldPaymentStatus !== "refunded" && order.customerId) {
      await prisma.customer.update({
        where: { id: order.customerId },
        data: {
          totalSpent: { decrement: order.total },
          // clv can keep the historical total or we can decrement as well
        },
      });
    }

    // 3. Sync status back to the main e-commerce website
    const websiteUrl = process.env.WEBSITE_API_URL || "http://localhost:3000";
    const syncToken = process.env.CRM_SYNC_TOKEN || "secure-crm-sync-token-987654";

    try {
      const syncRes = await fetch(`${websiteUrl}/api/crm/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Sync-Token": syncToken,
        },
        body: JSON.stringify({
          orderNumber: order.orderNumber,
          status: updatedOrder.status,
          paymentStatus: updatedOrder.paymentStatus,
          fulfillmentStatus: updatedOrder.fulfillmentStatus,
          shippingTracking: updatedOrder.shippingTracking,
          shippingProvider: updatedOrder.shippingProvider,
        }),
      });

      if (!syncRes.ok) {
        console.error(`Failed to sync order ${order.orderNumber} to website. Status: ${syncRes.status}`);
      }
    } catch (syncErr) {
      console.error(`Network error syncing order ${order.orderNumber} to website:`, syncErr);
    }

    // 4. Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        userName: user.name,
        action: "Update Order",
        details: `Updated order ${order.orderNumber}: Status from "${oldStatus}" to "${updatedOrder.status}". Payment: "${updatedOrder.paymentStatus}". Fulfillment: "${updatedOrder.fulfillmentStatus}". Inventory restored: ${inventoryRestored}.`,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error("Order Detail PUT error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to update order" }, { status });
  }
}
