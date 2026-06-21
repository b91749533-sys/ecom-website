"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { formatPrice, formatDate } from "@/lib/utils";
import { DollarSign, Package, Users, ShoppingBag } from "lucide-react";

interface Stats {
  productCount: number;
  orderCount: number;
  userCount: number;
  totalRevenue: number;
}

interface Order {
  id: string;
  orderNumber: string;
  name: string;
  email: string;
  status: string;
  total: number;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!loading) {
      if (!user) router.push("/login");
      else if (user.role !== "admin") router.push("/account");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetch("/api/admin/stats")
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setStats(data.data.stats);
            setOrders(data.data.recentOrders);
          }
        });
    }
  }, [user]);

  const updateStatus = async (orderId: string, status: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    const res = await fetch("/api/admin/stats");
    const data = await res.json();
    if (data.success) {
      setStats(data.data.stats);
      setOrders(data.data.recentOrders);
    }
  };

  if (loading || !user || user.role !== "admin") {
    return <div className="py-20 text-center text-muted">Loading...</div>;
  }

  const statCards = [
    { label: "Products", value: stats?.productCount ?? 0, icon: ShoppingBag },
    { label: "Orders", value: stats?.orderCount ?? 0, icon: Package },
    { label: "Customers", value: stats?.userCount ?? 0, icon: Users },
    {
      label: "Revenue",
      value: formatPrice(stats?.totalRevenue ?? 0),
      icon: DollarSign,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <h1 className="text-4xl font-display font-light text-charcoal mb-10">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-charcoal/5 p-6"
          >
            <card.icon className="w-5 h-5 text-gold mb-3" />
            <p className="text-2xl font-medium text-charcoal">{card.value}</p>
            <p className="text-xs tracking-widest uppercase text-muted mt-1">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      <h2 className="font-display text-2xl text-charcoal mb-6">Recent Orders</h2>
      <div className="bg-white border border-charcoal/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-charcoal/10 text-left">
              <th className="p-4 text-xs tracking-widest uppercase text-muted font-normal">
                Order
              </th>
              <th className="p-4 text-xs tracking-widest uppercase text-muted font-normal">
                Customer
              </th>
              <th className="p-4 text-xs tracking-widest uppercase text-muted font-normal">
                Date
              </th>
              <th className="p-4 text-xs tracking-widest uppercase text-muted font-normal">
                Total
              </th>
              <th className="p-4 text-xs tracking-widest uppercase text-muted font-normal">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-charcoal/5">
                <td className="p-4 font-medium">{order.orderNumber}</td>
                <td className="p-4">
                  <p>{order.name}</p>
                  <p className="text-xs text-muted">{order.email}</p>
                </td>
                <td className="p-4 text-muted">{formatDate(order.createdAt)}</td>
                <td className="p-4">{formatPrice(order.total)}</td>
                <td className="p-4">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="text-xs border border-charcoal/10 px-2 py-1 focus:border-gold focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
