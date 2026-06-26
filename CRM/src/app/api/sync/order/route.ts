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
    const {
      orderNumber,
      email,
      name,
      address,
      city,
      state,
      zip,
      country,
      status,
      subtotal,
      shipping,
      tax,
      total,
      items,
    } = body;

    if (!orderNumber || !email || !name || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Missing required order sync data" }, { status: 400 });
    }

    // 1. Find or create Customer
    let customer = await prisma.customer.findUnique({
      where: { email },
    });

    const now = new Date();

    if (customer) {
      // Update existing customer stats
      customer = await prisma.customer.update({
        where: { email },
        data: {
          name,
          address: address || customer.address,
          city: city || customer.city,
          state: state || customer.state,
          zip: zip || customer.zip,
          country: country || customer.country,
          totalSpent: { increment: total },
          clv: { increment: total },
          orderCount: { increment: 1 },
          lastPurchaseAt: now,
          status: customer.status === "new" ? "active" : customer.status, // update from new to active
        },
      });
    } else {
      // Create new customer
      customer = await prisma.customer.create({
        data: {
          email,
          name,
          address,
          city,
          state,
          zip,
          country: country || "US",
          totalSpent: total,
          clv: total,
          orderCount: 1,
          lastPurchaseAt: now,
          status: "active",
          tags: "New Customer",
          notes: "Created automatically on first purchase sync.",
        },
      });
    }

    // 2. Map order status
    // E-commerce statuses: confirmed, pending -> CRM statuses: processing, pending
    const crmStatus = status === "confirmed" ? "processing" : "pending";
    const paymentStatus = "paid"; // E-commerce successful checkout is paid

    // 3. Resolve products and construct order items
    const orderItemsToCreate = [];
    const resolvedProductsWithQuantity = [];

    for (const item of items) {
      let dbProduct = await prisma.product.findFirst({
        where: {
          OR: [
            { id: item.productId },
            { 
              name: { equals: item.name },
              brand: { equals: item.brand }
            }
          ]
        }
      });
      
      if (!dbProduct) {
        // Fallback search by slug-like comparison
        const potentialSlug = item.name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        dbProduct = await prisma.product.findFirst({
          where: {
            OR: [
              { slug: potentialSlug },
              { slug: { contains: potentialSlug } }
            ]
          }
        });
      }

      if (!dbProduct) {
        console.error(`Product not found in CRM catalog: ${item.name} (${item.brand})`);
        return NextResponse.json({ error: `Product not found in CRM catalog: ${item.name}` }, { status: 400 });
      }

      orderItemsToCreate.push({
        productId: dbProduct.id,
        name: item.name,
        brand: item.brand,
        price: item.price,
        quantity: item.quantity,
        image: item.image || "",
      });

      resolvedProductsWithQuantity.push({
        product: dbProduct,
        quantity: item.quantity,
      });
    }

    // 4. Create the Order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        email,
        name,
        address: address || "",
        city: city || "",
        state: state || "",
        zip: zip || "",
        country: country || "US",
        status: crmStatus,
        paymentStatus,
        fulfillmentStatus: "unfulfilled",
        subtotal,
        shipping,
        tax,
        total,
        items: {
          create: orderItemsToCreate,
        },
      },
      include: { items: true },
    });

    // 5. Update Product Stock Levels & Trigger Low Stock Logs
    for (const resolved of resolvedProductsWithQuantity) {
      const product = resolved.product;
      const quantity = resolved.quantity;
      const newStock = Math.max(0, product.stockLevel - quantity);
      
      await prisma.product.update({
        where: { id: product.id },
        data: {
          stockLevel: newStock,
          inStock: newStock > 0,
        },
      });

      // Check if low stock threshold is breached
      if (newStock <= product.minStockThreshold) {
        await prisma.auditLog.create({
          data: {
            userId: null,
            userName: "Inventory Guard",
            action: "Low Stock Alert",
            details: `Product "${product.name}" (${product.brand}) has fallen below minimum stock threshold. Current stock: ${newStock}.`,
            ipAddress: "127.0.0.1",
          },
        });
      }
    }

    // 5. Log audit action
    await prisma.auditLog.create({
      data: {
        userId: null,
        userName: "Sync Bridge",
        action: "Order Synced",
        details: `Order ${orderNumber} successfully synced for customer: ${email}. total: $${total}.`,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
      },
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Order Sync API error:", error);
    return NextResponse.json({ error: "Failed to sync order data" }, { status: 500 });
  }
}
