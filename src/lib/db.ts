import { PrismaClient } from "@prisma/client";
import { getStaticProducts } from "@/data/products";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  dbAvailable: boolean | undefined;
};

export async function isDatabaseAvailable(): Promise<boolean> {
  if (globalForPrisma.dbAvailable !== undefined) {
    return globalForPrisma.dbAvailable;
  }

  try {
    const prisma = getPrisma();
    await prisma.$queryRaw`SELECT 1`;
    globalForPrisma.dbAvailable = true;
    return true;
  } catch {
    globalForPrisma.dbAvailable = false;
    return false;
  }
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}

export const prisma = getPrisma();

export async function getProducts(filters?: {
  search?: string;
  category?: string;
  gender?: string;
  featured?: boolean;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  if (await isDatabaseAvailable()) {
    const where: Record<string, unknown> = { inStock: true };
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { brand: { contains: filters.search } },
        { description: { contains: filters.search } },
        { notes: { contains: filters.search } },
      ];
    }
    if (filters?.category) where.category = filters.category;
    if (filters?.gender) where.gender = filters.gender;
    if (filters?.featured) where.featured = true;
    if (filters?.minPrice || filters?.maxPrice) {
      where.price = {};
      if (filters.minPrice) (where.price as Record<string, number>).gte = filters.minPrice;
      if (filters.maxPrice) (where.price as Record<string, number>).lte = filters.maxPrice;
    }

    let orderBy: Record<string, string> = { featured: "desc" };
    switch (filters?.sort) {
      case "price-asc":
        orderBy = { price: "asc" };
        break;
      case "price-desc":
        orderBy = { price: "desc" };
        break;
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
    }

    return prisma.product.findMany({
      where,
      orderBy: [orderBy, { name: "asc" }],
    });
  }

  let items = getStaticProducts();
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.notes.toLowerCase().includes(q)
    );
  }
  if (filters?.category) items = items.filter((p) => p.category === filters.category);
  if (filters?.gender) items = items.filter((p) => p.gender === filters.gender);
  if (filters?.featured) items = items.filter((p) => p.featured);
  if (filters?.minPrice) items = items.filter((p) => p.price >= filters.minPrice!);
  if (filters?.maxPrice) items = items.filter((p) => p.price <= filters.maxPrice!);

  switch (filters?.sort) {
    case "price-asc":
      items = [...items].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      items = [...items].sort((a, b) => b.price - a.price);
      break;
    case "rating":
      items = [...items].sort((a, b) => b.rating - a.rating);
      break;
    case "name":
      items = [...items].sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      items = [...items].sort((a, b) => Number(b.featured) - Number(a.featured));
  }

  return items;
}

export async function getProductBySlug(slug: string) {
  if (await isDatabaseAvailable()) {
    return prisma.product.findUnique({ where: { slug } });
  }
  const { getStaticProductBySlug } = await import("@/data/products");
  return getStaticProductBySlug(slug);
}
