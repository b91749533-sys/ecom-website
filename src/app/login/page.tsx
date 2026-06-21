"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 lg:py-24">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-display font-light text-charcoal mb-2">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-muted text-sm">
          {mode === "login"
            ? "Sign in to track orders and manage your account"
            : "Join Lumière for exclusive access"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="text-red-600 text-sm bg-red-50 p-3 border border-red-100">
            {error}
          </p>
        )}

        {mode === "register" && (
          <div>
            <label className="block text-xs tracking-widest uppercase text-muted mb-2">
              Full Name
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 border border-charcoal/10 focus:border-gold focus:outline-none text-sm"
            />
          </div>
        )}

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

        <div>
          <label className="block text-xs tracking-widest uppercase text-muted mb-2">
            Password
          </label>
          <input
            required
            type="password"
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-3 border border-charcoal/10 focus:border-gold focus:outline-none text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-charcoal hover:bg-gold text-white py-4 text-sm tracking-widest uppercase transition-colors disabled:opacity-50"
        >
          {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm text-muted mt-6">
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              onClick={() => setMode("register")}
              className="text-gold hover:text-charcoal transition-colors"
            >
              Register
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              onClick={() => setMode("login")}
              className="text-gold hover:text-charcoal transition-colors"
            >
              Sign In
            </button>
          </>
        )}
      </p>

      {mode === "login" && (
        <p className="text-center text-xs text-muted mt-8 p-4 bg-cream">
          Admin demo: admin@lumiere.com / admin123
        </p>
      )}

      <p className="text-center mt-4">
        <Link href="/shop" className="text-sm text-muted hover:text-gold">
          Continue as guest
        </Link>
      </p>
    </div>
  );
}
