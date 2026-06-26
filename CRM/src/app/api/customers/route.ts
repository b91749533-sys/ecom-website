import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate (Support, Manager, Admin can view customers)
    const user = await requireRole(["support", "manager", "admin"]);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const segment = searchParams.get("segment") || "";
    const tag = searchParams.get("tag") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt"; // createdAt, totalSpent, orderCount, clv, name
    const sortOrder = searchParams.get("sortOrder") || "desc"; // asc, desc

    // 2. Build filters
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    if (segment) {
      where.status = segment;
    }

    if (tag) {
      where.tags = { contains: tag };
    }

    // 3. Query DB
    const customers = await prisma.customer.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return NextResponse.json({ success: true, customers });
  } catch (error: any) {
    console.error("Customers GET error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch customers" }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only Manager and Admin can create customers manually
    const user = await requireRole(["manager", "admin"]);
    const body = await request.json();
    const { email, name, phone, address, city, state, zip, country, tags, notes } = body;

    if (!email || !name) {
      return NextResponse.json({ error: "Email and Name are required" }, { status: 400 });
    }

    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Customer already exists with this email" }, { status: 400 });
    }

    const customer = await prisma.customer.create({
      data: {
        email,
        name,
        phone,
        address,
        city,
        state,
        zip,
        country: country || "US",
        tags: tags || "",
        notes: notes || "",
        status: "new",
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        userName: user.name,
        action: "Create Customer",
        details: `Manually created customer: ${email}.`,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
      },
    });

    return NextResponse.json({ success: true, customer });
  } catch (error: any) {
    console.error("Customers POST error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to create customer" }, { status });
  }
}
