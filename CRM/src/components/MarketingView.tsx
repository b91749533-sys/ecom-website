"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Megaphone, 
  Percent, 
  ShoppingCart, 
  Mail, 
  Plus, 
  X, 
  Send, 
  Inbox, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Eye,
  MousePointerClick,
  ShoppingBag
} from "lucide-react";

interface Campaign {
  id: string;
  subject: string;
  content: string;
  segmentId: string;
  sentAt?: string;
  openRate: number;
  clickRate: number;
  conversions: number;
  status: string;
  createdAt: string;
}

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  expiration: string;
  active: boolean;
  usageCount: number;
}

interface AbandonedCart {
  id: string;
  sessionId: string;
  customerEmail?: string;
  items: string; // JSON
  value: number;
  isCheckedOut: boolean;
  emailSent: boolean;
  lastActive: string;
}

export default function MarketingView() {
  const { user } = useAuth();
  
  const [activeSubTab, setActiveSubTab] = useState("campaigns"); // campaigns, coupons, carts
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);

  // Email Campaign Modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [emailSegment, setEmailSegment] = useState("new");
  const [emailStatus, setEmailStatus] = useState("sent");
  const [isSendingCampaign, setIsSendingCampaign] = useState(false);

  // Coupon Creation Modal
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState("percentage");
  const [couponValue, setCouponValue] = useState("");
  const [couponExpiry, setCouponExpiry] = useState("");
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);

  // Recovery email trigger state
  const [sendingRecoveryId, setSendingRecoveryId] = useState<string | null>(null);

  const fetchMarketingData = async () => {
    try {
      setLoading(true);
      const [statsRes, campaignsRes, couponsRes, cartsRes] = await Promise.all([
        fetch("/api/marketing"),
        fetch("/api/marketing/emails"),
        fetch("/api/marketing/discounts"),
        fetch("/api/marketing/abandoned-carts"),
      ]);

      const statsData = await statsRes.json();
      const campaignsData = await campaignsRes.json();
      const couponsData = await couponsRes.json();
      const cartsData = await cartsRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (campaignsData.success) setCampaigns(campaignsData.campaigns);
      if (couponsData.success) setCoupons(couponsData.coupons);
      if (cartsData.success) setAbandonedCarts(cartsData.carts);
    } catch (err) {
      console.error("Failed to load marketing room statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketingData();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject || !emailContent) return;
    setIsSendingCampaign(true);

    try {
      const res = await fetch("/api/marketing/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: emailSubject,
          content: emailContent,
          segmentId: emailSegment,
          status: emailStatus,
        }),
      });

      if (res.ok) {
        setShowEmailModal(false);
        setEmailSubject("");
        setEmailContent("");
        setEmailSegment("new");
        fetchMarketingData();
      }
    } catch (err) {
      console.error("Failed to send campaign:", err);
    } finally {
      setIsSendingCampaign(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode || !couponValue || !couponExpiry) return;
    setIsCreatingCoupon(true);

    try {
      const res = await fetch("/api/marketing/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          type: couponType,
          value: parseFloat(couponValue),
          expiration: couponExpiry,
        }),
      });

      if (res.ok) {
        setShowCouponModal(false);
        setCouponCode("");
        setCouponValue("");
        setCouponExpiry("");
        fetchMarketingData();
      }
    } catch (err) {
      console.error("Failed to create coupon:", err);
    } finally {
      setIsCreatingCoupon(false);
    }
  };

  const handleTriggerRecovery = async (cartId: string) => {
    setSendingRecoveryId(cartId);
    try {
      const res = await fetch("/api/marketing/abandoned-carts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId }),
      });

      if (res.ok) {
        alert("Simulated cart recovery email dispatched successfully to customer.");
        fetchMarketingData();
      }
    } catch (err) {
      console.error("Failed to trigger recovery email:", err);
    } finally {
      setSendingRecoveryId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
          <p className="text-sm text-slate-500 font-medium">Loading Campaign Engine...</p>
        </div>
      </div>
    );
  }

  // Segment labeling map
  const segmentLabels: Record<string, string> = {
    all: "All Subscribers",
    new: "New Prospects",
    vip: "VIP Cohort",
    loyal: "Loyal Shoppers",
    inactive: "Inactive Customers",
  };

  return (
    <div className="space-y-6">
      
      {/* Marketing Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Abandoned Carts</p>
          <p className="text-2xl font-bold text-white mt-1.5">{stats?.abandonedCartCount || 0}</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Live inactive checkout sessions</span>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Unrecovered Value</p>
          <p className="text-2xl font-bold text-crimson-400 mt-1.5">${(stats?.abandonedCartValue || 0).toLocaleString()}</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Accumulated sum in open carts</span>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Recovery Emails Sent</p>
          <p className="text-2xl font-bold text-white mt-1.5">{stats?.recoveryEmailsSent || 0}</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Dispatched follow-up scripts</span>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Recovery rate</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1.5">{stats?.recoveryRate || 0}%</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Conversions from recovery emails</span>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-800">
        <button 
          onClick={() => setActiveSubTab("campaigns")}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
            activeSubTab === "campaigns" 
              ? "border-gold-500 text-gold-400 font-bold" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Mail className="h-4 w-4" />
            Email Campaigns ({campaigns.length})
          </span>
        </button>
        <button 
          onClick={() => setActiveSubTab("coupons")}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
            activeSubTab === "coupons" 
              ? "border-gold-500 text-gold-400 font-bold" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Percent className="h-4 w-4" />
            Discount Coupons ({coupons.length})
          </span>
        </button>
        <button 
          onClick={() => setActiveSubTab("carts")}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
            activeSubTab === "carts" 
              ? "border-gold-500 text-gold-400 font-bold" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <ShoppingCart className="h-4 w-4" />
            Abandoned Cart Recovery ({abandonedCarts.length})
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeSubTab === "campaigns" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-sans">Campaign Ledgers</h4>
              <p className="text-xs text-slate-500 mt-1">Broadcast newsletters and fragrance profiles</p>
            </div>
            <button
              onClick={() => setShowEmailModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-xs font-semibold text-slate-950 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              Launch Campaign
            </button>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            {campaigns.length === 0 ? (
              <div className="p-16 text-center text-slate-500">
                <Inbox className="h-12 w-12 text-slate-800 mx-auto mb-3" />
                <p className="text-sm font-semibold">No email campaigns launched yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/30 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Subject & Date</th>
                      <th className="py-4 px-6 text-center">Segment</th>
                      <th className="py-4 px-6 text-center">Status</th>
                      <th className="py-4 px-6 text-right">Opens</th>
                      <th className="py-4 px-6 text-right">Clicks</th>
                      <th className="py-4 px-6 text-right">Orders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
                    {campaigns.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-semibold text-slate-200">{c.subject}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {c.sentAt ? `Sent: ${new Date(c.sentAt).toLocaleDateString()}` : `Created: ${new Date(c.createdAt).toLocaleDateString()}`}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center text-slate-400 capitalize">
                          {segmentLabels[c.segmentId] || c.segmentId}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            c.status === "sent" 
                              ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/25" 
                              : "bg-slate-800 text-slate-500"
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-semibold text-white">
                          <span className="inline-flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                            {c.status === "sent" ? `${c.openRate}%` : "—"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-semibold text-white">
                          <span className="inline-flex items-center gap-1">
                            <MousePointerClick className="h-3.5 w-3.5 text-slate-500" />
                            {c.status === "sent" ? `${c.clickRate}%` : "—"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-gold-400">
                          <span className="inline-flex items-center gap-1">
                            <ShoppingBag className="h-3.5 w-3.5 text-slate-500" />
                            {c.status === "sent" ? `${c.conversions} orders` : "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === "coupons" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-sans">Active Discount Codes</h4>
              <p className="text-xs text-slate-500 mt-1">Configure active promotional coupons</p>
            </div>
            <button
              onClick={() => setShowCouponModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-xs font-semibold text-slate-950 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Generate Coupon
            </button>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            {coupons.length === 0 ? (
              <div className="p-16 text-center text-slate-500">
                <Percent className="h-12 w-12 text-slate-800 mx-auto mb-3" />
                <p className="text-sm font-semibold">No coupon codes registered.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/30 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Coupon Code</th>
                      <th className="py-4 px-6 text-center">Type</th>
                      <th className="py-4 px-6 text-right">Value</th>
                      <th className="py-4 px-6 text-right">Usage Count</th>
                      <th className="py-4 px-6 text-right">Expiration</th>
                      <th className="py-4 px-6 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
                    {coupons.map((coupon) => {
                      const isExpired = new Date(coupon.expiration).getTime() < Date.now();
                      const active = coupon.active && !isExpired;

                      return (
                        <tr key={coupon.id} className="hover:bg-slate-900/20 transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-200 tracking-wider">
                            {coupon.code}
                          </td>
                          <td className="py-4 px-6 text-center text-slate-400 capitalize">
                            {coupon.type === "percentage" ? "Percentage" : "Fixed Amount"}
                          </td>
                          <td className="py-4 px-6 text-right font-bold text-white">
                            {coupon.type === "percentage" ? `${coupon.value}%` : `$${coupon.value}`}
                          </td>
                          <td className="py-4 px-6 text-right font-semibold text-slate-300">
                            {coupon.usageCount} times
                          </td>
                          <td className="py-4 px-6 text-right text-slate-400">
                            {new Date(coupon.expiration).toLocaleDateString()} {isExpired && <span className="text-[10px] text-crimson-500 font-bold ml-1">Expired</span>}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              active 
                                ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/25" 
                                : "bg-slate-800 text-slate-500"
                            }`}>
                              {active ? "Active" : "Disabled"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === "carts" && (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-sans">Abandoned Cart Directory</h4>
            <p className="text-xs text-slate-500 mt-1">Send recovery templates to prospects who left products in cart</p>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            {abandonedCarts.length === 0 ? (
              <div className="p-16 text-center text-slate-500">
                <ShoppingCart className="h-12 w-12 text-slate-800 mx-auto mb-3" />
                <p className="text-sm font-semibold">No active abandoned carts detected.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/30 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Customer Email</th>
                      <th className="py-4 px-6 text-right">Cart Value</th>
                      <th className="py-4 px-6 text-center">Last Active</th>
                      <th className="py-4 px-6 text-center">Recovery status</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
                    {abandonedCarts.map((cart) => (
                      <tr key={cart.id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-200">
                          {cart.customerEmail || "Guest Session"}
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-white">
                          ${cart.value.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-center text-slate-400">
                          <span className="inline-flex items-center gap-1 text-[11px]">
                            <Clock className="h-3.5 w-3.5 text-slate-500" />
                            {new Date(cart.lastActive).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            cart.emailSent 
                              ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" 
                              : "bg-crimson-600/10 text-crimson-400 border border-crimson-500/20"
                          }`}>
                            {cart.emailSent ? "recovery Sent" : "Un-notified"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {cart.customerEmail ? (
                            <button
                              onClick={() => handleTriggerRecovery(cart.id)}
                              disabled={sendingRecoveryId === cart.id}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] font-bold text-slate-300 cursor-pointer disabled:opacity-40"
                            >
                              {sendingRecoveryId === cart.id ? "Sending..." : "Send Recovery"}
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-600">Email Unavailable</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Email Campaign Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEmailModal(false)}></div>
          
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl flex flex-col z-50 shadow-2xl p-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                Launch Broadcast Campaign
              </h4>
              <button onClick={() => setShowEmailModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="mt-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Email Subject Line *
                </label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                  placeholder="E.g., Unlock Your Fragrance Profile - 15% Off"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Target Customer Segment
                  </label>
                  <select
                    value={emailSegment}
                    onChange={(e) => setEmailSegment(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-gold-500/40 cursor-pointer"
                  >
                    <option value="new">New Prospects</option>
                    <option value="vip">VIP Cohort</option>
                    <option value="loyal">Loyal Shoppers</option>
                    <option value="inactive">Inactive Customers</option>
                    <option value="all">All Subscribers</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Publish Status
                  </label>
                  <select
                    value={emailStatus}
                    onChange={(e) => setEmailStatus(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-gold-500/40 cursor-pointer"
                  >
                    <option value="sent">Broadcast Instantly (Sent)</option>
                    <option value="draft">Save as Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Campaign Email Content (HTML / Text) *
                </label>
                <textarea
                  rows={6}
                  required
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white focus:outline-none focus:border-gold-500/40 resize-none font-mono"
                  placeholder="<h1>Luxury Fragrance House</h1><p>Enjoy our latest niche collections...</p>"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingCampaign}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-xs font-semibold text-slate-950 cursor-pointer disabled:opacity-50"
                >
                  {isSendingCampaign ? "Sending..." : emailStatus === "sent" ? "Broadcast Campaign" : "Save Draft"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Creation Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCouponModal(false)}></div>
          
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl flex flex-col z-50 shadow-2xl p-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                Create Discount Coupon
              </h4>
              <button onClick={() => setShowCouponModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="mt-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40 uppercase font-bold tracking-wider"
                  placeholder="E.g., SUMMERSCENT20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={couponType}
                    onChange={(e) => setCouponType(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-gold-500/40 cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Dollar ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={couponValue}
                    onChange={(e) => setCouponValue(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                    placeholder={couponType === "percentage" ? "15" : "30"}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Expiration Date *
                </label>
                <input
                  type="date"
                  required
                  value={couponExpiry}
                  onChange={(e) => setCouponExpiry(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-gold-500/40 cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCoupon}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-xs font-semibold text-slate-950 cursor-pointer disabled:opacity-50"
                >
                  {isCreatingCoupon ? "Creating..." : "Generate Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
