import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  Building2, 
  Sparkles, 
  ArrowLeft, 
  Lock, 
  Layers, 
  ShieldCheck,
  CheckCircle2 
} from 'lucide-react';
import PublicHeader from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';
import PublicProductCard from '@/components/product/PublicProductCard';
// import { CategoryService, ProductService } from '@/lib/services';
import { PublicCatalogService } from '@/lib/services/publicCatalog';

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { slug } = await params;
  const category = await PublicCatalogService.getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = await PublicCatalogService.getProductsByCategory(category.id);

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      <main className="flex-1 py-10 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <nav className="text-xs text-stone-500 mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-stone-900">Home</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-stone-900">Categories</Link>
            <span>/</span>
            <span className="text-stone-900 font-semibold">{category.name}</span>
          </nav>

          {/* Category Banner Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e7dfd5] shadow-sm mb-10 overflow-hidden relative">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              <div className="md:col-span-8 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white ${
                    category.billingEntityId === 'entity_a' ? 'bg-[#831843]' : 'bg-[#9a3412]'
                  }`}>
                    {category.billingEntityId === 'entity_a' ? 'Surat Division (GST Entity A)' : 'Jaipur Division (GST Entity B)'}
                  </span>
                  <span className="text-xs bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full font-medium">
                    {category.type === '3_piece' ? '3-Piece Set' : category.type === '2_piece' ? '2-Piece Set' : 'Kurti Collection'}
                  </span>
                  <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
                    GST Rate: 5% Apparel
                  </span>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
                  {category.name}
                </h1>

                <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
                  {category.description}
                </p>

                {/* Subcategories */}
                <div className="pt-1">
                  <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
                    Subcategories & Cuts:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {category.subcategories.map((sub, idx) => (
                      <span key={idx} className="text-xs bg-stone-50 border border-stone-200 px-3 py-1 rounded-lg text-stone-800 font-medium">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visual Thumbnail */}
              <div className="md:col-span-4 relative aspect-[4/3] rounded-2xl overflow-hidden shadow border border-stone-200">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

            </div>
          </div>

          {/* Wholesale Lock Banner */}
          <div className="p-4 bg-stone-900 text-stone-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 shadow-md">
            <div className="flex items-center gap-3 text-xs">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white block">Representative Designs for {category.name}</strong>
                <span className="text-stone-400">
                  Live inventory lots, size ratios (M-XXL), and wholesale piece prices unlock once your retailer KYC is approved.
                </span>
              </div>
            </div>
            <Link
              href="/register"
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-semibold rounded-xl shadow transition whitespace-nowrap"
            >
              Apply for Retailer Access
            </Link>
          </div>

          {/* Product Listing */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-stone-900">
                Featured Representative Designs ({products.length})
              </h2>
              <Link href="/categories" className="text-xs font-semibold text-rose-900 hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> All Categories
              </Link>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <PublicProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="p-12 bg-white rounded-2xl border border-stone-200 text-center">
                <p className="text-sm text-stone-500">More designs currently in final finishing at our production facility.</p>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
