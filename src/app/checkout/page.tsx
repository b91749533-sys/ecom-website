"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totals, loading, clearCart } = useCart();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: user?.email || "",
    name: user?.name || "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        return;
      }

      setOrderNumber(data.data.order.orderNumber);
      await clearCart();
    } catch {
      setError("Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-muted">Loading...</div>;
  }

  if (orderNumber) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <CheckCircle className="w-16 h-16 text-gold mx-auto mb-6" />
        <h1 className="text-4xl font-display font-light text-charcoal mb-4">
          Thank You
        </h1>
        <p className="text-muted mb-2">Your order has been confirmed.</p>
        <p className="text-charcoal font-medium mb-8">Order #{orderNumber}</p>
        <Link
          href="/shop"
          className="inline-block bg-charcoal text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-gold transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <h1 className="text-4xl font-display font-light text-charcoal mb-10">
        Checkout
      </h1>

      <div className="grid lg:grid-cols-2 gap-12">
        <form onSubmit={handleSubmit} className="space-y-5">
          <h2 className="font-display text-2xl text-charcoal mb-4">
            Shipping Details
          </h2>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 p-3 border border-red-100">
              {error}
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs tracking-widest uppercase text-muted mb-2">
                Full Name
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-charcoal/10 focus:border-gold focus:outline-none text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs tracking-widest uppercase text-muted mb-2">
                Email
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-charcoal/10 focus:border-gold focus:outline-none text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs tracking-widest uppercase text-muted mb-2">
                Address
              </label>
              <input
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-3 border border-charcoal/10 focus:border-gold focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-muted mb-2">
                City
              </label>
              <input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-4 py-3 border border-charcoal/10 focus:border-gold focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-muted mb-2">
                State
              </label>
              <input
                required
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full px-4 py-3 border border-charcoal/10 focus:border-gold focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-muted mb-2">
                ZIP Code
              </label>
              <input
                required
                value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })}
                className="w-full px-4 py-3 border border-charcoal/10 focus:border-gold focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-muted mb-2">
                Country
              </label>
              <input
                required
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full px-4 py-3 border border-charcoal/10 focus:border-gold focus:outline-none text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-charcoal hover:bg-gold text-white py-4 text-sm tracking-widest uppercase transition-colors disabled:opacity-50 mt-4"
          >
            {submitting ? "Processing..." : `Place Order — ${formatPrice(totals.total)}`}
          </button>
        </form>

        <div className="bg-white border border-charcoal/5 p-6 lg:p-8 h-fit">
          <h2 className="font-display text-2xl text-charcoal mb-6">Your Order</h2>
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-charcoal">
                  {item.product.brand} {item.product.name}{" "}
                  <span className="text-muted">× {item.quantity}</span>
                </span>
                <span>{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-charcoal/10 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatPrice(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span>{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Tax</span>
              <span>{formatPrice(totals.tax)}</span>
            </div>
            <div className="flex justify-between font-medium text-base pt-2">
              <span>Total</span>
              <span>{formatPrice(totals.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
