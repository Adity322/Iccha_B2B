import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  Instagram, 
  ChevronRight
} from 'lucide-react';
import PublicHeader from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';
import PublicProductCard from '@/components/product/PublicProductCard';
import HeroSection from '@/components/hero/HeroSection';
import { ProductService, CategoryService } from '@/lib/services';

export default async function HomePage() {
  const representativeProducts = await ProductService.getPublicRepresentativeProducts(8);
  const categories = await CategoryService.getCategories();
  const featuredCategories = categories.slice(0, 8);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-page)]">
      <PublicHeader />

      <main className="flex-1">
        
        {/* ========================================================================= */}
        {/* 1. HERO SECTION - Premium WebGL Glass-Refraction Kurta Showcase */}
        {/* ========================================================================= */}
        <HeroSection />

        {/* ========================================================================= */}
        {/* 2. CATEGORY DISCOVERY (20 Categories Grid) */}
        {/* ========================================================================= */}
        <section className="py-20 bg-[var(--bg-page)] shadow-[inset_0_1px_0_rgba(0,0,0,0.03)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="reveal flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 pb-6 border-b border-[var(--border-subtle)]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-[var(--text-subtle)] block mb-2">
                  Catalogue archives — 20 editions
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[var(--text-main)] tracking-tight leading-[1.1]">
                  Wholesale categories <span className="italic font-light text-[var(--text-muted)]">overview</span>
                </h2>
              </div>

              <Link
                href="/categories"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-main)] group pb-0.5 border-b border-[var(--text-main)] transition-opacity duration-200 ease-out hover:opacity-60 rounded-sm"
              >
                <span>View full index (20)</span>
                <ChevronRight className="w-3.5 h-3.5 transform transition-transform duration-200 ease-out group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 lg:gap-x-8 lg:gap-y-12">
              {featuredCategories.map((category, i) => (
                <div
                  key={category.id}
                  className="reveal"
                  style={{ '--reveal-delay': `${(i % 4) * 70}ms` } as React.CSSProperties}
                >
                  <Link
                    href={`/categories/${category.slug}`}
                    className="group flex flex-col rounded-sm"
                  >
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--bg-sand)] mb-3.5 rounded-[var(--radius-sm)]">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <h3 className="font-serif text-[17px] font-medium text-[var(--text-main)] leading-snug mb-0.5">
                      {category.name}
                    </h3>
                    <p className="text-xs text-[var(--text-subtle)]">
                      {category.subcategories[0]}
                    </p>
                    <span className="inline-flex items-center gap-1.5 mt-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-main)] opacity-0 -translate-y-0.5 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-y-0">
                      Examine catalogue
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. REPRESENTATIVE COLLECTION (Sensitive B2B info hidden) */}
        {/* ========================================================================= */}
        <section className="py-20 bg-[var(--bg-muted)] border-t border-[var(--border-subtle)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header Editorial Banner */}
            <div className="reveal mb-12">
              <div className="text-center max-w-xl mx-auto py-4">
                <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-subtle)] mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent)]" />
                  Protected lot catalogue
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[var(--text-main)] tracking-tight leading-[1.1]">
                  Representative <span className="italic font-light text-[var(--text-muted)]">lot studies</span>
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-lg mx-auto mt-4">
                  These representative samples demonstrate our fabric cuts, embellishments, and stitching finishes. Wholesale rates, live stock, and size ratios unlock immediately upon KYC verification.
                </p>
                <div className="pt-6">
                  <Link
                    href="/register"
                    className="btn-editorial px-6 py-3 bg-[var(--brand-primary)] text-[var(--brand-light)] hover:opacity-90"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                    Apply for verification
                  </Link>
                </div>
              </div>
            </div>

            {/* Representative Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {representativeProducts.map((product, i) => (
                <div
                  key={product.id}
                  className="reveal"
                  style={{ '--reveal-delay': `${(i % 4) * 70}ms` } as React.CSSProperties}
                >
                  <PublicProductCard product={product} />
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. WHY RETAILERS CHOOSE ICCHASTORE - 3 Editorial Studies */}
        {/* ========================================================================= */}
        <section className="py-20 bg-[var(--bg-page)] border-t border-[var(--border-subtle)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="reveal text-left max-w-3xl mb-16 space-y-2 pb-6 border-b border-[var(--border-subtle)]">
              <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-[var(--text-subtle)] block mb-2">
                Methodology and standards
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[var(--text-main)] tracking-tight leading-[1.1]">
                Engineered for high-margin <span className="italic font-light text-[var(--text-muted)]">garment retailing</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 md:gap-y-0">

              <div className="reveal pr-8 py-2" style={{ '--reveal-delay': '0ms' } as React.CSSProperties}>
                <span className="font-serif italic text-sm text-[var(--text-subtle)] block mb-2.5">01</span>
                <h3 className="font-serif text-xl font-medium text-[var(--text-main)] mb-2.5">
                  Organized set lots
                </h3>
                <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
                  Every design is packed in standard, market-tested size combinations (e.g. M-38, L-40, XL-42, XXL-44) ensuring rapid shelf rotation without dead sizes.
                </p>
              </div>

              <div className="reveal pr-8 py-2 md:pl-8 md:border-l border-[var(--border-subtle)] border-t md:border-t-0 pt-8 md:pt-2" style={{ '--reveal-delay': '100ms' } as React.CSSProperties}>
                <span className="font-serif italic text-sm text-[var(--text-subtle)] block mb-2.5">02</span>
                <h3 className="font-serif text-xl font-medium text-[var(--text-main)] mb-2.5">
                  Dual GST production
                </h3>
                <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
                  Direct billing from Surat (Chanderi, Muslin & Festive Silk 3-Pc) and Jaipur (Cambric 60x60 Cotton, Handblocks & 2-Pc Sets) for clean input tax credit.
                </p>
              </div>

              <div className="reveal pr-8 py-2 md:pl-8 md:border-l border-[var(--border-subtle)] border-t md:border-t-0 pt-8 md:pt-2" style={{ '--reveal-delay': '200ms' } as React.CSSProperties}>
                <span className="font-serif italic text-sm text-[var(--text-subtle)] block mb-2.5">03</span>
                <h3 className="font-serif text-xl font-medium text-[var(--text-main)] mb-2.5">
                  Strict price shield
                </h3>
                <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
                  Your retail customers will never see wholesale margins or supplier prices on IcchaStore. Commercial access is strictly gated behind verified KYC.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. CRAFT, FACTORY VIDEO & REELS */}
        {/* ========================================================================= */}
        <section className="py-20 bg-[var(--brand-dark)] text-[var(--brand-light)] overflow-hidden border-t border-black/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="reveal lg:col-span-5 space-y-6" style={{ '--reveal-delay': '0ms' } as React.CSSProperties}>
                <div className="badge-editorial label-editorial-light text-[10px] uppercase font-bold tracking-[0.4em] text-[var(--text-subtle)] block mb-2">
                  <span className="badge-editorial-dot" />
                  Manufacturing standards
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-100 leading-[1.15]">
                  Stitching craft &amp; <br />
                  <span className="italic font-light text-stone-400">fabric standards</span>
                </h2>

                <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
                  Watch how each kurti lot undergoes 4-point fabric inspection, lock-stitch reinforcement, interlock seam overcasting, and pressing before packing.
                </p>

                <div className="space-y-3 text-xs text-stone-300 border-t border-white/10 pt-5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-1 h-1 rounded-full bg-[var(--brand-accent)] shrink-0 mt-1.5" />
                    <span>Liva certified heavy 14kg rayon & 60x60 Cambric cotton</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1 h-1 rounded-full bg-[var(--brand-accent)] shrink-0 mt-1.5" />
                    <span>Original Zari weaving & pure organza cutwork embroidery</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1 h-1 rounded-full bg-[var(--brand-accent)] shrink-0 mt-1.5" />
                    <span>Guaranteed colorfastness & zero shrinkage stitching allowance</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/videos"
                    className="btn-editorial btn-editorial-ghost px-6 py-3.5"
                  >
                    <span>View factory videos</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--brand-accent)] transition-transform duration-200 ease-out group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Video Preview Graphic */}
              <div className="reveal lg:col-span-7" style={{ '--reveal-delay': '120ms' } as React.CSSProperties}>
                <Link href="/videos" className="relative aspect-video overflow-hidden bg-[#1c1c1c] group block rounded-[var(--radius-sm)]">
                  <Image
                    src="https://images.unsplash.com/photo-1551803091-e20673f15770?w=1000&auto=format&fit=crop&q=80"
                    alt="IcchaStore Kurti Production & Craft" fill
                    className="object-cover opacity-60 transition-all duration-500 ease-out group-hover:opacity-75 group-hover:scale-[1.03]" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors duration-300 ease-out flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-[var(--brand-light)] text-[var(--brand-primary)] flex items-center justify-center transform transition-transform duration-300 ease-out group-hover:scale-110">
                      <Play className="w-6 h-6 fill-[var(--brand-primary)] translate-x-0.5" />
                    </div>
                    <span className="text-[12px] font-medium text-white/90">
                      Watch factory videos
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 text-[11px] font-medium text-stone-200 rounded-[2px]">
                    Surat facility — 3-pc festive set inspection
                  </div>
                </Link>
              </div>
            </div>

            {/* Instagram / Lookbooks Gallery Strip */}
            <div className="mt-16 pt-12 border-t border-white/10">
              <div className="reveal flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-[var(--brand-accent)]" />
                  <span className="font-serif italic text-lg text-stone-200">Lookbook archives</span>
                </div>
                <span className="text-[12px] text-stone-400">@icchastore.official</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600', tag: 'Chanderi 3-Pc' },
                  { img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600', tag: 'Jaipuri Cotton' },
                  { img: 'https://images.unsplash.com/photo-1596783074418-9752b578d665?w=600', tag: 'Alia Cut Lot' },
                  { img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600', tag: 'Nayra Cut Sets' },
                ].map((reel, idx) => (
                  <div
                    key={idx}
                    className="reveal relative aspect-[9/16] overflow-hidden bg-stone-900 border border-white/10 group rounded-[var(--radius-sm)]"
                    style={{ '--reveal-delay': `${idx * 70}ms` } as React.CSSProperties}
                  >
                    <Image
                      src={reel.img}
                      alt={reel.tag}
                      fill
                      className="object-cover transition-all duration-500 ease-out opacity-80 group-hover:scale-[1.03] group-hover:opacity-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 text-[11px] font-medium text-white/90">
                      {reel.tag}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. RETAILER REGISTRATION CTA */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[var(--bg-page)] border-t border-[var(--border-subtle)]">
          <div className="reveal max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            
            <div className="w-11 h-11 bg-[var(--brand-primary)] text-[var(--brand-light)] flex items-center justify-center font-serif text-xl mx-auto rounded-full">
              इ
            </div>

            <h2 className="font-serif text-4xl sm:text-5xl font-normal text-[var(--text-main)] tracking-tight leading-[1.15]">
              Ready to stock <br />
              <span className="italic font-light text-[var(--text-muted)]">curated kurti sets?</span>
            </h2>

            <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed">
              Join 1,200+ verified boutique owners and garment retailers across India. Submit your GSTIN for prompt access.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href="/register"
                className="btn-editorial btn-editorial-fill w-full sm:w-auto px-8 py-3.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                <span>Apply as retailer</span>
              </Link>

              <Link
                href="/login"
                className="btn-editorial btn-editorial-outline w-full sm:w-auto px-8 py-3.5"
              >
                Retailer login
              </Link>
            </div>

            <p className="text-xs text-[var(--text-subtle)] pt-2">
              Registration requires GSTIN or valid Shop and Establishment proof. Verification turnaround: 24 business hours.
            </p>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}