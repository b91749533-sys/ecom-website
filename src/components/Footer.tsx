import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <h3 className="text-3xl font-display font-semibold mb-4">Lumière</h3>
            <p className="text-cream/70 max-w-md leading-relaxed">
              Curating the world&apos;s most coveted fragrances. From iconic designer
              classics to rare niche masterpieces, every scent tells a story.
            </p>
          </div>

          <div>
            <h4 className="text-sm tracking-widest uppercase text-gold mb-4">Explore</h4>
            <ul className="space-y-2 text-cream/70">
              <li><Link href="/shop" className="hover:text-gold transition-colors">All Fragrances</Link></li>
              <li><Link href="/shop?featured=true" className="hover:text-gold transition-colors">Bestsellers</Link></li>
              <li><Link href="/about" className="hover:text-gold transition-colors">Our Story</Link></li>
              <li><Link href="/contact" className="hover:text-gold transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm tracking-widest uppercase text-gold mb-4">Service</h4>
            <ul className="space-y-2 text-cream/70">
              <li>Free shipping over $150</li>
              <li>Authenticity guaranteed</li>
              <li>30-day returns</li>
              <li>Expert consultations</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cream/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-cream/50 text-sm">
            &copy; {new Date().getFullYear()} Lumière Parfums. All rights reserved.
          </p>
          <p className="text-cream/50 text-sm">
            Prices reflect authorized retail MSRP
          </p>
        </div>
      </div>
    </footer>
  );
}
