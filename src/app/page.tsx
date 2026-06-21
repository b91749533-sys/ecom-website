import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { ArrowRight, Sparkles, Shield, Truck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await prisma.product.findMany({
    where: { featured: true, inStock: true },
    take: 6,
  });

  return (
    <>
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1541643600914-78b084683601?w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <p className="text-gold-light tracking-[0.4em] uppercase text-sm mb-6">
            Luxury Fragrance House
          </p>
          <h1 className="text-5xl md:text-7xl font-display font-light mb-6 text-balance">
            Discover Your Signature Scent
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            A curated collection of the world&apos;s most coveted fragrances —
            from timeless classics to modern masterpieces.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-charcoal px-8 py-4 text-sm tracking-widest uppercase font-medium transition-colors"
            >
              Explore Collection
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/shop?featured=true"
              className="inline-flex items-center justify-center gap-2 border border-white/40 hover:border-gold hover:text-gold px-8 py-4 text-sm tracking-widest uppercase transition-colors"
            >
              View Bestsellers
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-charcoal text-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="flex flex-col items-center">
              <Sparkles className="w-8 h-8 text-gold mb-4" />
              <h3 className="font-display text-xl mb-2">Curated Selection</h3>
              <p className="text-cream/70 text-sm leading-relaxed">
                Only the finest designer and niche fragrances, handpicked by experts.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="w-8 h-8 text-gold mb-4" />
              <h3 className="font-display text-xl mb-2">100% Authentic</h3>
              <p className="text-cream/70 text-sm leading-relaxed">
                Every bottle sourced from authorized distributors with guaranteed authenticity.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Truck className="w-8 h-8 text-gold mb-4" />
              <h3 className="font-display text-xl mb-2">Complimentary Shipping</h3>
              <p className="text-cream/70 text-sm leading-relaxed">
                Free standard shipping on all orders over $150.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-gold tracking-[0.3em] uppercase text-sm mb-3">
              Featured Collection
            </p>
            <h2 className="text-4xl md:text-5xl font-display font-light text-charcoal">
              Bestselling Fragrances
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm tracking-widest uppercase text-charcoal hover:text-gold transition-colors border-b border-charcoal hover:border-gold pb-1"
            >
              View All Fragrances
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gold tracking-[0.3em] uppercase text-sm mb-3">
                The Art of Perfumery
              </p>
              <h2 className="text-4xl font-display font-light text-charcoal mb-6">
                Where Craft Meets Emotion
              </h2>
              <p className="text-muted leading-relaxed mb-6">
                Fragrance is the invisible accessory that leaves the deepest impression.
                At Lumière, we believe every scent tells a story — of confidence, romance,
                adventure, or quiet elegance.
              </p>
              <p className="text-muted leading-relaxed mb-8">
                Our collection spans iconic designer houses and revered niche ateliers,
                each bottle a testament to the perfumer&apos;s art and your personal expression.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm tracking-widest uppercase text-gold hover:text-charcoal transition-colors"
              >
                Learn Our Story
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div
              className="aspect-[4/5] bg-cover bg-center rounded-sm"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80')",
              }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
