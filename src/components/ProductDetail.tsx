"use client";

import { useState } from "react";
import ProductImage from "@/components/ProductImage";
import ProductCard, { Product } from "@/components/ProductCard";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Star, Minus, Plus, ShoppingBag, Check } from "lucide-react";

interface ProductDetailProps {
  product: {
    id: string;
    slug: string;
    name: string;
    brand: string;
    description: string;
    notes: string;
    category: string;
    gender: string;
    concentration: string;
    size: string;
    price: number;
    image: string;
    rating: number;
    reviewCount: number;
    inStock: boolean;
  };
  related: Product[];
}

export default function ProductDetail({ product, related }: ProductDetailProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    try {
      await addToCart(product.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      /* ignore */
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
        <div className="relative aspect-square bg-cream rounded-sm overflow-hidden">
          <ProductImage
            src={product.image}
            alt={`${product.brand} ${product.name}`}
            className="object-contain p-8 lg:p-12"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-gold tracking-[0.3em] uppercase text-sm mb-2">
            {product.brand}
          </p>
          <h1 className="text-4xl lg:text-5xl font-display font-light text-charcoal mb-4">
            {product.name}
          </h1>

          <div className="flex items-center gap-2 mb-6">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-gold text-gold" : "text-charcoal/20"}`}
                />
              ))}
            </div>
            <span className="text-sm text-muted">
              {product.rating} ({product.reviewCount} reviews)
            </span>
          </div>

          <p className="text-3xl font-medium text-charcoal mb-8">
            {formatPrice(product.price)}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <div>
              <span className="text-muted">Concentration</span>
              <p className="text-charcoal mt-1">{product.concentration}</p>
            </div>
            <div>
              <span className="text-muted">Size</span>
              <p className="text-charcoal mt-1">{product.size}</p>
            </div>
            <div>
              <span className="text-muted">Category</span>
              <p className="text-charcoal mt-1">{product.category}</p>
            </div>
            <div>
              <span className="text-muted">Gender</span>
              <p className="text-charcoal mt-1">{product.gender}</p>
            </div>
          </div>

          <p className="text-muted leading-relaxed mb-6">{product.description}</p>

          <div className="mb-8">
            <span className="text-xs tracking-widest uppercase text-muted">Fragrance Notes</span>
            <p className="text-charcoal mt-2">{product.notes}</p>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-charcoal/10">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-cream transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-3 text-sm font-medium min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                className="p-3 hover:bg-cream transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={adding || !product.inStock}
              className="flex-1 flex items-center justify-center gap-2 bg-charcoal hover:bg-gold text-white px-8 py-3.5 text-sm tracking-widest uppercase transition-colors disabled:opacity-50"
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  Added
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  {adding ? "Adding..." : "Add to Bag"}
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-muted">
            Free shipping on orders over $150 · Authenticity guaranteed · 30-day returns
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 lg:mt-28">
          <h2 className="text-3xl font-display font-light text-charcoal mb-8 text-center">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
