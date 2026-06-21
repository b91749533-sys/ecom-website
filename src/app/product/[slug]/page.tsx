import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/db";
import ProductDetail from "@/components/ProductDetail";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const all = await getProducts({ category: product.category });
  const related = all
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4);

  return <ProductDetail product={product} related={related} />;
}
