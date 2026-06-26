import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin"]);
    const staff = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, staff });
  } catch (error: any) {
    console.error("Staff settings GET error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch staff list" }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["admin"]);
    const body = await request.json();
    const { email, name, password, role } = body;

    if (!email || !name || !password || !role) {
      return NextResponse.json({ error: "Email, Name, Password, and Role are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Staff user already exists with this email" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newStaff = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        userName: user.name,
        action: "Create Staff",
        details: `Created new staff account: ${email} with role: ${role}.`,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
      },
    });

    return NextResponse.json({ success: true, staff: newStaff });
  } catch (error: any) {
    console.error("Staff settings POST error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to create staff user" }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireRole(["admin"]);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Staff ID is required" }, { status: 400 });
    }

    if (id === user.userId) {
      return NextResponse.json({ error: "You cannot delete your own admin account" }, { status: 400 });
    }

    const staff = await prisma.user.findUnique({ where: { id } });
    if (!staff) {
      return NextResponse.json({ error: "Staff user not found" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        userName: user.name,
        action: "Delete Staff",
        details: `Deleted staff account: ${staff.email} (${staff.name}, role: ${staff.role}).`,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
      },
    });

    return NextResponse.json({ success: true, message: "Staff user deleted successfully" });
  } catch (error: any) {
    console.error("Staff settings DELETE error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to delete staff user" }, { status });
  }
}
