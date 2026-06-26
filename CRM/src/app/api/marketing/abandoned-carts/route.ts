import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireRole(["manager", "admin"]);

    // An abandoned cart has isCheckedOut = false, and lastActive > 15 mins ago
    const abandonedThreshold = new Date(Date.now() - 15 * 60 * 1000);

    const carts = await prisma.cart.findMany({
      where: {
        isCheckedOut: false,
        lastActive: { lt: abandonedThreshold },
      },
      orderBy: { lastActive: "desc" },
    });

    return NextResponse.json({ success: true, carts });
  } catch (error: any) {
    console.error("Abandoned Carts GET error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch abandoned carts" }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["manager", "admin"]);
    const body = await request.json();
    const { cartId } = body;

    if (!cartId) {
      return NextResponse.json({ error: "cartId is required" }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
    });

    if (!cart) {
      return NextResponse.json({ error: "Cart session not found" }, { status: 404 });
    }

    if (cart.isCheckedOut) {
      return NextResponse.json({ error: "Cart has already been checked out" }, { status: 400 });
    }

    // Update emailSent flag
    const updatedCart = await prisma.cart.update({
      where: { id: cartId },
      data: { emailSent: true },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        userName: user.name,
        action: "Send Recovery Email",
        details: `Triggered abandoned cart recovery email to ${cart.customerEmail || "Guest"} for cart session: ${cart.sessionId} ($${cart.value}).`,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
      },
    });

    return NextResponse.json({ success: true, cart: updatedCart });
  } catch (error: any) {
    console.error("Abandoned Carts POST error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to send recovery email" }, { status });
  }
}
