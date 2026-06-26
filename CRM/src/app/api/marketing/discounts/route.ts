import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireRole(["manager", "admin"]);
    const coupons = await prisma.discountCampaign.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    console.error("Discounts GET error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch discounts" }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["manager", "admin"]);
    const body = await request.json();
    const { code, type, value, expiration, active } = body;

    if (!code || !type || value === undefined || !expiration) {
      return NextResponse.json({ error: "Code, Type, Value, and Expiration Date are required" }, { status: 400 });
    }

    const existing = await prisma.discountCampaign.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
    }

    const coupon = await prisma.discountCampaign.create({
      data: {
        code: code.toUpperCase(),
        type,
        value: parseFloat(value),
        expiration: new Date(expiration),
        active: active !== undefined ? active : true,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        userName: user.name,
        action: "Create Discount Code",
        details: `Created coupon code "${coupon.code}" (${type}: ${value}). Expiring: ${expiration}.`,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    console.error("Discounts POST error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to create discount campaign" }, { status });
  }
}
