import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <h1 className="text-6xl font-display text-charcoal mb-4">404</h1>
      <p className="text-muted mb-8">This fragrance could not be found.</p>
      <Link
        href="/shop"
        className="inline-block bg-charcoal text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-gold transition-colors"
      >
        Back to Shop
      </Link>
    </div>
  );
}
