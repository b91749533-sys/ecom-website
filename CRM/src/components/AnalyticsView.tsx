"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  Laptop, 
  Smartphone, 
  Tablet, 
  FileDown, 
  Percent, 
  Users, 
  RotateCcw,
  Sparkles,
  Info
} from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import Recharts components to handle Next.js SSR safely
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
const BarChart = dynamic(
  () => import("recharts").then((m) => m.BarChart),
  { ssr: false }
);
const Bar = dynamic(
  () => import("recharts").then((m) => m.Bar),
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
const PieChart = dynamic(
  () => import("recharts").then((m) => m.PieChart),
  { ssr: false }
);
const Pie = dynamic(
  () => import("recharts").then((m) => m.Pie),
  { ssr: false }
);
const Cell = dynamic(
  () => import("recharts").then((m) => m.Cell),
  { ssr: false }
);

export default function AnalyticsView() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [revenueTrends, setRevenueTrends] = useState<any[]>([]);
  const [geoSales, setGeoSales] = useState<any[]>([]);
  const [deviceData, setDeviceData] = useState<any[]>([]);
  const [browserData, setBrowserData] = useState<any[]>([]);
  const [growthData, setGrowthData] = useState<any[]>([]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/analytics");
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setRevenueTrends(data.revenueTrends);
        setGeoSales(data.geographicSales);
        setDeviceData(data.deviceAnalytics);
        setBrowserData(data.browserAnalytics);
        setGrowthData(data.customerGrowth);
      }
    } catch (err) {
      console.error("Failed to load analytics dossier:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleDownloadReport = () => {
    if (!metrics) return;
    
    // Generate text report
    const reportText = `LUMIÈRE PARFUMS - CRM ANALYTICS SUMMARY REPORT
Compiled: ${new Date().toLocaleString()}
--------------------------------------------------
FINANCIALS & RATIOS
Total Sales Revenue: $${metrics.totalRevenue.toLocaleString()}
Total Orders Handled: ${metrics.ordersCount}
Average Order Value (AOV): $${metrics.avgOrderValue.toFixed(2)}
Repeat Purchase Rate: ${metrics.repeatPurchaseRate}%
Customer Churn Rate: ${metrics.churnRate}%
Total Customer Profiles: ${metrics.customersCount}

GEOGRAPHIC DISTRIBUTION
${geoSales.map((g, idx) => `${idx + 1}. State: ${g.state} | Revenue: $${g.revenue.toLocaleString()} | Orders: ${g.orders}`).join("\n")}

DEVICE LANDING SPLIT
${deviceData.map(d => `- ${d.name}: ${d.value} page views`).join("\n")}
--------------------------------------------------
End of Dossier Report.
`;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `lumiere_crm_report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
          <p className="text-sm text-slate-500 font-medium">Compiling Analytics Intelligence...</p>
        </div>
      </div>
    );
  }

  // Curated color palette for charts
  const PIE_COLORS = ["#d4af37", "#7b8ba5", "#3f4a64", "#1c2230"];

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="flex justify-between items-center bg-slate-900/40 border border-slate-850 p-4 rounded-2xl">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">Analytics & Dossiers</h3>
          <p className="text-xs text-slate-500 mt-1">Deep analysis of sales, trends, retention, and browser metrics</p>
        </div>
        <button
          onClick={handleDownloadReport}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-xs font-semibold text-slate-950 cursor-pointer"
        >
          <FileDown className="h-4 w-4" />
          Download report (.txt)
        </button>
      </div>

      {/* Ratios Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Retention Ratios */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-gold-400">
            <Percent className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Repeat Purchase Rate</p>
            <p className="text-2xl font-bold text-slate-200 mt-1">{metrics?.repeatPurchaseRate}%</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Ratio of multi-order buyers</p>
          </div>
        </div>

        {/* Churn Ratios */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-crimson-400">
            <RotateCcw className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Customer Churn Rate</p>
            <p className="text-2xl font-bold text-slate-200 mt-1">{metrics?.churnRate}%</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Inactive customers ratio</p>
          </div>
        </div>

        {/* Customer Base Growth */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-emerald-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Customer Directory</p>
            <p className="text-2xl font-bold text-slate-200 mt-1">{metrics?.customersCount} profiles</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Live store-registered clients</p>
          </div>
        </div>

      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sales Trend Chart */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans mb-4">
            Daily Revenue Aggregations
          </h4>
          <div className="h-64">
            {revenueTrends.length === 0 ? (
              <p className="text-xs text-slate-600 text-center pt-24">No data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSalesAnalytics" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#121620", borderColor: "#1e293b", borderRadius: "10px", color: "#f8fafc", fontSize: "11px" }}
                    formatter={value => [`$${value}`, "Sales"]}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#d4af37" strokeWidth={2} fillOpacity={1} fill="url(#colorSalesAnalytics)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Customer Growth Chart */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans mb-4">
            Monthly Registrations Growth
          </h4>
          <div className="h-64">
            {growthData.length === 0 ? (
              <p className="text-xs text-slate-600 text-center pt-24">No data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#121620", borderColor: "#1e293b", borderRadius: "10px", color: "#f8fafc", fontSize: "11px" }}
                    formatter={value => [value, "New Registrations"]}
                  />
                  <Bar dataKey="customers" fill="#7b8ba5" radius={[4, 4, 0, 0]}>
                    {growthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === growthData.length - 1 ? "#d4af37" : "#7b8ba5"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Geography & Browser Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Geographic table */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans mb-4 flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-gold-400" />
            Geographic Sales Dispersion
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30 text-slate-500 text-[9px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">State / Location</th>
                  <th className="py-3 px-4 text-right">Orders cache</th>
                  <th className="py-3 px-4 text-right">Aggregated Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
                {geoSales.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-slate-600">No geo sales data.</td>
                  </tr>
                ) : (
                  geoSales.map((g, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/10 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-200">{g.state}</td>
                      <td className="py-3 px-4 text-right font-medium text-slate-400">{g.orders} orders</td>
                      <td className="py-3 px-4 text-right font-bold text-white">${g.revenue.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Device Splits */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans mb-4 flex items-center gap-1.5">
              <Laptop className="h-4 w-4 text-gold-400" />
              Device browser split
            </h4>

            <div className="space-y-4 mt-6">
              {deviceData.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-6">No session data.</p>
              ) : (
                deviceData.map((d, idx) => {
                  const total = deviceData.reduce((sum, item) => sum + item.value, 0);
                  const percentage = total > 0 ? (d.value / total) * 100 : 0;
                  
                  return (
                    <div key={idx} className="text-xs space-y-1.5">
                      <div className="flex justify-between font-semibold text-slate-300">
                        <span className="capitalize">{d.name}</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                        <div 
                          className="h-full bg-gold-500 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-850 text-[10px] text-slate-500 leading-normal flex items-start gap-1">
            <Info className="h-4 w-4 text-slate-600 flex-shrink-0" />
            Aggregated split reflects actual live customer storefront visits tracked by the synchronized activity tracker.
          </div>
        </div>

      </div>

    </div>
  );
}
