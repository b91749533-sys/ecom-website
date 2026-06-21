import { getAuthUser } from "@/lib/auth";
import { getOrCreateCart, calculateCartTotals, clearCookieCart } from "@/lib/cart";
import { isDatabaseAvailable } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api";

export async function GET() {
  try {
    const user = await getAuthUser();
    const cart = await getOrCreateCart(user?.userId);
    const totals = calculateCartTotals(cart.items);

    return apiSuccess({
      items: cart.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          slug: item.product.slug,
          name: item.product.name,
          brand: item.product.brand,
          price: item.product.price,
          image: item.product.image,
          size: item.product.size,
          inStock: item.product.inStock,
        },
      })),
      totals,
    });
  } catch {
    return apiError("Failed to fetch cart", 500);
  }
}

export async function DELETE() {
  try {
    if (!(await isDatabaseAvailable())) {
      await clearCookieCart();
      return apiSuccess({ message: "Cart cleared" });
    }

    const user = await getAuthUser();
    const cart = await getOrCreateCart(user?.userId);

    if (!("id" in cart) || typeof cart.id !== "string") {
      return apiError("Cart error", 500);
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return apiSuccess({ message: "Cart cleared" });
  } catch {
    return apiError("Failed to clear cart", 500);
  }
}
