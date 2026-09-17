import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Sparkles, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  Building2, 
  Layers, 
  Package, 
  CheckCircle2, 
  Play, 
  Instagram, 
  Scissors, 
  Award,
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
    <div className="flex flex-col min-h-screen bg-[#f9f7f2]">
      <PublicHeader />

      <main className="flex-1">
        
        {/* ========================================================================= */}
        {/* 1. HERO SECTION - Premium WebGL Glass-Refraction Kurta Showcase */}
        {/* ========================================================================= */}
        <HeroSection />

        {/* ========================================================================= */}
        {/* 2. CATEGORY DISCOVERY (20 Categories Grid) */}
        {/* ========================================================================= */}
        <section className="py-20 bg-[#f9f7f2] shadow-[inset_0_1px_0_rgba(0,0,0,0.03)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 pb-6 border-b border-black/10">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-[var(--text-subtle)] block mb-2">
                  Catalogue Archives &bull; 20 Editions
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#1a1a1a] tracking-tight">
                  Wholesale Categories <span className="italic font-light text-[var(--text-muted)]">Overview</span>
                </h2>
              </div>

              <Link
                href="/categories"
                className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[#1a1a1a] hover:opacity-70 group pb-1 border-b border-black"
              >
                <span>View Full Index (20)</span>
                <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
              </Link>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {featuredCategories.map((category, idx) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group relative bg-[#f5f2ea] border border-black/10 hover:border-black transition-all duration-300 flex flex-col h-full overflow-hidden"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#ded9d0]">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/80 via-transparent to-transparent" />
                    
                    {/* Index Number */}
                    <div className="absolute top-3 left-3 bg-[#1a1a1a] text-[#f9f7f2] text-[9px] font-bold uppercase tracking-[0.25em] px-2 py-0.5">
                      Cat. {String(idx + 1).padStart(2, '0')}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[9px] uppercase font-bold text-[var(--brand-accent)] tracking-[0.2em] block mb-0.5">
                        {category.subcategories[0]}
                      </span>
                      <h3 className="font-serif text-lg font-normal leading-tight group-hover:italic transition">
                        {category.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-[#f9f7f2]">
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                      {category.representativeTagline}
                    </p>
                    <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]">
                      <span>Examine Catalogue</span>
                      <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. REPRESENTATIVE COLLECTION (Sensitive B2B info hidden) */}
        {/* ========================================================================= */}
        <section className="py-20 bg-[#f2ede4] border-t border-black/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header Editorial Banner */}
            <div className="bg-[#1a1a1a] text-[#f9f7f2] p-8 sm:p-12 mb-12 shadow-sm relative overflow-hidden border border-black/20">
              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-[#f9f7f2] text-[9px] font-bold uppercase tracking-[0.25em] border border-white/20">
                  <Lock className="w-3 h-3 text-[var(--brand-accent)]" /> Protected Lot Catalogue
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight">
                  Representative <span className="italic font-light text-stone-300">Lot Studies</span>
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-xl">
                  These representative samples demonstrate our fabric cuts, embellishments, and stitching finishes. Wholesale lot rates, live pieces, and size ratios become accessible immediately upon KYC verification.
                </p>
                <div className="pt-2">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#f9f7f2] hover:bg-white text-[#1a1a1a] text-[10px] uppercase tracking-[0.25em] font-bold shadow-sm transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                    Apply for Verification
                  </Link>
                </div>
              </div>
            </div>

            {/* Representative Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {representativeProducts.map((product) => (
                <PublicProductCard key={product.id} product={product} />
              ))}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. WHY RETAILERS CHOOSE ICCHASTORE - 3 Editorial Studies */}
        {/* ========================================================================= */}
        <section className="py-20 bg-[#f9f7f2] border-t border-black/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-left max-w-3xl mb-16 space-y-2 pb-6 border-b border-black/10">
              <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-[var(--text-subtle)] block">
                Methodology &amp; Standards
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#1a1a1a] tracking-tight">
                Engineered for High-Margin <span className="italic font-light text-[var(--text-muted)]">Garment Retailing</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="p-8 bg-[#f9f7f2] border border-black/15 hover:border-black transition space-y-4">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--brand-accent)] block">Study 01</span>
                <h3 className="font-serif text-2xl font-normal text-[#1a1a1a]">
                  Organized Set Lots
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Every design is packed in standard, market-tested size combinations (e.g. M-38, L-40, XL-42, XXL-44) ensuring rapid shelf rotation without dead sizes.
                </p>
              </div>

              <div className="p-8 bg-[#f9f7f2] border border-black/15 hover:border-black transition space-y-4">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--brand-accent)] block">Study 02</span>
                <h3 className="font-serif text-2xl font-normal text-[#1a1a1a]">
                  Dual GST Production
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Direct billing from Surat (Chanderi, Muslin & Festive Silk 3-Pc) and Jaipur (Cambric 60x60 Cotton, Handblocks & 2-Pc Sets) for clean input tax credit.
                </p>
              </div>

              <div className="p-8 bg-[#f9f7f2] border border-black/15 hover:border-black transition space-y-4">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--brand-accent)] block">Study 03</span>
                <h3 className="font-serif text-2xl font-normal text-[#1a1a1a]">
                  Strict Price Shield
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Your retail customers will never see wholesale margins or supplier prices on IcchaStore. Commercial access is strictly gated behind verified KYC.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. CRAFT, FACTORY VIDEO & REELS */}
        {/* ========================================================================= */}
        <section className="py-20 bg-[#141414] text-[#f9f7f2] overflow-hidden border-t border-black/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-[#f9f7f2] text-[9px] uppercase tracking-[0.25em] font-bold border border-white/20">
                  <Award className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                  <span>Manufacturing Standards</span>
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-100 leading-tight">
                  Stitching Craft &amp; <br />
                  <span className="italic font-light text-stone-400">Fabric Standards</span>
                </h2>

                <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
                  Watch how each kurti lot undergoes 4-point fabric inspection, lock-stitch reinforcement, interlock seam overcasting, and pressing before packing.
                </p>

                <div className="space-y-3 text-xs text-stone-300">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--brand-accent)] shrink-0" />
                    <span>Liva certified heavy 14kg rayon & 60x60 Cambric cotton</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--brand-accent)] shrink-0" />
                    <span>Original Zari weaving & pure organza cutwork embroidery</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--brand-accent)] shrink-0" />
                    <span>Guaranteed colorfastness & zero shrinkage stitching allowance</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/videos"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-[#f9f7f2] text-[10px] uppercase tracking-[0.25em] font-bold border border-white/20 transition"
                  >
                    <span>View Factory Videos</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                  </Link>
                </div>
              </div>

              {/* Video Preview Graphic */}
              <div className="lg:col-span-7">
                <Link href="/videos" className="relative aspect-video overflow-hidden border border-white/20 bg-[#1c1c1c] group block">
                  <Image
                    src="https://images.unsplash.com/photo-1551803091-e20673f15770?w=1000&auto=format&fit=crop&q=80"
                    alt="IcchaStore Kurti Production & Craft" fill
                    className="object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-300" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300 flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-[#f9f7f2] text-[#1a1a1a] flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition duration-300">
                      <Play className="w-6 h-6 fill-[#1a1a1a] translate-x-0.5" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/90">
                      Watch Factory Videos
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/80 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-200 border border-white/10">
                    Surat Facility &bull; 3-Pc Festive Set Inspection
                  </div>
                </Link>
              </div>
            </div>

            {/* Instagram / Lookbooks Gallery Strip */}
            <div className="mt-16 pt-12 border-t border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-[var(--brand-accent)]" />
                  <span className="font-serif italic text-lg text-stone-200">Lookbook Archives</span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-stone-400">@icchastore.official</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600', tag: 'Chanderi 3-Pc' },
                  { img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600', tag: 'Jaipuri Cotton' },
                  { img: 'https://images.unsplash.com/photo-1596783074418-9752b578d665?w=600', tag: 'Alia Cut Lot' },
                  { img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600', tag: 'Nayra Cut Sets' },
                ].map((reel, idx) => (
                  <div key={idx} className="relative aspect-[9/16] overflow-hidden bg-stone-900 border border-white/10 group">
                    <Image
                      src={reel.img}
                      alt={reel.tag}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500 opacity-80 group-hover:opacity-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--brand-accent)]">
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
        <section className="py-20 bg-[#f9f7f2] border-t border-black/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            
            <div className="w-12 h-12 bg-[#1a1a1a] text-[#f9f7f2] flex items-center justify-center font-serif text-2xl font-bold mx-auto border border-black/20">
              इ
            </div>

            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#1a1a1a] tracking-tight">
              Ready to Stock <br />
              <span className="italic font-light text-[var(--text-muted)]">Curated Kurti Sets?</span>
            </h2>

            <p className="font-serif italic text-base sm:text-lg text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
              Join 1,200+ verified boutique owners and garment retailers across India. Submit your GSTIN for prompt access.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-10 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#f9f7f2] bg-[#1a1a1a] hover:bg-black rounded-sm shadow-sm transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                <span>Apply as Retailer</span>
              </Link>

              <Link
                href="/login"
                className="w-full sm:w-auto px-10 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-[#1a1a1a] bg-transparent hover:bg-black/5 border border-black/30 rounded-sm transition"
              >
                Retailer Login
              </Link>
            </div>

            <p className="text-[11px] text-[var(--text-subtle)] pt-2 tracking-wide">
              Registration requires GSTIN or valid Shop &amp; Establishment proof. Verification turnaround: 24 business hours.
            </p>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
