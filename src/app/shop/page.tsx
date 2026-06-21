"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard, { Product } from "@/components/ProductCard";
import { Search, SlidersHorizontal } from "lucide-react";

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<{ categories: string[]; genders: string[] }>({
    categories: [],
    genders: [],
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [gender, setGender] = useState(searchParams.get("gender") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "featured");
  const [featured, setFeatured] = useState(searchParams.get("featured") === "true");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setFeatured(searchParams.get("featured") === "true");
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (gender) params.set("gender", gender);
    if (sort) params.set("sort", sort);
    if (featured) params.set("featured", "true");

    setLoading(true);
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.data.products);
          setFilters(data.data.filters);
        }
      })
      .finally(() => setLoading(false));
  }, [search, category, gender, sort, featured]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="text-center mb-12">
        <p className="text-gold tracking-[0.3em] uppercase text-sm mb-3">Collection</p>
        <h1 className="text-4xl md:text-5xl font-display font-light text-charcoal">
          {featured ? "Bestsellers" : "All Fragrances"}
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search fragrances, brands, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-charcoal/10 bg-white focus:border-gold focus:outline-none text-sm"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-3 border border-charcoal/10 bg-white text-sm focus:border-gold focus:outline-none"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="name">Name A-Z</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-3 border border-charcoal/10 bg-white text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        <aside
          className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-56 shrink-0 space-y-6`}
        >
          <div>
            <h3 className="text-xs tracking-widest uppercase text-muted mb-3">Category</h3>
            <div className="space-y-2">
              <button
                onClick={() => setCategory("")}
                className={`block text-sm w-full text-left ${!category ? "text-gold" : "text-charcoal/70 hover:text-gold"}`}
              >
                All
              </button>
              {filters.categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`block text-sm w-full text-left ${category === cat ? "text-gold" : "text-charcoal/70 hover:text-gold"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs tracking-widest uppercase text-muted mb-3">Gender</h3>
            <div className="space-y-2">
              <button
                onClick={() => setGender("")}
                className={`block text-sm w-full text-left ${!gender ? "text-gold" : "text-charcoal/70 hover:text-gold"}`}
              >
                All
              </button>
              {filters.genders.map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`block text-sm w-full text-left ${gender === g ? "text-gold" : "text-charcoal/70 hover:text-gold"}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="accent-gold"
              />
              Featured only
            </label>
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-cream animate-pulse rounded-sm" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-muted py-20">No fragrances found.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted">Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}
