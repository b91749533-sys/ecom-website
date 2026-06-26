"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, Sparkles } from "lucide-react";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!email || !password) {
      setError("Please fill in all fields.");
      setIsSubmitting(false);
      return;
    }

    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || "Invalid credentials.");
      setIsSubmitting(false);
    }
  };

  if (loading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <Loader2 className="h-10 w-10 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background radial gradients for ambient lighting */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/5 blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-gold-400/5 blur-[120px]"></div>

      <div className="w-full max-w-md space-y-8 z-10">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 border border-gold-500/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
            <Sparkles className="h-6 w-6 text-gold-400" />
          </div>
          <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-white font-serif">
            Lumière <span className="gold-gradient-text">CRM</span>
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Luxury Fragrance House Control Center
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 border border-slate-800">
          <h3 className="text-lg font-medium text-slate-200 mb-6 text-center">
            Staff Portal Authentication
          </h3>

          {error && (
            <div className="mb-4 rounded-lg bg-crimson-600/10 border border-crimson-500/20 p-3 text-sm text-crimson-400">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Work Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/50 transition-colors"
                  placeholder="admin@lumiere-crm.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Secure Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/50 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 py-3 px-4 text-sm font-semibold text-slate-950 focus:outline-none transition-all disabled:opacity-50 cursor-pointer shadow-[0_4px_20px_rgba(212,175,55,0.15)]"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Authenticate Session"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-800/60 pt-4 text-center">
            <p className="text-xs text-slate-500 leading-relaxed">
              Protected Environment. Unauthorized access or actions will be recorded in the chronological Audit Logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
