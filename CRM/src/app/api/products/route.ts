import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Authenticate (Support, Manager, Admin can view product catalog)
    await requireRole(["support", "manager", "admin"]);

    const products = await prisma.product.findMany({
      include: {
        orderItems: {
          include: {
            order: true,
          },
        },
      },
    });

    // Compute performance stats for each product
    const productsWithStats = products.map((p) => {
      // Filter out items belonging to cancelled or refunded orders if we want to be exact,
      // or count all. Let's filter to active orders (excluding refunded or cancelled ones).
      const activeItems = p.orderItems.filter(
        (item) => item.order.status !== "cancelled" && item.order.status !== "refunded"
      );

      const soldCount = activeItems.reduce((sum, item) => sum + item.quantity, 0);
      const revenue = activeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Omit loading full orderItems structure in response
      const { orderItems, ...productDetails } = p;

      return {
        ...productDetails,
        soldCount,
        revenue,
      };
    });

    return NextResponse.json({ success: true, products: productsWithStats });
  } catch (error: any) {
    console.error("Products GET error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only Manager and Admin can create products manually
    const user = await requireRole(["manager", "admin"]);
    const body = await request.json();
    const {
      slug,
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

    if (!slug || !name || !brand || price === undefined) {
      return NextResponse.json({ error: "Slug, Name, Brand, and Price are required" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Product already exists with this slug" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        slug,
        name,
        brand,
        description: description || "",
        notes: notes || "",
        category: category || "Uncategorized",
        gender: gender || "Unisex",
        concentration: concentration || "Eau de Parfum",
        size: size || "100ml",
        price,
        image: image || "/placeholder.jpg",
        stockLevel: stockLevel !== undefined ? stockLevel : 50,
        minStockThreshold: minStockThreshold !== undefined ? minStockThreshold : 10,
        featured: featured || false,
        inStock: (stockLevel !== undefined ? stockLevel : 50) > 0,
      },
    });

    // 1. Sync product to the main website
    const websiteUrl = process.env.WEBSITE_API_URL || "http://localhost:3000";
    const syncToken = process.env.CRM_SYNC_TOKEN || "secure-crm-sync-token-987654";

    try {
      await fetch(`${websiteUrl}/api/crm/product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Sync-Token": syncToken,
        },
        body: JSON.stringify(product),
      });
    } catch (syncErr) {
      console.error("Failed to sync new product to website:", syncErr);
    }

    // 2. Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        userName: user.name,
        action: "Create Product",
        details: `Created product: ${brand} ${name} (${slug}) with stock level: ${product.stockLevel}.`,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Products POST error:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status });
  }
}
