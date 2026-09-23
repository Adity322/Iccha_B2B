import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Building2, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Package, 
  Filter, 
  Layers 
} from 'lucide-react';
import PublicHeader from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';
import { CategoryService } from '@/lib/services';
import { PublicCatalogService } from '@/lib/services/publicCatalog';

export default async function CategoriesPage() {
  const categories = await PublicCatalogService.getCategories();

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      <main className="flex-1 py-12 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <nav className="text-xs text-stone-500 mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-stone-900">Home</Link>
            <span>/</span>
            <span className="text-stone-900 font-semibold">Categories</span>
          </nav>

          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#e7dfd5] shadow-sm mb-10">
            <div className="max-w-3xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#831843] block">
                Wholesale Product Lines
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
                {categories.length} Categories
              </h1>
              <p className="text-sm text-stone-600 leading-relaxed">
                Browse our complete wholesale directory of stitched 2-piece and 3-piece kurti sets. All categories are manufactured in-house across our Surat and Jaipur production facilities.
              </p>
              
            </div>
          </div>

          {/* 20 Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="group bg-white rounded-2xl border border-[#e7dfd5] hover:border-rose-300 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
              >
                {/* Visual Thumbnail */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />

                  {/* Clothing Type Badge */}
                  <div className="absolute top-3 right-3 bg-white/90 text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    {category.type === '3_piece' ? '3-Pc Set' : category.type === '2_piece' ? '2-Pc Set' : 'Kurti Lot'}
                  </div>
                    <h3 className="absolute bottom-3 left-3 text-white text-xl font-serif line-clamp-2 font-bold leading-tight mt-0.5">
                      {category.name}
                    </h3>
                </div>

                {/* Category Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                      {category.description}
                    </p>
                                <div className="text-white">
                    <span className="text-[10px] font-bold uppercase text-amber-300 tracking-wider block">
                      {category.itemCount}+ Available Designs
                    </span>
                  </div>
                    {/* Subcategory Pills */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {category.subcategories.slice(0, 3).map((sub, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-medium"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <Link
                      href={`/categories/${category.slug}`}
                      className="text-xs font-bold text-[#831843] group-hover:text-rose-700 flex items-center gap-1 transition"
                    >
                      <span>Representative Catalogue</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
