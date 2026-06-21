import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const gender = searchParams.get("gender") || "";
    const featured = searchParams.get("featured");
    const sort = searchParams.get("sort") || "featured";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const where: Record<string, unknown> = { inStock: true };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { brand: { contains: search } },
        { description: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    if (category) where.category = category;
    if (gender) where.gender = gender;
    if (featured === "true") where.featured = true;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice);
    }

    let orderBy: Record<string, string> = { featured: "desc" };
    switch (sort) {
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
      default:
        orderBy = { featured: "desc" };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [orderBy, { name: "asc" }],
    });

    const categories = await prisma.product.findMany({
      select: { category: true },
      distinct: ["category"],
    });

    const genders = await prisma.product.findMany({
      select: { gender: true },
      distinct: ["gender"],
    });

    return apiSuccess({
      products,
      filters: {
        categories: categories.map((c) => c.category),
        genders: genders.map((g) => g.gender),
      },
    });
  } catch {
    return apiError("Failed to fetch products", 500);
  }
}
