"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Search, 
  Filter, 
  Download, 
  UserPlus, 
  Trash2, 
  Edit3, 
  FileText, 
  Plus, 
  X,
  History,
  ShoppingCart,
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Tag as TagIcon,
  Users
} from "lucide-react";

interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country: string;
  totalSpent: number;
  orderCount: number;
  lastPurchaseAt?: string;
  clv: number;
  notes: string;
  tags: string;
  status: string;
  createdAt: string;
}

export default function CustomersView() {
  const { user } = useAuth();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Selected customer details modal state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editingNotes, setEditingNotes] = useState("");
  const [editingTags, setEditingTags] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Manual Customer Creation state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    tags: "",
    notes: ""
  });
  const [createError, setCreateError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        search,
        segment,
        tag: tagFilter,
        sortBy,
        sortOrder,
      }).toString();
      
      const res = await fetch(`/api/customers?${query}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, segment, tagFilter, sortBy, sortOrder]);

  const handleOpenProfile = async (id: string) => {
    setSelectedCustomerId(id);
    setProfileLoading(true);
    try {
      const res = await fetch(`/api/customers/${id}`);
      const data = await res.json();
      if (data.success) {
        setProfileData(data);
        setEditingNotes(data.customer.notes);
        setEditingTags(data.customer.tags);
      }
    } catch (err) {
      console.error("Failed to fetch customer profile details:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!selectedCustomerId) return;
    setIsSavingProfile(true);
    try {
      const res = await fetch(`/api/customers/${selectedCustomerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: editingNotes,
          tags: editingTags,
        }),
      });

      if (res.ok) {
        // Refresh local customers list and current view
        fetchCustomers();
        setProfileData((prev: any) => ({
          ...prev,
          customer: {
            ...prev.customer,
            notes: editingNotes,
            tags: editingTags,
          },
        }));
      }
    } catch (err) {
      console.error("Failed to save customer notes/tags:", err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this customer and all order history cache?")) {
      return;
    }
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSelectedCustomerId(null);
        setProfileData(null);
        fetchCustomers();
      }
    } catch (err) {
      console.error("Failed to delete customer:", err);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setIsCreating(true);

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setShowCreateModal(false);
        setCreateForm({
          name: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          zip: "",
          country: "US",
          tags: "",
          notes: ""
        });
        fetchCustomers();
      } else {
        setCreateError(data.error || "Failed to create customer.");
      }
    } catch (err) {
      console.error("Manual customer creation error:", err);
      setCreateError("Connection error. Try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleExportCSV = () => {
    if (customers.length === 0) return;
    
    // Build CSV content
    const headers = ["ID", "Name", "Email", "Phone", "Segment/Status", "Spent ($)", "Orders Count", "CLV ($)", "Last Purchase", "Tags", "Registered At"];
    const rows = customers.map(c => [
      c.id,
      c.name,
      c.email,
      c.phone || "",
      c.status,
      c.totalSpent,
      c.orderCount,
      c.clv,
      c.lastPurchaseAt ? new Date(c.lastPurchaseAt).toLocaleDateString() : "",
      c.tags,
      new Date(c.createdAt).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "vip":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold-600/10 text-gold-400 border border-gold-500/20 uppercase tracking-wider">VIP</span>;
      case "loyal":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">Loyal</span>;
      case "active":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">Active</span>;
      case "inactive":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-500 uppercase tracking-wider">Inactive</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 border border-slate-800 text-slate-400 uppercase tracking-wider">New</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-slate-900/40 border border-slate-850 p-4 rounded-2xl">
        <div className="flex-1 flex flex-col md:flex-row gap-3">
          <div className="relative md:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/40"
            />
          </div>

          <div className="flex gap-2">
            {/* Segment filter */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl text-xs">
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              <select 
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="">All Segments</option>
                <option value="vip">VIPs</option>
                <option value="loyal">Loyal Customers</option>
                <option value="active">Active</option>
                <option value="new">New / Prospect</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Tag search filter */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl text-xs">
              <TagIcon className="h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                placeholder="Filter by Tag"
                className="bg-transparent text-slate-300 w-24 placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={customers.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 cursor-pointer disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            CSV Export
          </button>
          
          {(user?.role === "admin" || user?.role === "manager") && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-xs font-semibold text-slate-950 cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              Add Customer
            </button>
          )}
        </div>
      </div>

      {/* Sorting configuration */}
      <div className="flex gap-4 text-xs text-slate-500 font-semibold px-2">
        <span>Order By:</span>
        <button onClick={() => { setSortBy("createdAt"); setSortOrder(sortOrder === "asc" ? "desc" : "asc"); }} className={`hover:text-slate-300 cursor-pointer ${sortBy === "createdAt" ? "text-gold-400 font-bold" : ""}`}>
          Created Date {sortBy === "createdAt" && (sortOrder === "asc" ? "▲" : "▼")}
        </button>
        <button onClick={() => { setSortBy("totalSpent"); setSortOrder(sortOrder === "asc" ? "desc" : "asc"); }} className={`hover:text-slate-300 cursor-pointer ${sortBy === "totalSpent" ? "text-gold-400 font-bold" : ""}`}>
          Total Spent {sortBy === "totalSpent" && (sortOrder === "asc" ? "▲" : "▼")}
        </button>
        <button onClick={() => { setSortBy("clv"); setSortOrder(sortOrder === "asc" ? "desc" : "asc"); }} className={`hover:text-slate-300 cursor-pointer ${sortBy === "clv" ? "text-gold-400 font-bold" : ""}`}>
          CLV {sortBy === "clv" && (sortOrder === "asc" ? "▲" : "▼")}
        </button>
        <button onClick={() => { setSortBy("orderCount"); setSortOrder(sortOrder === "asc" ? "desc" : "asc"); }} className={`hover:text-slate-300 cursor-pointer ${sortBy === "orderCount" ? "text-gold-400 font-bold" : ""}`}>
          Orders count {sortBy === "orderCount" && (sortOrder === "asc" ? "▲" : "▼")}
        </button>
      </div>

      {/* Customer list table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent mb-2"></div>
            <p className="text-xs text-slate-500">Querying Customer Ledger...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <Users className="h-12 w-12 text-slate-800 mx-auto mb-3" />
            <p className="text-sm font-semibold">No customers matched current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6 text-center">Segment</th>
                  <th className="py-4 px-6 text-right">Orders</th>
                  <th className="py-4 px-6 text-right">Total Spent</th>
                  <th className="py-4 px-6 text-right">CLV</th>
                  <th className="py-4 px-6 text-right">Last Purchase</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-200">{c.name}</p>
                        <p className="text-slate-500 mt-0.5 truncate">{c.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {getStatusBadge(c.status)}
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-slate-200">
                      {c.orderCount}
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-slate-200">
                      ${c.totalSpent.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-gold-400">
                      ${c.clv.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-right text-slate-400">
                      {c.lastPurchaseAt ? new Date(c.lastPurchaseAt).toLocaleDateString() : "Never"}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleOpenProfile(c.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-300 cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5 text-gold-500" />
                        Full Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Profile Side-Over / Modal */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCustomerId(null)}></div>
          
          <div className="relative w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col z-50 shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Modal Header */}
            <div className="flex justify-between items-center h-16 px-6 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-sans">
                  Customer Profile Dossier
                </h3>
                {profileData?.customer && (
                  <p className="text-[10px] text-slate-500 mt-0.5">ID: {profileData.customer.id}</p>
                )}
              </div>
              <button onClick={() => setSelectedCustomerId(null)} className="text-slate-400 hover:text-slate-200">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {profileLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
                </div>
              ) : !profileData?.customer ? (
                <p className="text-xs text-slate-500 text-center">Failed to load customer profile details.</p>
              ) : (
                <>
                  {/* General Profile Box */}
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xl font-bold font-serif text-white">{profileData.customer.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">{profileData.customer.email}</p>
                        <p className="text-xs text-slate-400 mt-1">{profileData.customer.phone || "No phone listed"}</p>
                      </div>
                      <div>
                        {getStatusBadge(profileData.customer.status)}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-850 text-xs text-slate-400 leading-relaxed">
                      <p className="font-semibold text-slate-300">Shipping Address:</p>
                      <p className="mt-1">
                        {profileData.customer.address || "No address listed"}
                        {profileData.customer.city && `, ${profileData.customer.city}`}
                        {profileData.customer.state && ` ${profileData.customer.state}`}
                        {profileData.customer.zip && ` ${profileData.customer.zip}`}
                        {profileData.customer.country && ` (${profileData.customer.country})`}
                      </p>
                    </div>
                  </div>

                  {/* Financial Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-500">Orders</p>
                      <p className="text-xl font-bold text-slate-200 mt-1">{profileData.customer.orderCount}</p>
                    </div>
                    <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-500">Total Spent</p>
                      <p className="text-xl font-bold text-emerald-400 mt-1">${profileData.customer.totalSpent.toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-500">Lifetime Value</p>
                      <p className="text-xl font-bold text-gold-400 mt-1">${profileData.customer.clv.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Cart Session */}
                  {profileData.cart && (
                    <div className="p-4 rounded-xl bg-slate-950/30 border border-slate-850">
                      <div className="flex justify-between items-center pb-2.5 border-b border-slate-850">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <ShoppingCart className="h-4 w-4 text-gold-500" />
                          Live Cart Session
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          profileData.cart.isCheckedOut 
                            ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20" 
                            : profileData.cart.emailSent 
                            ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" 
                            : "bg-crimson-600/10 text-crimson-400 border border-crimson-500/20"
                        }`}>
                          {profileData.cart.isCheckedOut 
                            ? "Checked Out" 
                            : profileData.cart.emailSent 
                            ? "Recovery Sent" 
                            : "Abandoned"}
                        </span>
                      </div>
                      <div className="mt-3 text-xs text-slate-400">
                        <div className="flex justify-between">
                          <span>Cart Value</span>
                          <span className="font-semibold text-slate-200">${profileData.cart.value.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mt-1.5">
                          <span>Last Activity</span>
                          <span>{new Date(profileData.cart.lastActive).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dynamic Tags & Notes Editor */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Customer Tags (comma separated)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={editingTags}
                          onChange={(e) => setEditingTags(e.target.value)}
                          className="w-full rounded-xl bg-slate-950 border border-slate-850 pl-4 pr-12 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500/35"
                          placeholder="VIP, Men, High Value..."
                        />
                        <button
                          onClick={handleSaveProfile}
                          disabled={isSavingProfile}
                          className="absolute right-2 top-1.5 px-3 py-1 rounded bg-slate-850 hover:bg-slate-800 text-[10px] font-bold text-gold-400 border border-slate-800 cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Internal Staff Notes
                      </label>
                      <div className="relative">
                        <textarea
                          rows={3}
                          value={editingNotes}
                          onChange={(e) => setEditingNotes(e.target.value)}
                          className="w-full rounded-xl bg-slate-950 border border-slate-850 p-4 text-xs text-white focus:outline-none focus:border-gold-500/35 resize-none leading-relaxed"
                          placeholder="Type notes about customer preferences..."
                        />
                        <button
                          onClick={handleSaveProfile}
                          disabled={isSavingProfile}
                          className="absolute right-2 bottom-3 px-3 py-1 rounded bg-slate-850 hover:bg-slate-800 text-[10px] font-bold text-gold-400 border border-slate-800 cursor-pointer"
                        >
                          Save Notes
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order History Cache */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Order History Cache
                    </h5>
                    <div className="space-y-3">
                      {profileData.customer.orders.length === 0 ? (
                        <p className="text-xs text-slate-600 text-center py-4 bg-slate-950/20 border border-slate-850 rounded-xl">No orders recorded.</p>
                      ) : (
                        profileData.customer.orders.map((order: any) => (
                          <div key={order.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-950/40 border border-slate-850">
                            <div>
                              <p className="text-xs font-bold text-slate-200">{order.orderNumber}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-slate-200">${order.total.toFixed(2)}</p>
                              <span className={`inline-block text-[9px] font-bold capitalize mt-0.5 ${
                                order.status === "delivered" 
                                  ? "text-emerald-400" 
                                  : order.status === "cancelled" || order.status === "refunded" 
                                  ? "text-crimson-400" 
                                  : "text-gold-400"
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Browsing History Activity Tracker */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                      <History className="h-4 w-4 text-slate-500" />
                      Browsing History Logs
                    </h5>
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {profileData.browsingHistory.length === 0 ? (
                        <p className="text-xs text-slate-600 text-center py-4 bg-slate-950/20 border border-slate-850 rounded-xl">No browsing sessions logged.</p>
                      ) : (
                        profileData.browsingHistory.map((log: any) => (
                          <div key={log.id} className="text-xs bg-slate-950/30 border border-slate-850/50 p-2.5 rounded-xl flex justify-between items-start gap-4">
                            <div className="min-w-0">
                              <p className="text-slate-300 font-semibold truncate">{log.page}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5 truncate">{log.device} • {log.browser} • {log.duration}s view</p>
                            </div>
                            <span className="text-[9px] text-slate-600 whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer / Actions */}
            {profileData?.customer && (
              <div className="h-16 px-6 border-t border-slate-800 flex items-center justify-between bg-slate-950/20">
                <div>
                  {user?.role === "admin" && (
                    <button
                      onClick={() => handleDeleteCustomer(profileData.customer.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-crimson-600/10 hover:bg-crimson-600/20 text-xs font-semibold text-crimson-400 border border-crimson-500/20 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      Purge Profile
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setSelectedCustomerId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Customer Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
          
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl flex flex-col z-50 shadow-2xl max-h-[90vh]">
            <div className="flex justify-between items-center h-14 px-6 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                Manually Register Client Profile
              </h4>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="flex-1 overflow-y-auto p-6 space-y-4">
              {createError && (
                <div className="rounded-lg bg-crimson-600/10 border border-crimson-500/20 p-3 text-xs text-crimson-400">
                  {createError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Client Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                    placeholder="E.g., Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                    placeholder="jane.doe@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="border-t border-slate-850 pt-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Shipping Address
                </label>
                <input
                  type="text"
                  value={createForm.address}
                  onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40 mb-3"
                  placeholder="123 Luxury Way"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={createForm.city}
                    onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    value={createForm.state}
                    onChange={(e) => setCreateForm({ ...createForm, state: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                    placeholder="State/Prov"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <input
                    type="text"
                    value={createForm.zip}
                    onChange={(e) => setCreateForm({ ...createForm, zip: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                    placeholder="ZIP / Postal Code"
                  />
                  <input
                    type="text"
                    value={createForm.country}
                    onChange={(e) => setCreateForm({ ...createForm, country: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                    placeholder="Country (E.g., US)"
                  />
                </div>
              </div>

              <div className="border-t border-slate-850 pt-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Initial Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={createForm.tags}
                  onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40 mb-3"
                  placeholder="E.g., Prospect, Sweet Notes"
                />
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Staff Description Notes
                </label>
                <textarea
                  rows={2}
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white focus:outline-none focus:border-gold-500/40 resize-none"
                  placeholder="E.g. Manually initialized."
                />
              </div>

              <div className="border-t border-slate-800 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-xs font-semibold text-slate-950 cursor-pointer disabled:opacity-50"
                >
                  {isCreating ? "Registering..." : "Create Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
