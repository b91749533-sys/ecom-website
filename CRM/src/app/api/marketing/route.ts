import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Only Manager and Admin can access marketing data
    await requireRole(["manager", "admin"]);

    // Calculate abandoned cart statistics
    // Cart is considered abandoned if not checked out and inactive for > 15 minutes
    const abandonedThreshold = new Date(Date.now() - 15 * 60 * 1000);

    const [campaignCount, couponCount, allCarts] = await Promise.all([
      prisma.emailCampaign.count(),
      prisma.discountCampaign.count(),
      prisma.cart.findMany({
        where: { isCheckedOut: false },
      }),
    ]);

    const abandonedCarts = allCarts.filter(
      (cart) => cart.lastActive.getTime() < abandonedThreshold.getTime()
    );

    const totalCount = abandonedCarts.length;
    const totalValue = abandonedCarts.reduce((sum, cart) => sum + cart.value, 0);
    const emailsSent = abandonedCarts.filter((cart) => cart.emailSent).length;

    // Simulate recovery statistics based on historical checkouts
    // (In a real app, we check carts that were flagged emailSent = true and subsequently checked out)
    const recoveredCartsCount = await prisma.cart.count({
      where: { isCheckedOut: true, emailSent: true },
    });

    const recoveryRate = emailsSent > 0 ? (recoveredCartsCount / emailsSent) * 100 : 12.5;

    return NextResponse.json({
      success: true,
      stats: {
        campaignCount,
        couponCount,
        abandonedCartCount: totalCount,
        abandonedCartValue: totalValue,
        recoveryEmailsSent: emailsSent,
        recoveryRate: parseFloat(recoveryRate.toFixed(1)),
      },
    });
  } catch (error: any) {
    console.error("Marketing GET error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch marketing data" }, { status });
  }
}
