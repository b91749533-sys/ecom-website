"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Package, 
  Megaphone, 
  BarChart3, 
  Settings, 
  Link as LinkIcon,
  LogOut, 
  User as UserIcon,
  Bell,
  Menu,
  X,
  Loader2,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Sparkles
} from "lucide-react";

// Import view components
import DashboardView from "@/components/DashboardView";
import CustomersView from "@/components/CustomersView";
import OrdersView from "@/components/OrdersView";
import ProductsView from "@/components/ProductsView";
import MarketingView from "@/components/MarketingView";
import AnalyticsView from "@/components/AnalyticsView";
import IntegrationsView from "@/components/IntegrationsView";
import SettingsView from "@/components/SettingsView";

interface ToastAlert {
  id: string;
  action: string;
  details: string;
  createdAt: string;
}

export default function MainPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  
  const lastCheckedTimeRef = useRef<Date>(new Date());

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Load and poll notifications
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async (isInitial = false) => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications);

          if (!isInitial) {
            // Find any notifications newer than our last checked time
            const newAlerts = data.notifications.filter((n: any) => {
              const notifyTime = new Date(n.createdAt);
              return notifyTime.getTime() > lastCheckedTimeRef.current.getTime();
            });

            if (newAlerts.length > 0) {
              // Add to visual toast queue
              const freshToasts = newAlerts.map((n: any) => ({
                id: n.id,
                action: n.action,
                details: n.details,
                createdAt: n.createdAt,
              }));
              setToasts((prev) => [...prev, ...freshToasts]);
              
              // Automatically remove toasts after 5 seconds
              freshToasts.forEach((t: any) => {
                setTimeout(() => {
                  setToasts((prev) => prev.filter((item) => item.id !== t.id));
                }, 5000);
              });
            }
          }

          // Update last check timestamp to the most recent notification's time
          if (data.notifications.length > 0) {
            lastCheckedTimeRef.current = new Date(data.notifications[0].createdAt);
          }
        }
      } catch (err) {
        console.error("Failed to poll notifications:", err);
      }
    };

    // Initial load
    fetchNotifications(true);

    // Poll every 15 seconds
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <Loader2 className="h-10 w-10 animate-spin text-gold-500" />
      </div>
    );
  }

  // Sidebar items mapped to icons
  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["support", "manager", "admin"] },
    { id: "customers", label: "Customers", icon: Users, roles: ["support", "manager", "admin"] },
    { id: "orders", label: "Orders", icon: ShoppingBag, roles: ["support", "manager", "admin"] },
    { id: "products", label: "Products & Stock", icon: Package, roles: ["support", "manager", "admin"] },
    { id: "marketing", label: "Marketing Hub", icon: Megaphone, roles: ["manager", "admin"] },
    { id: "analytics", label: "Deep Analytics", icon: BarChart3, roles: ["manager", "admin"] },
    { id: "integrations", label: "Integrations", icon: LinkIcon, roles: ["admin"] },
    { id: "settings", label: "Settings & Logs", icon: Settings, roles: ["admin"] },
  ];

  // Filter items user has permission to see
  const visibleItems = sidebarItems.filter(item => item.roles.includes(user.role));

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView onNavigate={setActiveTab} />;
      case "customers":
        return <CustomersView />;
      case "orders":
        return <OrdersView />;
      case "products":
        return <ProductsView />;
      case "marketing":
        return <MarketingView />;
      case "analytics":
        return <AnalyticsView />;
      case "integrations":
        return <IntegrationsView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={setActiveTab} />;
    }
  };

  const getToastIcon = (action: string) => {
    if (action === "Low Stock Alert") return <AlertTriangle className="h-5 w-5 text-crimson-400" />;
    if (action === "Order Synced") return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
    return <Info className="h-5 w-5 text-gold-400" />;
  };

  const getToastHeaderColor = (action: string) => {
    if (action === "Low Stock Alert") return "border-crimson-500/30 bg-crimson-500/10";
    if (action === "Order Synced") return "border-emerald-500/30 bg-emerald-500/10";
    return "border-gold-500/30 bg-gold-500/10";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      
      {/* Real-time Toasts Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`flex items-start gap-3 p-4 rounded-xl border glass-card shadow-2xl animate-in slide-in-from-bottom-5 duration-300 ${getToastHeaderColor(toast.action)}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getToastIcon(toast.action)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white tracking-wide uppercase">
                {toast.action}
              </p>
              <p className="text-sm text-slate-300 mt-1 leading-normal">
                {toast.details}
              </p>
            </div>
            <button 
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-500 hover:text-slate-300 focus:outline-none flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Sidebar - Desktop Layout */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 border-r border-slate-800/80 flex-shrink-0">
        <div className="flex items-center h-16 px-6 border-b border-slate-800/60 gap-2">
          <Sparkles className="h-6 w-6 text-gold-400 animate-pulse" />
          <h1 className="text-xl font-bold font-serif tracking-wider text-white">
            Lumière <span className="gold-gradient-text text-sm font-sans uppercase font-extrabold ml-1">CRM</span>
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  active
                    ? "bg-slate-800 text-gold-400 border-l-2 border-gold-500 shadow-md shadow-gold-500/5"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-gold-400" : "text-slate-500"}`} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Staff footer */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 border border-slate-700">
              <UserIcon className="h-5 w-5 text-gold-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/50 hover:bg-crimson-600/10 text-slate-400 hover:text-crimson-400 border border-slate-800 hover:border-crimson-500/20 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            End Session
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          {/* Backdrop overlay */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
          
          <aside className="relative flex flex-col w-64 max-w-xs bg-slate-900 border-r border-slate-800 h-full z-50">
            <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gold-400" />
                <h1 className="text-lg font-bold font-serif text-white">Lumière CRM</h1>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "bg-slate-800 text-gold-400 border-l-2 border-gold-500"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800">
                  <UserIcon className="h-5 w-5 text-gold-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                </div>
              </div>
              <button 
                onClick={logout}
                className="flex w-full items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-400 hover:text-crimson-400 hover:bg-crimson-600/10 border border-slate-800 transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                End Session
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        
        {/* Top Header Panel */}
        <header className="flex items-center justify-between h-16 px-6 bg-slate-900/60 border-b border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-slate-200 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-bold text-white tracking-wide uppercase font-sans">
              {sidebarItems.find(item => item.id === activeTab)?.label || "Workspace"}
            </h2>
          </div>

          <div className="flex items-center gap-4 relative">
            
            {/* Notifications Alert Dropdown */}
            <button 
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="relative p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all focus:outline-none cursor-pointer"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
                </span>
              )}
            </button>

            {showNotificationsDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setShowNotificationsDropdown(false)}
                ></div>
                <div className="absolute right-0 top-12 z-30 w-80 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                    <span className="text-sm font-semibold text-white">System Events Alerts</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-gold-400 border border-slate-700">
                      Live
                    </span>
                  </div>
                  <div className="mt-3 max-h-64 overflow-y-auto space-y-3 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">No recent system events.</p>
                    ) : (
                      notifications.map((log) => (
                        <div key={log.id} className="text-xs bg-slate-950/40 border border-slate-800/40 p-2.5 rounded-xl">
                          <div className="flex justify-between font-semibold text-slate-300">
                            <span className="uppercase text-[10px] text-gold-400">{log.action}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-400 mt-1 leading-normal">{log.details}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Profile Tag */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700/80 rounded-xl">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-semibold text-slate-300 truncate tracking-wide uppercase max-w-[120px]">
                {user.role} Session
              </span>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
}
