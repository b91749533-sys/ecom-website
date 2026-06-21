import { NextRequest } from "next/server";
import { getProducts } from "@/lib/db";
import { getStaticProducts } from "@/data/products";
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

    const products = await getProducts({
      search: search || undefined,
      category: category || undefined,
      gender: gender || undefined,
      featured: featured === "true" ? true : undefined,
      sort,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    });

    const allProducts = getStaticProducts();
    const categories = [...new Set(allProducts.map((p) => p.category))];
    const genders = [...new Set(allProducts.map((p) => p.gender))];

    return apiSuccess({
      products,
      filters: { categories, genders },
    });
  } catch {
    return apiError("Failed to fetch products", 500);
  }
}
