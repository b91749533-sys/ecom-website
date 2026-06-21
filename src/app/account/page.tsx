"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { formatPrice, formatDate } from "@/lib/utils";
import { LogOut, Package, Shield } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: { name: string; brand: string; quantity: number }[];
}

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setOrders(data.data.orders);
        });
    }
  }, [user]);

  if (loading || !user) {
    return <div className="py-20 text-center text-muted">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-display font-light text-charcoal">
            My Account
          </h1>
          <p className="text-muted mt-1">{user.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-muted hover:text-charcoal transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {user.role === "admin" && (
        <Link
          href="/admin"
          className="flex items-center gap-3 bg-charcoal text-white p-4 mb-8 hover:bg-gold transition-colors"
        >
          <Shield className="w-5 h-5" />
          <span className="text-sm tracking-widest uppercase">Admin Dashboard</span>
        </Link>
      )}

      <h2 className="font-display text-2xl text-charcoal mb-6 flex items-center gap-2">
        <Package className="w-5 h-5" />
        Order History
      </h2>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white border border-charcoal/5">
          <p className="text-muted mb-4">No orders yet.</p>
          <Link
            href="/shop"
            className="text-sm text-gold hover:text-charcoal transition-colors tracking-widest uppercase"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-charcoal/5 p-6"
            >
              <div className="flex flex-wrap justify-between gap-2 mb-4">
                <div>
                  <p className="font-medium text-charcoal">#{order.orderNumber}</p>
                  <p className="text-xs text-muted">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatPrice(order.total)}</p>
                  <span className="text-xs tracking-widest uppercase text-gold">
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="text-sm text-muted space-y-1">
                {order.items.map((item, i) => (
                  <p key={i}>
                    {item.brand} {item.name} × {item.quantity}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
