import { NextRequest } from "next/server";
import { getProductBySlug, getProducts } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
      return apiError("Product not found", 404);
    }

    const all = await getProducts({ category: product.category });
    const related = all
      .filter((p) => p.slug !== product.slug)
      .slice(0, 4);

    return apiSuccess({ product, related });
  } catch {
    return apiError("Failed to fetch product", 500);
  }
}
