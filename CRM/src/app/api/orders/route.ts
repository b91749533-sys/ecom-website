import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Authenticate (Support, Manager, Admin can view orders)
    await requireRole(["support", "manager", "admin"]);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const fulfillmentStatus = searchParams.get("fulfillmentStatus") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: any = {};

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (fulfillmentStatus) where.fulfillmentStatus = fulfillmentStatus;

    const orders = await prisma.order.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error("Orders GET error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch orders" }, { status });
  }
}
