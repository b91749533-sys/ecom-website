"use client";

import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  ArrowRight,
  PackageOpen,
  ChevronRight,
  Sparkles
} from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import Recharts to prevent SSR hydration mismatches
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const AreaChart = dynamic(
  () => import("recharts").then((m) => m.AreaChart),
  { ssr: false }
);
const Area = dynamic(
  () => import("recharts").then((m) => m.Area),
  { ssr: false }
);
const XAxis = dynamic(
  () => import("recharts").then((m) => m.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import("recharts").then((m) => m.YAxis),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import("recharts").then((m) => m.Tooltip),
  { ssr: false }
);

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // 1. Fetch main analytics data
        const analyticsRes = await fetch("/api/analytics");
        const analyticsData = await analyticsRes.json();

        // 2. Fetch products to sort top sellers
        const productsRes = await fetch("/api/products");
        const productsData = await productsRes.json();

        // 3. Fetch recent system logs
        const logsRes = await fetch("/api/notifications");
        const logsData = await logsRes.json();

        if (analyticsData.success) {
          setStats(analyticsData.metrics);
          setTrends(analyticsData.revenueTrends);
        }

        if (productsData.success) {
          // Sort products by sold count desc and take top 4
          const sorted = [...productsData.products]
            .sort((a, b) => b.soldCount - a.soldCount)
            .slice(0, 4);
          setTopProducts(sorted);
        }

        if (logsData.success) {
          setRecentLogs(logsData.notifications.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
          <p className="text-sm text-slate-500 font-medium">Assembling Dashboard Intelligence...</p>
        </div>
      </div>
    );
  }

  // Fallbacks if stats fail to load
  const totalRevenue = stats?.totalRevenue || 0;
  const ordersCount = stats?.ordersCount || 0;
  const customersCount = stats?.customersCount || 0;
  const avgOrderValue = stats?.avgOrderValue || 0;
  const repeatPurchaseRate = stats?.repeatPurchaseRate || 0;

  // Custom styling for cards
  const kpis = [
    {
      title: "Gross Sales Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      change: "+12.4% vs last month",
      icon: DollarSign,
      color: "text-gold-400",
      tab: "analytics",
    },
    {
      title: "Orders Handled",
      value: ordersCount.toLocaleString(),
      change: "+8.1% vs last week",
      icon: ShoppingBag,
      color: "text-emerald-400",
      tab: "orders",
    },
    {
      title: "Total Customers",
      value: customersCount.toLocaleString(),
      change: "+14 new today",
      icon: Users,
      color: "text-gold-300",
      tab: "customers",
    },
    {
      title: "Average Order Value",
      value: `$${avgOrderValue.toFixed(2)}`,
      change: "Stable",
      icon: TrendingUp,
      color: "text-slate-400",
      tab: "analytics",
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden glass-card p-6 border border-slate-800">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Sparkles className="h-48 w-48 text-gold-400" />
        </div>
        <div className="max-w-xl">
          <h3 className="text-2xl font-serif font-bold text-white">
            Welcome back to the Control Center.
          </h3>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Real-time synchronization with the storefront is fully active. Stock adjustments and order updates will propagate live to customers immediately.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx} 
              onClick={() => onNavigate(kpi.tab)}
              className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800/80 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {kpi.title}
                  </p>
                  <p className="text-2xl font-bold font-sans mt-2 text-white">
                    {kpi.value}
                  </p>
                </div>
                <div className={`p-2.5 bg-slate-900 border border-slate-800 rounded-xl ${kpi.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{kpi.change}</span>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-gold-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Charts & Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Area Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-base font-bold text-white uppercase tracking-wider font-sans">
                Revenue Growth Trends
              </h4>
              <p className="text-xs text-slate-500 mt-1">Daily aggregated sales volume</p>
            </div>
            <div className="text-xs bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-gold-400 font-semibold uppercase tracking-wider">
              Last 30 Days
            </div>
          </div>
          
          <div className="h-72 w-full text-slate-400">
            {trends.length === 0 ? (
              <div className="flex h-full w-full items-center justify-center">
                <p className="text-xs text-slate-600">No chart data available.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#121620", 
                      borderColor: "#1e293b", 
                      borderRadius: "12px",
                      color: "#f8fafc",
                      fontSize: "12px"
                    }}
                    itemStyle={{ color: "#d4af37" }}
                    labelStyle={{ color: "#94a3b8" }}
                    formatter={(value) => [`$${value}`, "Revenue"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#d4af37" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Selling Products List */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-base font-bold text-white uppercase tracking-wider font-sans">
                  Best Sellers Catalog
                </h4>
                <p className="text-xs text-slate-500 mt-1">High volume product performance</p>
              </div>
              <button 
                onClick={() => onNavigate("products")}
                className="text-xs text-gold-400 hover:text-gold-300 font-semibold flex items-center gap-1 focus:outline-none cursor-pointer"
              >
                Catalog <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-4">
              {topProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-600">
                  <PackageOpen className="h-10 w-10 text-slate-700 mb-2" />
                  <p className="text-xs">No records available.</p>
                </div>
              ) : (
                topProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/40 hover:border-slate-800 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate pr-2">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">{product.brand} • {product.size}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-white">{product.soldCount} sold</p>
                      <p className="text-[10px] text-gold-500 mt-0.5">${product.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-800/60 pt-4 text-center">
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Repeat Purchase Rate</span>
              <span className="font-bold text-gold-400">{repeatPurchaseRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Activity Logs */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <h4 className="text-base font-bold text-white uppercase tracking-wider font-sans mb-6">
          Recent Activity Logs
        </h4>
        <div className="space-y-4">
          {recentLogs.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-6">No recent logs recorded.</p>
          ) : (
            recentLogs.map((log) => (
              <div 
                key={log.id} 
                className="flex items-start gap-4 p-3 rounded-xl bg-slate-900/20 border border-slate-800/30 hover:border-slate-800 transition-all hover:bg-slate-900/40"
              >
                <div className="mt-0.5 flex-shrink-0">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    log.action === "Low Stock Alert" 
                      ? "bg-crimson-600/10 text-crimson-400 border border-crimson-500/20" 
                      : log.action === "Order Synced" 
                      ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20" 
                      : "bg-gold-600/10 text-gold-400 border border-gold-500/20"
                  }`}>
                    {log.action}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-300 leading-normal">{log.details}</p>
                </div>
                <div className="text-right flex-shrink-0 text-[10px] text-slate-500 font-medium">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
