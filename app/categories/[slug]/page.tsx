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
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
                  {category.name}
                </h1>

                <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
                  {category.description}
                </p>

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
