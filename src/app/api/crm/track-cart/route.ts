import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getOrCreateCart, calculateCartTotals } from "@/lib/cart";
import { syncCartToCRM } from "@/lib/crm";

export async function POST() {
  try {
    const user = await getAuthUser();
    const cart = await getOrCreateCart(user?.userId);
    
    // Check if the cart has items and calculate totals
    const items = cart.items.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      brand: item.product.brand,
      price: item.product.price,
      quantity: item.quantity,
    }));
    
    const totals = calculateCartTotals(cart.items);
    let sessionId: string = "cookie-session-fallback";
    if (cart) {
      if ("sessionId" in cart && typeof cart.sessionId === "string" && cart.sessionId) {
        sessionId = cart.sessionId;
      } else if ("id" in cart && typeof cart.id === "string") {
        sessionId = cart.id;
      }
    }
    const customerEmail = user?.email || null;

    const success = await syncCartToCRM({
      sessionId,
      customerEmail,
      items,
      value: totals.total,
      isCheckedOut: false,
    });

    return NextResponse.json({ success, sessionId });
  } catch (error) {
    console.error("Track cart error:", error);
    return NextResponse.json({ error: "Failed to track cart" }, { status: 500 });
  }
}
