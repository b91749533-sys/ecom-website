import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { isDatabaseAvailable } from "./db";
import { getStaticProducts } from "@/data/products";
import { generateSessionId } from "./api";

export interface CartItemWithProduct {
  id: string;
  quantity: number;
  productId: string;
  product: {
    id: string;
    slug: string;
    name: string;
    brand: string;
    price: number;
    image: string;
    size: string;
    inStock: boolean;
  };
}

interface CookieCartItem {
  productId: string;
  quantity: number;
}

async function getCookieCart(): Promise<{ items: CartItemWithProduct[] }> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("cart_data")?.value;
  let cartItems: CookieCartItem[] = [];

  if (raw) {
    try {
      cartItems = JSON.parse(raw);
    } catch {
      cartItems = [];
    }
  }

  const products = getStaticProducts();
  const items = cartItems
    .map((item, index) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      return {
        id: `cookie-${index}`,
        quantity: item.quantity,
        productId: product.id,
        product: {
          id: product.id,
          slug: product.slug as string,
          name: product.name,
          brand: product.brand,
          price: product.price,
          image: product.image,
          size: product.size,
          inStock: product.inStock,
        },
      };
    })
    .filter((item) => item !== null) as CartItemWithProduct[];

  return { items };
}

async function setCookieCart(items: CookieCartItem[]) {
  const cookieStore = await cookies();
  cookieStore.set("cart_data", JSON.stringify(items), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function getOrCreateCart(userId?: string) {
  if (!(await isDatabaseAvailable())) {
    return getCookieCart();
  }

  if (userId) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: { product: true },
            orderBy: { createdAt: "asc" },
          },
        },
      });
    }

    return cart;
  }

  const cookieStore = await cookies();
  let sessionId = cookieStore.get("cart_session")?.value;

  if (!sessionId) {
    sessionId = generateSessionId();
    cookieStore.set("cart_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  let cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: {
      items: {
        include: { product: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { sessionId },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  return cart;
}

export async function addToCartCookie(productId: string, quantity: number) {
  const cart = await getCookieCart();
  const items: CookieCartItem[] = cart.items.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
  }));

  const existing = items.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, 10);
  } else {
    items.push({ productId, quantity });
  }

  await setCookieCart(items);
}

export async function updateCartCookie(productId: string, quantity: number) {
  const cart = await getCookieCart();
  let items: CookieCartItem[] = cart.items.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
  }));

  if (quantity <= 0) {
    items = items.filter((i) => i.productId !== productId);
  } else {
    const existing = items.find((i) => i.productId === productId);
    if (existing) existing.quantity = quantity;
  }

  await setCookieCart(items);
}

export async function clearCookieCart() {
  await setCookieCart([]);
}

export function calculateCartTotals(
  items: { quantity: number; product: { price: number } }[]
) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal >= 150 ? 0 : 12;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}
