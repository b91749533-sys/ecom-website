import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getOrCreateCart, calculateCartTotals } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api";
import { cartItemSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = cartItemSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message);
    }

    const { productId, quantity } = parsed.data;
    const user = await getAuthUser();
    const cart = await getOrCreateCart(user?.userId);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.inStock) {
      return apiError("Product not available", 404);
    }

    const existing = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: Math.min(existing.quantity + quantity, 10) },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    const updatedCart = await getOrCreateCart(user?.userId);
    const totals = calculateCartTotals(updatedCart.items);

    return apiSuccess({ message: "Added to cart", totals });
  } catch {
    return apiError("Failed to add to cart", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, quantity } = body;

    if (!itemId || !quantity || quantity < 1 || quantity > 10) {
      return apiError("Invalid quantity");
    }

    const user = await getAuthUser();
    const cart = await getOrCreateCart(user?.userId);

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) return apiError("Item not found", 404);

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    const updatedCart = await getOrCreateCart(user?.userId);
    const totals = calculateCartTotals(updatedCart.items);

    return apiSuccess({ totals });
  } catch {
    return apiError("Failed to update cart", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) return apiError("Item ID required");

    const user = await getAuthUser();
    const cart = await getOrCreateCart(user?.userId);

    await prisma.cartItem.deleteMany({
      where: { id: itemId, cartId: cart.id },
    });

    const updatedCart = await getOrCreateCart(user?.userId);
    const totals = calculateCartTotals(updatedCart.items);

    return apiSuccess({ totals });
  } catch {
    return apiError("Failed to remove item", 500);
  }
}
