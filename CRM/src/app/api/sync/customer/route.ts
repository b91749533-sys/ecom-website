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
    const { email, name, phone, address, city, state, zip, country } = body;

    if (!email || !name) {
      return NextResponse.json({ error: "Missing required customer sync data" }, { status: 400 });
    }

    const customer = await prisma.customer.upsert({
      where: { email },
      update: {
        name,
        phone: phone || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        zip: zip || undefined,
        country: country || undefined,
      },
      create: {
        email,
        name,
        phone,
        address,
        city,
        state,
        zip,
        country: country || "US",
        totalSpent: 0.0,
        clv: 0.0,
        orderCount: 0,
        status: "new",
        tags: "Registered User",
        notes: "Created via frontend account registration sync.",
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: null,
        userName: "Sync Bridge",
        action: "Customer Synced",
        details: `Customer profile updated/created for email: ${email}.`,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
      },
    });

    return NextResponse.json({ success: true, customerId: customer.id });
  } catch (error) {
    console.error("Customer Sync API error:", error);
    return NextResponse.json({ error: "Failed to sync customer data" }, { status: 500 });
  }
}
