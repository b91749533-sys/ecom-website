import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const syncToken = request.headers.get("X-Sync-Token");
    const expectedToken = process.env.CRM_SYNC_TOKEN || "secure-crm-sync-token-987654";

    if (!syncToken || syncToken !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized sync call" }, { status: 401 });
    }

    const productData = await request.json();
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
      featured,
    } = productData;

    if (!slug || !name || !brand || price === undefined) {
      return NextResponse.json({ error: "Missing required product data" }, { status: 400 });
    }

    const inStock = stockLevel !== undefined ? stockLevel > 0 : true;

    const product = await prisma.product.upsert({
      where: { slug },
      update: {
        name,
        brand,
        description: description || undefined,
        notes: notes || undefined,
        category: category || undefined,
        gender: gender || undefined,
        concentration: concentration || undefined,
        size: size || undefined,
        price: parseFloat(price),
        image: image || undefined,
        inStock,
        featured: featured !== undefined ? featured : undefined,
      },
      create: {
        slug,
        name,
        brand,
        description: description || "",
        notes: notes || "",
        category: category || "Uncategorized",
        gender: gender || "Unisex",
        concentration: concentration || "Eau de Parfum",
        size: size || "100ml",
        price: parseFloat(price),
        image: image || "/placeholder.jpg",
        inStock,
        featured: featured || false,
      },
    });

    return NextResponse.json({ success: true, productId: product.id });
  } catch (error) {
    console.error("CRM Product sync receiver error:", error);
    return NextResponse.json({ error: "Internal sync error" }, { status: 500 });
  }
}
