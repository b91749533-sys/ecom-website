"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Link2, 
  Plus, 
  Trash2, 
  Save, 
  X,
  CreditCard,
  Mail,
  Truck,
  Globe,
  Key,
  ShieldCheck,
  CheckCircle,
  XCircle,
  HelpCircle,
  Copy,
  Info
} from "lucide-react";

interface Webhook {
  id: string;
  url: string;
  events: string;
  active: boolean;
  secret: string;
}

interface WebhookLog {
  id: string;
  url: string;
  event: string;
  payload: string;
  statusCode?: number;
  success: boolean;
  responseTime: number;
  createdAt: string;
}

interface Integration {
  id: string;
  provider: string;
  credentials: string;
  enabled: boolean;
}

export default function IntegrationsView() {
  const { user } = useAuth();
  
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Stripe Form
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [stripeKey, setStripeKey] = useState("••••••••••••••••••••");

  // SendGrid Form
  const [sendgridEnabled, setSendgridEnabled] = useState(false);
  const [sendgridKey, setSendgridKey] = useState("••••••••••••••••••••");
  const [sendgridEmail, setSendgridEmail] = useState("");

  // Shippo Form
  const [shippoEnabled, setShippoEnabled] = useState(false);
  const [shippoKey, setShippoKey] = useState("••••••••••••••••••••");

  // Webhook Form Modal
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEvents, setWebhookEvents] = useState<string[]>(["order.created"]);
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);

  // API Key Generation modal
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [apiKeyName, setApiKeyName] = useState("");
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/integrations");
      const data = await res.json();
      if (data.success) {
        setIntegrations(data.integrations);
        setWebhooks(data.webhooks);
        setWebhookLogs(data.webhookLogs);

        // Populate forms
        const stripe = data.integrations.find((i: Integration) => i.provider === "stripe");
        if (stripe) {
          setStripeEnabled(stripe.enabled);
        }

        const sendgrid = data.integrations.find((i: Integration) => i.provider === "sendgrid");
        if (sendgrid) {
          setSendgridEnabled(sendgrid.enabled);
          try {
            const creds = JSON.parse(sendgrid.credentials);
            setSendgridEmail(creds.fromEmail || "");
          } catch {}
        }

        const shippo = data.integrations.find((i: Integration) => i.provider === "shippo");
        if (shippo) {
          setShippoEnabled(shippo.enabled);
        }
      }
    } catch (err) {
      console.error("Failed to load integrations setup:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleSaveIntegration = async (provider: string, enabled: boolean, credentialsObj: any) => {
    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggleIntegration",
          provider,
          enabled,
          credentials: JSON.stringify(credentialsObj),
        }),
      });

      if (res.ok) {
        alert(`${provider.toUpperCase()} configurations saved successfully.`);
        fetchIntegrations();
      }
    } catch (err) {
      console.error(`Failed to save integration ${provider}:`, err);
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl || webhookEvents.length === 0) return;
    setIsCreatingWebhook(true);

    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createWebhook",
          url: webhookUrl,
          events: webhookEvents,
        }),
      });

      if (res.ok) {
        setShowWebhookModal(false);
        setWebhookUrl("");
        setWebhookEvents(["order.created"]);
        fetchIntegrations();
      }
    } catch (err) {
      console.error("Failed to register webhook:", err);
    } finally {
      setIsCreatingWebhook(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webhook subscription?")) return;
    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleteWebhook",
          id,
        }),
      });

      if (res.ok) {
        fetchIntegrations();
      }
    } catch (err) {
      console.error("Failed to delete webhook:", err);
    }
  };

  const handleGenerateApiKey = () => {
    if (!apiKeyName) return;
    setIsGeneratingKey(true);
    setTimeout(() => {
      // Simulate generating a production-grade token
      const newKey = `lum_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      setGeneratedKey(newKey);
      setIsGeneratingKey(false);
    }, 800);
  };

  const handleToggleEvent = (event: string) => {
    setWebhookEvents((prev) => 
      prev.includes(event) 
        ? prev.filter((e) => e !== event) 
        : [...prev, event]
    );
  };

  if (user?.role !== "admin") {
    return (
      <div className="glass-card rounded-2xl p-8 border border-slate-800 text-center">
        <ShieldCheck className="h-12 w-12 text-crimson-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Access Restrained</h3>
        <p className="text-xs text-slate-500 mt-2">Only administrator staff hold permissions to access integrations and API settings.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
          <p className="text-sm text-slate-500 font-medium">Querying Integrations Registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Integrations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Stripe Config */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-950 border border-slate-850 rounded-xl text-emerald-400">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-sans">Stripe Payment</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Frictionless card checkouts</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={stripeEnabled}
                onChange={(e) => setStripeEnabled(e.target.checked)}
                className="rounded border-slate-800 text-gold-500 focus:ring-0 cursor-pointer h-4.5 w-4.5 bg-slate-950"
              />
            </div>

            <div className="space-y-3 text-xs pt-2">
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Stripe Secret Key</label>
                <input
                  type="password"
                  value={stripeKey}
                  onChange={(e) => setStripeKey(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                />
              </div>
            </div>
          </div>

          <div className="pt-5 mt-5 border-t border-slate-850 flex justify-end">
            <button
              onClick={() => handleSaveIntegration("stripe", stripeEnabled, { apiKey: stripeKey })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-[10px] font-bold text-gold-400 border border-slate-800 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              Save Stripe
            </button>
          </div>
        </div>

        {/* SendGrid Config */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-950 border border-slate-850 rounded-xl text-blue-400">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-sans">SendGrid Email</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Marketing emails & newsletters</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={sendgridEnabled}
                onChange={(e) => setSendgridEnabled(e.target.checked)}
                className="rounded border-slate-800 text-gold-500 focus:ring-0 cursor-pointer h-4.5 w-4.5 bg-slate-950"
              />
            </div>

            <div className="space-y-3 text-xs pt-2">
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">SendGrid API Key</label>
                <input
                  type="password"
                  value={sendgridKey}
                  onChange={(e) => setSendgridKey(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Sender Email</label>
                <input
                  type="email"
                  value={sendgridEmail}
                  onChange={(e) => setSendgridEmail(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                  placeholder="noreply@lumiere.com"
                />
              </div>
            </div>
          </div>

          <div className="pt-5 mt-5 border-t border-slate-850 flex justify-end">
            <button
              onClick={() => handleSaveIntegration("sendgrid", sendgridEnabled, { apiKey: sendgridKey, fromEmail: sendgridEmail })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-[10px] font-bold text-gold-400 border border-slate-800 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              Save SendGrid
            </button>
          </div>
        </div>

        {/* Shippo Config */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-950 border border-slate-850 rounded-xl text-purple-400">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-sans">Shippo Logistics</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Real-time shipping labels & rates</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={shippoEnabled}
                onChange={(e) => setShippoEnabled(e.target.checked)}
                className="rounded border-slate-800 text-gold-500 focus:ring-0 cursor-pointer h-4.5 w-4.5 bg-slate-950"
              />
            </div>

            <div className="space-y-3 text-xs pt-2">
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Shippo API Key</label>
                <input
                  type="password"
                  value={shippoKey}
                  onChange={(e) => setShippoKey(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                />
              </div>
            </div>
          </div>

          <div className="pt-5 mt-5 border-t border-slate-850 flex justify-end">
            <button
              onClick={() => handleSaveIntegration("shippo", shippoEnabled, { apiKey: shippoKey })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-[10px] font-bold text-gold-400 border border-slate-800 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              Save Shippo
            </button>
          </div>
        </div>

      </div>

      {/* REST API integration key generator */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans mb-4 flex items-center gap-1.5">
          <Key className="h-4 w-4 text-gold-400" />
          Secure REST API token generator
        </h4>

        {generatedKey ? (
          <div className="p-4 rounded-xl bg-emerald-600/10 border border-emerald-500/25 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                API Token Generated Successfully
              </span>
              <button 
                onClick={() => setGeneratedKey(null)}
                className="text-slate-500 hover:text-slate-300 font-bold"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Copy this token immediately. For security, it will not be displayed again.
            </p>
            <div className="flex bg-slate-950 rounded-xl border border-slate-850 p-3 items-center justify-between font-mono text-xs">
              <span className="text-slate-200 select-all pr-4 break-all">{generatedKey}</span>
              <button 
                onClick={() => { navigator.clipboard.writeText(generatedKey); alert("Copied to clipboard!"); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-gold-400 font-bold hover:bg-slate-850 cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="text-xs text-slate-400 space-y-2">
              <p>Generate secure API keys to integrate custom analytics apps, legacy inventory scripts, or external ERP systems with the CRM's REST API.</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">All requests must include X-CRM-API-Key headers.</p>
            </div>
            
            <div className="flex gap-3">
              <input
                type="text"
                value={apiKeyName}
                onChange={(e) => setApiKeyName(e.target.value)}
                placeholder="Description, e.g., ERP Sync Script"
                className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500/40"
              />
              <button
                onClick={handleGenerateApiKey}
                disabled={!apiKeyName || isGeneratingKey}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-gold-400 border border-slate-700 cursor-pointer disabled:opacity-40"
              >
                {isGeneratingKey ? "Creating..." : "Generate Key"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Webhooks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Registered Webhooks */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-gold-400" />
                Webhooks (Dispatches)
              </h4>
              <button
                onClick={() => setShowWebhookModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-[10px] font-bold text-gold-400 border border-slate-800 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Register
              </button>
            </div>

            <div className="space-y-4">
              {webhooks.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-6">No webhooks registered.</p>
              ) : (
                webhooks.map((wh) => (
                  <div key={wh.id} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-850 flex justify-between items-start gap-4">
                    <div className="min-w-0 text-xs">
                      <p className="font-semibold text-slate-200 truncate pr-2" title={wh.url}>
                        {wh.url}
                      </p>
                      <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold tracking-wider truncate pr-2">
                        {wh.events}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteWebhook(wh.id)}
                      className="text-slate-600 hover:text-crimson-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-850 text-[10px] text-slate-500 leading-normal flex items-start gap-1">
            <Info className="h-4 w-4 text-slate-600 flex-shrink-0" />
            CRM will dispatch POST requests to target webhooks on events like order creations or catalog updates.
          </div>
        </div>

        {/* Webhook logs */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans mb-4">
            Live Webhook Dispatch Logs
          </h4>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30 text-slate-500 text-[9px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Event & URL</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Response Time</th>
                  <th className="py-3 px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
                {webhookLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-600">No webhook events dispatched yet.</td>
                  </tr>
                ) : (
                  webhookLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/10 transition-colors">
                      <td className="py-3 px-4">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-200 uppercase text-[10px] tracking-wide">{log.event}</p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5" title={log.url}>{log.url}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          log.success 
                            ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/25" 
                            : "bg-crimson-600/10 text-crimson-400 border border-crimson-500/25"
                        }`}>
                          {log.success ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {log.statusCode || "ERR"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-400">
                        {log.responseTime} ms
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Webhook Creation Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowWebhookModal(false)}></div>
          
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl flex flex-col z-50 shadow-2xl p-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                Register Webhook Subscription
              </h4>
              <button onClick={() => setShowWebhookModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWebhook} className="mt-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Webhook Target URL *
                </label>
                <input
                  type="url"
                  required
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                  placeholder="https://yourdomain.com/api/webhook-receiver"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Event Triggers *
                </label>
                <div className="space-y-2">
                  {["order.created", "customer.updated", "product.updated"].map((ev) => (
                    <div key={ev} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`event-${ev}`}
                        checked={webhookEvents.includes(ev)}
                        onChange={() => handleToggleEvent(ev)}
                        className="rounded border-slate-800 text-gold-500 focus:ring-0 cursor-pointer h-4 w-4 bg-slate-950"
                      />
                      <label htmlFor={`event-${ev}`} className="text-xs text-slate-300 font-semibold cursor-pointer uppercase tracking-wider">
                        {ev}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowWebhookModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingWebhook}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-xs font-semibold text-slate-950 cursor-pointer disabled:opacity-50"
                >
                  {isCreatingWebhook ? "Registering..." : "Register Webhook"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
