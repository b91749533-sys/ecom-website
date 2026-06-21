"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { items, totals, loading, updateQuantity, removeItem } = useCart();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-muted">
        Loading cart...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-display font-light text-charcoal mb-4">
          Your Bag is Empty
        </h1>
        <p className="text-muted mb-8">Discover our curated fragrance collection.</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-charcoal text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-gold transition-colors"
        >
          Continue Shopping
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <h1 className="text-4xl font-display font-light text-charcoal mb-10">
        Shopping Bag
      </h1>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 lg:gap-6 bg-white border border-charcoal/5 p-4 lg:p-6"
            >
              <div className="relative w-24 h-32 lg:w-32 lg:h-40 bg-cream shrink-0">
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  fill
                  className="object-contain p-2"
                  sizes="128px"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs tracking-widest uppercase text-muted">
                    {item.product.brand}
                  </p>
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="font-display text-lg text-charcoal hover:text-gold transition-colors"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-muted mt-1">{item.product.size}</p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border border-charcoal/10">
                    <button
                      onClick={() =>
                        item.quantity > 1
                          ? updateQuantity(item.id, item.quantity - 1)
                          : removeItem(item.id)
                      }
                      className="p-2 hover:bg-cream"
                      aria-label="Decrease"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-cream"
                      aria-label="Increase"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="font-medium">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted hover:text-red-500 transition-colors"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-charcoal/5 p-6 lg:p-8 h-fit sticky top-28">
          <h2 className="font-display text-2xl text-charcoal mb-6">Order Summary</h2>

          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatPrice(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span>{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Tax (est.)</span>
              <span>{formatPrice(totals.tax)}</span>
            </div>
            <div className="border-t border-charcoal/10 pt-3 flex justify-between font-medium text-base">
              <span>Total</span>
              <span>{formatPrice(totals.total)}</span>
            </div>
          </div>

          {totals.subtotal < 150 && (
            <p className="text-xs text-muted mb-4">
              Add {formatPrice(150 - totals.subtotal)} more for free shipping
            </p>
          )}

          <Link
            href="/checkout"
            className="block w-full text-center bg-charcoal hover:bg-gold text-white py-4 text-sm tracking-widest uppercase transition-colors"
          >
            Proceed to Checkout
          </Link>

          <Link
            href="/shop"
            className="block text-center mt-4 text-sm text-muted hover:text-gold transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
