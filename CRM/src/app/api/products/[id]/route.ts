import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["support", "manager", "admin"]);
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Product Detail GET error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch product" }, { status });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["manager", "admin"]);
    const { id } = await params;
    const body = await request.json();

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const {
      name,
      brand,
      description,
      notes,
      category,
      gender,
      concentration,
      size,
      price,
      image,
      stockLevel,
      minStockThreshold,
      featured,
    } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (brand !== undefined) updateData.brand = brand;
    if (description !== undefined) updateData.description = description;
    if (notes !== undefined) updateData.notes = notes;
    if (category !== undefined) updateData.category = category;
    if (gender !== undefined) updateData.gender = gender;
    if (concentration !== undefined) updateData.concentration = concentration;
    if (size !== undefined) updateData.size = size;
    if (price !== undefined) updateData.price = price;
    if (image !== undefined) updateData.image = image;
    if (stockLevel !== undefined) {
      updateData.stockLevel = stockLevel;
      updateData.inStock = stockLevel > 0;
    }
    if (minStockThreshold !== undefined) updateData.minStockThreshold = minStockThreshold;
    if (featured !== undefined) updateData.featured = featured;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    // 1. Sync updated product details and inventory to website
    const websiteUrl = process.env.WEBSITE_API_URL || "http://localhost:3000";
    const syncToken = process.env.CRM_SYNC_TOKEN || "secure-crm-sync-token-987654";

    try {
      const syncRes = await fetch(`${websiteUrl}/api/crm/product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Sync-Token": syncToken,
        },
        body: JSON.stringify(updatedProduct),
      });

      if (!syncRes.ok) {
        console.error(`Failed to sync product ${product.slug} to website. Status: ${syncRes.status}`);
      }
    } catch (syncErr) {
      console.error(`Network error syncing product ${product.slug} to website:`, syncErr);
    }

    // 2. Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        userName: user.name,
        action: "Update Product",
        details: `Updated product details/inventory for ${product.brand} ${product.name} (${product.slug}). Stock: ${updatedProduct.stockLevel}, Price: $${updatedProduct.price}.`,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
      },
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    console.error("Product Detail PUT error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["admin"]);
    const { id } = await params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if there are active order items linked
    const linkedOrderCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (linkedOrderCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete product. It has linked order history. Mark it out of stock instead." },
        { status: 400 }
      );
    }

    await prisma.product.delete({ where: { id } });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        userName: user.name,
        action: "Delete Product",
        details: `Deleted product record: ${product.brand} ${product.name} (${product.slug}).`,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
      },
    });

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Product Detail DELETE error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to delete product" }, { status });
  }
}
