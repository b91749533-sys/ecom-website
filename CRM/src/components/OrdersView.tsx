"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Search, 
  Filter, 
  Download, 
  X,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  User,
  MapPin,
  Barcode,
  PackageCheck
} from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  email: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingTracking?: string;
  shippingProvider?: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersView() {
  const { user } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("");

  // Detailed modal state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form states inside modal
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingCarrier, setShippingCarrier] = useState("");
  const [fulfillmentState, setFulfillmentState] = useState("");
  const [orderState, setOrderState] = useState("");
  const [paymentState, setPaymentState] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        search,
        status: statusFilter,
        paymentStatus: paymentFilter,
        fulfillmentStatus: fulfillmentFilter,
      }).toString();
      
      const res = await fetch(`/api/orders?${query}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to fetch orders ledger:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter, paymentFilter, fulfillmentFilter]);

  const handleOpenOrder = async (id: string) => {
    setSelectedOrderId(id);
    setModalLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.success) {
        const order = data.order;
        setOrderData(order);
        setTrackingNumber(order.shippingTracking || "");
        setShippingCarrier(order.shippingProvider || "");
        setFulfillmentState(order.fulfillmentStatus);
        setOrderState(order.status);
        setPaymentState(order.paymentStatus);
      }
    } catch (err) {
      console.error("Failed to fetch order details:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/orders/${selectedOrderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: orderState,
          paymentStatus: paymentState,
          fulfillmentStatus: fulfillmentState,
          shippingTracking: trackingNumber,
          shippingProvider: shippingCarrier,
        }),
      });

      if (res.ok) {
        // Refresh orders and modal data
        fetchOrders();
        handleOpenOrder(selectedOrderId);
      }
    } catch (err) {
      console.error("Failed to update order:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportCSV = () => {
    if (orders.length === 0) return;

    const headers = ["Order Number", "Date", "Customer Name", "Email", "Status", "Payment", "Fulfillment", "Total Spent ($)", "Tracking Provider", "Tracking Number"];
    const rows = orders.map(o => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString(),
      o.name,
      o.email,
      o.status,
      o.paymentStatus,
      o.fulfillmentStatus,
      o.total,
      o.shippingProvider || "",
      o.shippingTracking || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20";
      case "shipped":
        return "bg-blue-600/10 text-blue-400 border border-blue-500/20";
      case "processing":
        return "bg-gold-600/10 text-gold-400 border border-gold-500/20";
      case "cancelled":
      case "refunded":
        return "bg-crimson-600/10 text-crimson-400 border border-crimson-500/20";
      default:
        return "bg-slate-900 border border-slate-800 text-slate-400";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    if (status === "paid") return "bg-emerald-500/10 text-emerald-400";
    if (status === "refunded") return "bg-crimson-500/10 text-crimson-400";
    return "bg-slate-800 text-slate-400";
  };

  const getFulfillmentStatusColor = (status: string) => {
    if (status === "fulfilled") return "bg-emerald-500/10 text-emerald-400";
    if (status === "processing") return "bg-gold-500/10 text-gold-400";
    return "bg-slate-800 text-slate-400";
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-slate-900/40 border border-slate-850 p-4 rounded-2xl">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative col-span-1 sm:col-span-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, email..."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/40"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-300 w-full focus:outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <select 
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-transparent text-slate-300 w-full focus:outline-none cursor-pointer"
            >
              <option value="">All Payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Fulfillment Filter */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <select 
              value={fulfillmentFilter}
              onChange={(e) => setFulfillmentFilter(e.target.value)}
              className="bg-transparent text-slate-300 w-full focus:outline-none cursor-pointer"
            >
              <option value="">All Fulfillments</option>
              <option value="unfulfilled">Unfulfilled</option>
              <option value="processing">Processing</option>
              <option value="fulfilled">Fulfilled</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={orders.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 cursor-pointer disabled:opacity-40"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Orders Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent mb-2"></div>
            <p className="text-xs text-slate-500">Querying Order Ledger...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <ShoppingBag className="h-12 w-12 text-slate-800 mx-auto mb-3" />
            <p className="text-sm font-semibold">No orders matched the current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Order ID & Date</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6 text-right">Amount</th>
                  <th className="py-4 px-6 text-center">Order Status</th>
                  <th className="py-4 px-6 text-center">Payment</th>
                  <th className="py-4 px-6 text-center">Fulfillment</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-slate-200">{o.orderNumber}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{new Date(o.createdAt).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-slate-200">{o.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{o.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-white">
                      ${o.total.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getOrderStatusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize ${getPaymentStatusColor(o.paymentStatus)}`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize ${getFulfillmentStatusColor(o.fulfillmentStatus)}`}>
                        {o.fulfillmentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleOpenOrder(o.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-300 cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Drawer Modal */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrderId(null)}></div>
          
          <div className="relative w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col z-50 shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Modal Header */}
            <div className="flex justify-between items-center h-16 px-6 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-sans">
                  Order Management Panel
                </h3>
                {orderData && (
                  <p className="text-[10px] text-slate-500 mt-0.5">Order Number: {orderData.orderNumber}</p>
                )}
              </div>
              <button onClick={() => setSelectedOrderId(null)} className="text-slate-400 hover:text-slate-200">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {modalLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
                </div>
              ) : !orderData ? (
                <p className="text-xs text-slate-500 text-center">Failed to load order details.</p>
              ) : (
                <>
                  {/* Address & Customer details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer Info Box */}
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs">
                      <h4 className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wide text-[10px] text-slate-400 mb-3">
                        <User className="h-4 w-4 text-gold-500" />
                        Customer Information
                      </h4>
                      <p className="font-semibold text-slate-200">{orderData.name}</p>
                      <p className="text-slate-400 mt-1">{orderData.email}</p>
                      {orderData.customerId && (
                        <p className="text-[9px] text-gold-500/80 mt-2 font-bold uppercase tracking-wider">Synced Profile Customer</p>
                      )}
                    </div>

                    {/* Shipping Address Box */}
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs">
                      <h4 className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wide text-[10px] text-slate-400 mb-3">
                        <MapPin className="h-4 w-4 text-gold-500" />
                        Shipping Destination
                      </h4>
                      <p className="text-slate-300">{orderData.address}</p>
                      <p className="text-slate-300 mt-0.5">
                        {orderData.city}, {orderData.state} {orderData.zip}
                      </p>
                      <p className="text-slate-400 mt-0.5">{orderData.country}</p>
                    </div>
                  </div>

                  {/* Order Items Catalog */}
                  <div>
                    <h4 className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Line Items cache
                    </h4>
                    <div className="divide-y divide-slate-850 bg-slate-950/30 rounded-xl border border-slate-850 overflow-hidden">
                      {orderData.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 text-xs">
                          <div>
                            <p className="font-bold text-slate-200">{item.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{item.brand} • Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-200">${(item.price * item.quantity).toFixed(2)}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">${item.price.toFixed(2)} each</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Financial Summary */}
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal</span>
                      <span>${orderData.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Shipping Rate</span>
                      <span>${orderData.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Calculated Tax</span>
                      <span>${orderData.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-slate-850">
                      <span>Total Amount Paid</span>
                      <span className="text-gold-400">${orderData.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Shipping Provider Tracking Form */}
                  <form onSubmit={handleUpdateOrder} className="p-4 rounded-xl bg-slate-950/30 border border-slate-850 space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-gold-500" />
                      Fulfillment and Dispatch Controls
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Shipping Provider</label>
                        <input
                          type="text"
                          value={shippingCarrier}
                          onChange={(e) => setShippingCarrier(e.target.value)}
                          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                          placeholder="E.g., UPS, DHL"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Tracking Number</label>
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                          placeholder="E.g., 1Z999AA10123..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Fulfillment Status</label>
                        <select
                          value={fulfillmentState}
                          onChange={(e) => setFulfillmentState(e.target.value)}
                          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-gold-500/40 cursor-pointer"
                        >
                          <option value="unfulfilled">Unfulfilled</option>
                          <option value="processing">Processing</option>
                          <option value="fulfilled">Fulfilled</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Order Status</label>
                        <select
                          value={orderState}
                          onChange={(e) => setOrderState(e.target.value)}
                          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-gold-500/40 cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Payment Status</label>
                        <select
                          value={paymentState}
                          onChange={(e) => setPaymentState(e.target.value)}
                          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-gold-500/40 cursor-pointer"
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="paid">Paid</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="px-4 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-[11px] font-semibold text-gold-400 border border-slate-800 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isUpdating ? "Syncing..." : "Update & Sync to Storefront"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>

            {/* Modal Footer */}
            {orderData && (
              <div className="h-16 px-6 border-t border-slate-800 flex items-center justify-end bg-slate-950/20">
                <button
                  onClick={() => setSelectedOrderId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 cursor-pointer"
                >
                  Close Panel
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
