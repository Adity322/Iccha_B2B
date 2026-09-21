'use client';

import React, { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ShoppingBag,
  X,
  RotateCcw,
  Boxes,
  Loader2
} from 'lucide-react';
import RetailerHeader from '@/components/layout/RetailerHeader';
import Footer from '@/components/layout/Footer';
import RetailerProductCard from '@/components/product/RetailerProductCard';

interface Category {
  id: string;
  name: string;
}

interface RetailerProduct {
  id: string;
  sku: string;
  designNumber: string;
  name: string;
  slug: string;
  categoryId: string;
  category?: { name: string };
  sellerName: string;
  wholesalePricePerPiece: string | number;
  piecesPerSet: number;
  wholesalePricePerSet: string | number;
  availableSets: number;
  sizeCombination: string;
  fabric: string;
  workType: string;
  style: string;
  clothingType: string;
  media?: { mediaAsset: { publicUrl: string } }[];
}

interface CartSummary {
  totalSets: number;
  totalDesigns: number;
  subtotal: string;
  items: { productId: string; sets: number }[];
}

function RetailerCatalogueContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<RetailerProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);
  const isFetchingRef = useRef(false);

  const refreshCart = useCallback(() => {
    fetch('/api/retailer/cart')
      .then(res => res.json())
      .then(json => {
        if (json.success) setCartSummary(json.data);
      })
      .catch(() => {
        // Cart pill will just show nothing / stay stale until next successful refresh.
      });
  }, []);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(json => {
        if (json.success) setCategories(json.data);
      })
      .catch(() => {
        // Category filter list will just be empty.
      });
    refreshCart();
  }, [refreshCart]);

  const loadProducts = useCallback(async (categoryId: string, searchTerm: string, cursor?: string) => {
    const requestId = ++requestIdRef.current;
    isFetchingRef.current = true;
    if (cursor) setLoadingMore(true); else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (categoryId !== 'all') params.set('categoryId', categoryId);
      if (searchTerm) params.set('search', searchTerm);
      if (cursor) params.set('cursor', cursor);

      const res = await fetch(`/api/retailer/products?${params.toString()}`);
      const json = await res.json();

      // A newer request started (filter/search changed) - drop this response
      if (requestId !== requestIdRef.current) return;

      if (json.success) {
        setProducts(prev => (cursor ? [...prev, ...json.data] : json.data));
        setNextCursor(json.nextCursor);
      }
    } catch {
      // Leave existing products in place.
    } finally {
      if (requestId === requestIdRef.current) {
        isFetchingRef.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    setNextCursor(null);
    loadProducts(selectedCategory, appliedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // Infinite scroll: load the next page when the sentinel enters the viewport
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !nextCursor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingRef.current) {
          loadProducts(selectedCategory, appliedSearch, nextCursor);
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [nextCursor, selectedCategory, appliedSearch, loading, loadingMore, loadProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = search.trim();
    setAppliedSearch(term);
    setNextCursor(null);
    loadProducts(selectedCategory, term);
  };

  const clearSearch = () => {
    setSearch('');
    setAppliedSearch('');
    setNextCursor(null);
    loadProducts(selectedCategory, '');
  };

  const resetFilters = () => {
    setSearch('');
    setAppliedSearch('');
    setNextCursor(null);
    if (selectedCategory !== 'all') {
      setSelectedCategory('all'); // the effect above triggers the reload
    } else {
      loadProducts('all', '');
    }
  };

  const activeFiltersCount = [
    selectedCategory !== 'all',
    search.trim().length > 0
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col min-h-screen">
      <RetailerHeader />

      <main className="flex-1 py-8 bg-[#faf8f5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-5">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <nav className="text-xs text-stone-500 mb-1 flex items-center gap-2">
                <Link href="/retailer" className="hover:text-stone-900">Retailer Portal</Link>
                <span>/</span>
                <span className="text-stone-900 font-semibold">Wholesale Catalogue</span>
              </nav>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Live Wholesale Kurti Catalogue
              </h1>
            </div>

            <Link
              href="/retailer/cart"
              className="self-start sm:self-center inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-stone-300 hover:border-rose-400 shadow-sm text-xs font-semibold text-stone-800 transition"
            >
              <ShoppingBag className="w-4 h-4 text-[#831843]" />
              <span>Cart: <strong>{cartSummary?.totalSets ?? 0} Sets</strong></span>
              <span className="font-mono text-rose-900 font-bold">
                ₹{Number(cartSummary?.subtotal ?? 0).toLocaleString('en-IN')}
              </span>
            </Link>
          </div>

          <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by Design No, SKU, Fabric..."
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-rose-900 font-medium"
              />
              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button type="submit" className="px-4 py-2.5 bg-stone-900 text-white rounded-xl font-bold">
                Search
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className="md:hidden px-3.5 py-2.5 bg-stone-900 text-white rounded-xl font-semibold flex items-center gap-1.5"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

            <aside className={`md:col-span-3 bg-white rounded-xl px-4 py-6 border border-stone-200 space-y-3 text-xs shadow-sm md:sticky md:top-52 ${
              isMobileFilterOpen ? 'block' : 'hidden md:block'
            }`}>

              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <span className="font-serif text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-[#831843]" /> Filter Catalogue
                </span>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-[11px] text-rose-900 font-semibold hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-500 uppercase tracking-wider text-[10px] block">
                  Category ({categories.length})
                </label>
                <div className="max-h-96 overflow-y-auto space-y-0.5 -mx-1 pr-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-2.5 py-1 rounded-md transition text-xs ${
                      selectedCategory === 'all'
                        ? 'bg-stone-900 text-white font-semibold'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCategory(c.id)}
                      className={`w-full text-left px-2.5 py-1 rounded-md transition text-xs ${
                        selectedCategory === c.id
                          ? 'bg-[#831843] text-white font-semibold'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <span className="block truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

            </aside>

            <div className="md:col-span-9 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-stone-500 gap-4">
                <span>Showing <strong>{products.length}</strong> wholesale kurti designs</span>
                <span>Standard Lot Ratio: M (38), L (40), XL (42), XXL (44)</span>
              </div>

              {loading ? (
                <div className="p-16 bg-white rounded-3xl border border-stone-200 text-center text-xs text-stone-500">
                  Loading live wholesale inventory...
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <RetailerProductCard
                        key={product.id}
                        product={product}
                        cartItem={cartSummary?.items.find(i => i.productId === product.id)}
                        onCartChanged={refreshCart}
                      />
                    ))}
                  </div>

                  {nextCursor ? (
                    <div ref={sentinelRef} className="flex justify-center items-center py-6 h-16">
                      {loadingMore && (
                        <span className="inline-flex items-center gap-2 text-xs text-stone-500">
                          <Loader2 className="w-4 h-4 animate-spin" /> Loading more designs...
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-[11px] text-stone-400 py-6">
                      You&apos;ve reached the end of the catalogue
                    </p>
                  )}
                </>
              ) : (
                <div className="p-16 bg-white rounded-3xl border border-stone-200 text-center space-y-3">
                  <Boxes className="w-10 h-10 text-stone-300 mx-auto" />
                  <h4 className="font-serif text-lg font-bold text-stone-800">No designs match your filters</h4>
                  <p className="text-xs text-stone-500">Try clearing one or more filters or searching by a different term.</p>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-[#831843] text-white text-xs font-semibold rounded-xl shadow"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function RetailerCataloguePage() {
  return (
    <Suspense fallback={null}>
      <RetailerCatalogueContent />
    </Suspense>
  );
}