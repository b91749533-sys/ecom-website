"use client";

import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [newsletter, setNewsletter] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "contact", ...form }),
    });
    const data = await res.json();

    setStatus({
      type: data.success ? "success" : "error",
      message: data.success ? "Message sent! We'll be in touch soon." : data.error,
    });
    if (data.success) setForm({ name: "", email: "", subject: "", message: "" });
    setLoading(false);
  };

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "newsletter", email: newsletter }),
    });
    const data = await res.json();
    setStatus({
      type: data.success ? "success" : "error",
      message: data.success ? "Subscribed to our newsletter!" : data.error,
    });
    if (data.success) setNewsletter("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <div className="text-center mb-14">
        <p className="text-gold tracking-[0.3em] uppercase text-sm mb-3">Get in Touch</p>
        <h1 className="text-4xl md:text-5xl font-display font-light text-charcoal">
          Contact Us
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="space-y-8">
          <div className="flex gap-4">
            <Mail className="w-5 h-5 text-gold shrink-0 mt-1" />
            <div>
              <h3 className="text-sm tracking-widest uppercase text-charcoal mb-1">Email</h3>
              <p className="text-muted text-sm">concierge@lumiere.com</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Phone className="w-5 h-5 text-gold shrink-0 mt-1" />
            <div>
              <h3 className="text-sm tracking-widest uppercase text-charcoal mb-1">Phone</h3>
              <p className="text-muted text-sm">+1 (800) 555-LUME</p>
            </div>
          </div>
          <div className="flex gap-4">
            <MapPin className="w-5 h-5 text-gold shrink-0 mt-1" />
            <div>
              <h3 className="text-sm tracking-widest uppercase text-charcoal mb-1">Boutique</h3>
              <p className="text-muted text-sm">
                742 Fifth Avenue<br />New York, NY 10019
              </p>
            </div>
          </div>

          <div className="bg-charcoal text-cream p-6">
            <h3 className="font-display text-xl mb-3">Newsletter</h3>
            <p className="text-cream/70 text-sm mb-4">
              Be the first to know about new arrivals and exclusive offers.
            </p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="Your email"
                value={newsletter}
                onChange={(e) => setNewsletter(e.target.value)}
                className="flex-1 px-3 py-2 text-sm text-charcoal focus:outline-none"
              />
              <button
                type="submit"
                className="bg-gold hover:bg-gold-light text-charcoal px-4 py-2 text-xs tracking-widest uppercase transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <form onSubmit={handleContact} className="lg:col-span-2 space-y-5">
          {status && (
            <p
              className={`text-sm p-3 border ${
                status.type === "success"
                  ? "bg-green-50 border-green-100 text-green-700"
                  : "bg-red-50 border-red-100 text-red-700"
              }`}
            >
              {status.message}
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-widest uppercase text-muted mb-2">
                Name
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-charcoal/10 focus:border-gold focus:outline-none text-sm"
              />
            </div>
            <div>
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
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-muted mb-2">
              Subject
            </label>
            <input
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-4 py-3 border border-charcoal/10 focus:border-gold focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-muted mb-2">
              Message
            </label>
            <textarea
              required
              rows={6}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-4 py-3 border border-charcoal/10 focus:border-gold focus:outline-none text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-charcoal hover:bg-gold text-white px-8 py-4 text-sm tracking-widest uppercase transition-colors disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
