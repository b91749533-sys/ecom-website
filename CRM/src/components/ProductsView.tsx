"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Search, 
  Plus, 
  X,
  Package,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Tag,
  Boxes,
  Info,
  DollarSign
} from "lucide-react";

interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string;
  notes: string;
  category: string;
  gender: string;
  concentration: string;
  size: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  inStock: boolean;
  stockLevel: number;
  minStockThreshold: number;
  soldCount: number;
  revenue: number;
}

export default function ProductsView() {
  const { user } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockStatus, setStockStatus] = useState("");

  // Edit stock modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState(0);
  const [editStockLevel, setEditStockLevel] = useState(0);
  const [editThreshold, setEditThreshold] = useState(0);
  const [editFeatured, setEditFeatured] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Manual Product Creation Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    brand: "",
    slug: "",
    price: "",
    size: "100ml",
    category: "Woody Aromatic",
    notes: "",
    description: "",
    gender: "Unisex",
    concentration: "Eau de Parfum",
    stockLevel: "50",
    minStockThreshold: "10",
    image: "",
    featured: false
  });
  const [createError, setCreateError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        let filtered = data.products;

        if (search) {
          const q = search.toLowerCase();
          filtered = filtered.filter((p: Product) => 
            p.name.toLowerCase().includes(q) || 
            p.brand.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
          );
        }

        if (categoryFilter) {
          filtered = filtered.filter((p: Product) => p.category === categoryFilter);
        }

        if (stockStatus) {
          if (stockStatus === "low") {
            filtered = filtered.filter((p: Product) => p.stockLevel <= p.minStockThreshold && p.stockLevel > 0);
          } else if (stockStatus === "out") {
            filtered = filtered.filter((p: Product) => p.stockLevel === 0);
          } else if (stockStatus === "healthy") {
            filtered = filtered.filter((p: Product) => p.stockLevel > p.minStockThreshold);
          }
        }

        setProducts(filtered);
      }
    } catch (err) {
      console.error("Failed to load catalog products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, stockStatus]);

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditPrice(product.price);
    setEditStockLevel(product.stockLevel);
    setEditThreshold(product.minStockThreshold);
    setEditFeatured(product.featured);
  };

  const handleSaveInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: editPrice,
          stockLevel: editStockLevel,
          minStockThreshold: editThreshold,
          featured: editFeatured,
        }),
      });

      if (res.ok) {
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (err) {
      console.error("Failed to save inventory updates:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setIsCreating(true);

    // Auto-generate slug if empty
    let finalSlug = createForm.slug.trim();
    if (!finalSlug) {
      finalSlug = `${createForm.brand.toLowerCase()}-${createForm.name.toLowerCase()}`
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createForm,
          slug: finalSlug,
          price: parseFloat(createForm.price),
          stockLevel: parseInt(createForm.stockLevel),
          minStockThreshold: parseInt(createForm.minStockThreshold),
          image: createForm.image || `/products/${finalSlug}.jpg` // fallback placeholder
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowCreateModal(false);
        setCreateForm({
          name: "",
          brand: "",
          slug: "",
          price: "",
          size: "100ml",
          category: "Woody Aromatic",
          notes: "",
          description: "",
          gender: "Unisex",
          concentration: "Eau de Parfum",
          stockLevel: "50",
          minStockThreshold: "10",
          image: "",
          featured: false
        });
        fetchProducts();
      } else {
        setCreateError(data.error || "Failed to create product.");
      }
    } catch (err) {
      console.error("Manual product creation error:", err);
      setCreateError("Connection error. Try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const getCategories = () => {
    const all = products.map((p) => p.category);
    return [...new Set(all)];
  };

  const getStockTag = (product: Product) => {
    if (product.stockLevel === 0) {
      return <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-crimson-600/10 text-crimson-400 border border-crimson-500/25">Out of Stock</span>;
    }
    if (product.stockLevel <= product.minStockThreshold) {
      return <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-crimson-500/10 text-crimson-400 border border-crimson-500/20 animate-pulse">Low Stock ({product.stockLevel})</span>;
    }
    return <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-600/10 text-emerald-400 border border-emerald-500/15">Stock: {product.stockLevel}</span>;
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Actions Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-slate-900/40 border border-slate-850 p-4 rounded-2xl">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product, brand..."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/40"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <Tag className="h-3.5 w-3.5 text-slate-500" />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-slate-300 w-full focus:outline-none cursor-pointer"
            >
              <option value="">All Categories</option>
              <option value="Woody Aromatic">Woody Aromatic</option>
              <option value="Fruity Woody">Fruity Woody</option>
              <option value="Woody Amber Floral">Woody Amber Floral</option>
              <option value="Leather">Leather</option>
              <option value="Fresh Woody">Fresh Woody</option>
              <option value="Aquatic Aromatic">Aquatic Aromatic</option>
              <option value="Oriental Spicy">Oriental Spicy</option>
              <option value="Woody Oriental">Woody Oriental</option>
              <option value="Gourmand Tobacco">Gourmand Tobacco</option>
            </select>
          </div>

          {/* Stock Status Filter */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <Boxes className="h-3.5 w-3.5 text-slate-500" />
            <select 
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
              className="bg-transparent text-slate-300 w-full focus:outline-none cursor-pointer"
            >
              <option value="">All Stock Levels</option>
              <option value="low">Low Stock Alerts</option>
              <option value="out">Out of Stock</option>
              <option value="healthy">Healthy Levels</option>
            </select>
          </div>
        </div>

        {(user?.role === "admin" || user?.role === "manager") && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-xs font-semibold text-slate-950 cursor-pointer flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
            New Product
          </button>
        )}
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="p-16 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent mb-2"></div>
          <p className="text-xs text-slate-500">Querying Product Catalog...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="p-16 text-center text-slate-500">
          <Package className="h-12 w-12 text-slate-800 mx-auto mb-3" />
          <p className="text-sm font-semibold">No products found in stock ledger.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const isLowStock = product.stockLevel <= product.minStockThreshold && product.stockLevel > 0;
            const isOutOfStock = product.stockLevel === 0;

            return (
              <div 
                key={product.id}
                className={`glass-card rounded-2xl border p-5 flex flex-col justify-between ${
                  isOutOfStock 
                    ? "border-slate-850 opacity-60" 
                    : isLowStock 
                    ? "border-crimson-500/30" 
                    : "border-slate-800"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate pr-2">{product.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{product.brand} • {product.size}</p>
                    </div>
                    <div>
                      {getStockTag(product)}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-500">Retail Price</p>
                      <p className="text-sm font-bold text-slate-200 mt-0.5">${product.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-500">Min. Warning</p>
                      <p className="text-sm font-semibold text-slate-300 mt-0.5">{product.minStockThreshold} units</p>
                    </div>
                  </div>

                  {/* Performance overlay */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-medium px-1">
                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500">
                      <TrendingUp className="h-3.5 w-3.5 text-gold-400" />
                      Sales Volume
                    </span>
                    <span className="font-bold text-slate-200">{product.soldCount} sold (${product.revenue.toLocaleString()})</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-850 flex justify-between items-center">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider truncate max-w-[120px]">
                    {product.concentration}
                  </div>
                  
                  {(user?.role === "admin" || user?.role === "manager") ? (
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] font-bold text-slate-300 cursor-pointer"
                    >
                      Update Inventory
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-600">Read-Only</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Inventory Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}></div>
          
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl flex flex-col z-50 shadow-2xl p-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                  Adjust Inventory Levels
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">{selectedProduct.brand} • {selectedProduct.name}</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInventory} className="mt-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Retail Price ($)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(parseFloat(e.target.value))}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-8 pr-4 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Stock level (Units)
                </label>
                <input
                  type="number"
                  required
                  value={editStockLevel}
                  onChange={(e) => setEditStockLevel(parseInt(e.target.value))}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Min. Stock Threshold (Alert Warning)
                </label>
                <input
                  type="number"
                  required
                  value={editThreshold}
                  onChange={(e) => setEditThreshold(parseInt(e.target.value))}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                />
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={editFeatured}
                  onChange={(e) => setEditFeatured(e.target.checked)}
                  className="rounded border-slate-800 text-gold-500 focus:ring-0 cursor-pointer h-4 w-4 bg-slate-950"
                />
                <label htmlFor="featured" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Feature this fragrance on store landing page
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-xs font-semibold text-slate-950 cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? "Syncing..." : "Update Storefront Catalog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
          
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl flex flex-col z-50 shadow-2xl max-h-[90vh]">
            <div className="flex justify-between items-center h-14 px-6 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                Insert New Product to Catalog
              </h4>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="flex-1 overflow-y-auto p-6 space-y-4">
              {createError && (
                <div className="rounded-lg bg-crimson-600/10 border border-crimson-500/20 p-3 text-xs text-crimson-400">
                  {createError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={createForm.brand}
                    onChange={(e) => setCreateForm({ ...createForm, brand: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                    placeholder="E.g., Dior, Chanel"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Fragrance Name *</label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                    placeholder="E.g., Sauvage EDP"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={createForm.price}
                    onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                    placeholder="120.00"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Size *</label>
                  <input
                    type="text"
                    required
                    value={createForm.size}
                    onChange={(e) => setCreateForm({ ...createForm, size: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                    placeholder="100ml"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Gender *</label>
                  <select
                    value={createForm.gender}
                    onChange={(e) => setCreateForm({ ...createForm, gender: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-gold-500/40 cursor-pointer"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Category (Family)</label>
                  <input
                    type="text"
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                    placeholder="E.g., Woody Aromatic"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Concentration</label>
                  <input
                    type="text"
                    value={createForm.concentration}
                    onChange={(e) => setCreateForm({ ...createForm, concentration: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                    placeholder="E.g., Eau de Parfum"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={createForm.stockLevel}
                    onChange={(e) => setCreateForm({ ...createForm, stockLevel: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Warning Limit</label>
                  <input
                    type="number"
                    value={createForm.minStockThreshold}
                    onChange={(e) => setCreateForm({ ...createForm, minStockThreshold: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Scent Notes</label>
                <input
                  type="text"
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                  placeholder="E.g., Bergamot, Cedarwood, Ambergris"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white focus:outline-none focus:border-gold-500/40 resize-none"
                  placeholder="Fragrance description..."
                />
              </div>

              <div className="border-t border-slate-800 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-xs font-semibold text-slate-950 cursor-pointer disabled:opacity-50"
                >
                  {isCreating ? "Publishing..." : "Publish Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
