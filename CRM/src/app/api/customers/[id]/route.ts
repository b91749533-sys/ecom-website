import { NextRequest, NextResponse } from "next/server";
import { requireRole, requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Support, Manager, Admin can view a customer profile
    await requireRole(["support", "manager", "admin"]);
    const { id } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Fetch customer activity
    const browsingHistory = await prisma.browsingHistory.findMany({
      where: { customerEmail: customer.email },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Fetch customer cart
    const cart = await prisma.cart.findFirst({
      where: { customerEmail: customer.email },
    });

    return NextResponse.json({
      success: true,
      customer,
      browsingHistory,
      cart,
    });
  } catch (error: any) {
    console.error("Customer Detail GET error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch customer detail" }, { status });
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
    const { name, email, phone, address, city, state, zip, country, tags, notes, status: cStatus } = body;

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Role restriction check:
    // Support can ONLY update tags, notes.
    // Manager and Admin can update everything.
    let updateData: any = {};
    if (user.role === "support") {
      updateData = {
        tags: tags !== undefined ? tags : customer.tags,
        notes: notes !== undefined ? notes : customer.notes,
      };
    } else {
      updateData = {
        name: name || customer.name,
        email: email || customer.email,
        phone: phone !== undefined ? phone : customer.phone,
        address: address !== undefined ? address : customer.address,
        city: city !== undefined ? city : customer.city,
        state: state !== undefined ? state : customer.state,
        zip: zip !== undefined ? zip : customer.zip,
        country: country !== undefined ? country : customer.country,
        tags: tags !== undefined ? tags : customer.tags,
        notes: notes !== undefined ? notes : customer.notes,
        status: cStatus !== undefined ? cStatus : customer.status,
      };
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: updateData,
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        userName: user.name,
        action: "Update Customer",
        details: `Updated customer profile ${customer.email}. Fields updated: ${Object.keys(updateData).join(", ")}.`,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
      },
    });

    return NextResponse.json({ success: true, customer: updated });
  } catch (error: any) {
    console.error("Customer Detail PUT error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to update customer" }, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ONLY Admin can delete a customer
    const user = await requireRole(["admin"]);
    const { id } = await params;

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    await prisma.customer.delete({ where: { id } });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        userName: user.name,
        action: "Delete Customer",
        details: `Deleted customer record: ${customer.email} (${customer.name}).`,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
      },
    });

    return NextResponse.json({ success: true, message: "Customer deleted successfully" });
  } catch (error: any) {
    console.error("Customer Detail DELETE error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to delete customer" }, { status });
  }
}
