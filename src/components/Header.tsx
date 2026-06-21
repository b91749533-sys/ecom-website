"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingBag, User, Search } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totals } = useCart();
  const { user } = useAuth();

  const navLinks = [
    { href: "/shop", label: "Shop" },
    { href: "/shop?featured=true", label: "Bestsellers" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-ivory/95 backdrop-blur-md border-b border-gold/20">
      <div className="bg-charcoal text-cream/80 text-center py-1.5 text-xs tracking-widest">
        By Youssef Manssouri
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl lg:text-3xl font-display font-semibold tracking-wide text-charcoal">
              Lumière
            </span>
            <span className="hidden sm:inline text-xs tracking-[0.3em] uppercase text-gold font-medium">
              Parfums
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm tracking-widest uppercase text-charcoal/80 hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 lg:gap-5">
            <Link
              href="/shop"
              className="p-2 text-charcoal/70 hover:text-gold transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>

            <Link
              href={user ? "/account" : "/login"}
              className="p-2 text-charcoal/70 hover:text-gold transition-colors"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </Link>

            <Link
              href="/cart"
              className="relative p-2 text-charcoal/70 hover:text-gold transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totals.itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gold text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {totals.itemCount}
                </span>
              )}
            </Link>

            <button
              className="lg:hidden p-2 text-charcoal"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden border-t border-gold/20 bg-ivory px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-sm tracking-widest uppercase text-charcoal/80 hover:text-gold"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
