"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  size: string;
  category: string;
  rating: number;
  reviewCount: number;
  featured?: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await addToCart(product.id);
    } catch {
      /* ignore */
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <article className="bg-white rounded-sm overflow-hidden border border-charcoal/5 hover:border-gold/30 hover:shadow-lg transition-all duration-300">
        <div className="relative aspect-[3/4] bg-cream overflow-hidden">
          <Image
            src={product.image}
            alt={`${product.brand} ${product.name}`}
            fill
            className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {product.featured && (
            <span className="absolute top-3 left-3 bg-gold text-white text-xs tracking-widest uppercase px-3 py-1">
              Featured
            </span>
          )}
          <button
            onClick={handleAdd}
            disabled={adding}
            className="absolute bottom-3 right-3 w-10 h-10 bg-charcoal text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gold disabled:opacity-50"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 lg:p-5">
          <p className="text-xs tracking-widest uppercase text-muted mb-1">
            {product.brand}
          </p>
          <h3 className="font-display text-lg text-charcoal group-hover:text-gold transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-muted mt-1">{product.size}</p>

          <div className="flex items-center gap-1 mt-2">
            <Star className="w-3.5 h-3.5 fill-gold text-gold" />
            <span className="text-sm text-charcoal">{product.rating}</span>
            <span className="text-xs text-muted">({product.reviewCount})</span>
          </div>

          <p className="mt-3 text-lg font-medium text-charcoal">
            {formatPrice(product.price)}
          </p>
        </div>
      </article>
    </Link>
  );
}
