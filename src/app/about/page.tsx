export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <div className="text-center mb-16">
        <p className="text-gold tracking-[0.3em] uppercase text-sm mb-3">Our Story</p>
        <h1 className="text-4xl md:text-5xl font-display font-light text-charcoal">
          The Art of Lumière
        </h1>
      </div>

      <div className="prose prose-lg max-w-none text-muted leading-relaxed space-y-6">
        <p>
          Founded on the belief that fragrance is the most intimate form of self-expression,
          Lumière Parfums curates only the world&apos;s most exceptional scents. From the
          sun-drenched citrus of the Mediterranean to the smoky leather of a Parisian atelier,
          each bottle in our collection represents a journey.
        </p>
        <p>
          We partner exclusively with authorized distributors to guarantee authenticity.
          Every fragrance — whether a timeless Dior classic or a rare Xerjoff creation —
          arrives in pristine condition, ready to become part of your story.
        </p>
        <p>
          Our team of fragrance specialists is passionate about helping you discover scents
          that resonate with your personality, your moments, and your memories. Because the
          right fragrance doesn&apos;t just smell beautiful — it transforms how you feel.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-8 mt-16 text-center">
        <div>
          <p className="text-4xl font-display text-gold mb-2">10+</p>
          <p className="text-sm tracking-widest uppercase text-muted">Curated Fragrances</p>
        </div>
        <div>
          <p className="text-4xl font-display text-gold mb-2">100%</p>
          <p className="text-sm tracking-widest uppercase text-muted">Authentic Products</p>
        </div>
        <div>
          <p className="text-4xl font-display text-gold mb-2">30</p>
          <p className="text-sm tracking-widest uppercase text-muted">Day Returns</p>
        </div>
      </div>
    </div>
  );
}
