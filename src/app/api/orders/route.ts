import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getOrCreateCart, calculateCartTotals } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, generateOrderNumber } from "@/lib/api";
import { checkoutSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message);
    }

    const user = await getAuthUser();
    const cart = await getOrCreateCart(user?.userId);

    if (cart.items.length === 0) {
      return apiError("Cart is empty");
    }

    const totals = calculateCartTotals(cart.items);

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: user?.userId,
        email: parsed.data.email,
        name: parsed.data.name,
        address: parsed.data.address,
        city: parsed.data.city,
        state: parsed.data.state,
        zip: parsed.data.zip,
        country: parsed.data.country,
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
        status: "confirmed",
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            name: item.product.name,
            brand: item.product.brand,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.image,
          })),
        },
      },
      include: { items: true },
    });

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return apiSuccess({ order });
  } catch {
    return apiError("Checkout failed", 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber");

    if (orderNumber) {
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: { items: true },
      });

      if (!order) return apiError("Order not found", 404);
      if (user.role !== "admin" && order.userId !== user.userId) {
        return apiError("Forbidden", 403);
      }

      return apiSuccess({ order });
    }

    const where =
      user.role === "admin" ? {} : { userId: user.userId };

    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({ orders });
  } catch {
    return apiError("Failed to fetch orders", 500);
  }
}
