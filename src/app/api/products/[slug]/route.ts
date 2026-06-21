import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug },
    });

    if (!product) {
      return apiError("Product not found", 404);
    }

    const related = await prisma.product.findMany({
      where: {
        category: product.category,
        id: { not: product.id },
        inStock: true,
      },
      take: 4,
    });

    return apiSuccess({ product, related });
  } catch {
    return apiError("Failed to fetch product", 500);
  }
}
