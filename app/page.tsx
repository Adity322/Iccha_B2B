import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Play,
  Instagram,
  ChevronRight,
  Scissors,
  Building2,
  Lock,
} from 'lucide-react';
import PublicHeader from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';
import PublicProductCard from '@/components/product/PublicProductCard';
import HeroSection from '@/components/hero/HeroSection';
import RevealInit from '@/components/ui/RevealInit';
import { ProductService, CategoryService } from '@/lib/services';

/**
 * ────────────────────────────────────────────────────────────────────────
 * IcchaStore design tokens — hardcoded, single source of truth for the page.
 * No CSS variables: every section below pulls from this fixed palette so
 * the page reads as one consistent theme rather than a set of loosely
 * related sections.
 *
 *   ivory        #F5F0E6   page background
 *   ivory-deep   #ECE3D0   section banding / muted backgrounds
 *   surface      #FFFFFF   card bodies
 *   border       #E7DEC9   hairlines, card borders
 *   ink          #18140D   primary text, dark surfaces, CTA fill
 *   ink-soft     #F3ECDD   text on ink / dark sections
 *   muted        #746A5A   secondary text
 *   subtle       #A0937B   tertiary text, labels
 *   gold         #B3823C   minor accent ONLY — icons, one dot, hover states
 *   gold-deep    #D9AE68   accent on dark surfaces
 * ────────────────────────────────────────────────────────────────────────
 */

function StepMarker({ index, label }: { index: string; label: string }) {
  return (
    <div className="reveal flex items-center gap-4 mb-5">
      <span className="font-serif text-base text-[#A0937B] tabular-nums">
        {index}
      </span>
      <span className="h-px flex-1 bg-[#E7DEC9]" />
      <span className="text-[13px] text-[#A0937B]">{label}</span>
    </div>
  );
}

export default async function HomePage() {
  const representativeProducts = await ProductService.getPublicRepresentativeProducts(8);
  const categories = await CategoryService.getCategories();
  const featuredCategories = categories.slice(0, 8);

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F0E6]">
      <RevealInit />
      <PublicHeader />

      <main className="flex-1">

        {/* ========================================================================= */}
        {/* 1. HERO SECTION — left untouched */}
        {/* ========================================================================= */}
        <HeroSection />

        {/* ========================================================================= */}
        {/* 2. CATEGORY DISCOVERY — same card language as the product grids below */}
        {/* ========================================================================= */}
        <section className="py-24 sm:py-32 bg-[#F5F0E6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <StepMarker index="01" label={`${categories.length} styles`} />

            <div className="reveal flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#18140D] tracking-tight leading-[1.05] max-w-xl">
                Every category we manufacture
              </h2>

              <Link
                href="/categories"
                className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[#18140D] group pb-0.5 border-b border-[#18140D] transition-opacity duration-200 ease-out hover:opacity-60 shrink-0"
              >
                <span>View full catalogue</span>
                <ChevronRight className="w-4 h-4 transform transition-transform duration-200 ease-out group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {featuredCategories.map((category, i) => (
                <div
                  key={category.id}
                  className="reveal"
                  style={{ '--reveal-delay': `${(i % 4) * 70}ms` } as React.CSSProperties}
                >
                  <Link
                    href={`/categories/${category.slug}`}
                    className="group flex flex-col h-full rounded-[26px] bg-white border border-[#E7DEC9] overflow-hidden shadow-[0_1px_2px_rgba(24,20,13,0.05)] transition-all duration-300 hover:shadow-[0_24px_48px_-24px_rgba(24,20,13,0.35)] hover:-translate-y-0.5"
                  >
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#ECE3D0]">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-[#18140D] text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B3823C]" />
                        {category.subcategories[0]}
                      </span>
                    </div>

                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
                      <h3 className="font-serif text-[17px] font-medium text-[#18140D] leading-snug">
                        {category.name}
                      </h3>
                      <span className="inline-flex items-center justify-center gap-1.5 w-full bg-[#18140D] group-hover:bg-[#2A2318] text-[#F3ECDD] text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-3 rounded-full transition-colors">
                        Browse designs
                        <ArrowRight className="w-3.5 h-3.5 text-[#D9AE68]" />
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. CRAFT MOMENT — editorial image + verification panel */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden bg-[#14110C] text-[#F3ECDD] border-y border-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-stretch">

              {/* Editorial copy */}
              <div className="reveal lg:col-span-5 flex flex-col justify-between min-h-[520px]">
                <div>
                  <div className="flex items-center gap-4 mb-8">
                    <span className="font-serif text-base text-[#A0937B] tabular-nums">02</span>
                    <span className="h-px flex-1 bg-white/10" />
                    <span className="text-[12px] uppercase tracking-[0.18em] text-[#A0937B]">
                      Craft moment
                    </span>
                  </div>

                  <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal leading-[0.98] tracking-tight max-w-xl">
                    Woven to
                    <br />
                    outlast the
                    <br />
                    season.
                  </h2>

                  <p className="mt-8 max-w-md text-[15px] sm:text-base text-[#F3ECDD]/65 leading-relaxed">
                    Thoughtful fabric selection, controlled finishing, and careful inspection
                    turn every production lot into something retailers can confidently put on
                    the floor.
                  </p>
                </div>

                <div className="mt-12 grid grid-cols-2 gap-4 max-w-md">
                  <div className="border-t border-white/10 pt-4">
                    <span className="block font-serif text-2xl text-[#F3ECDD]">01</span>
                    <span className="block mt-1 text-[11px] uppercase tracking-[0.14em] text-[#A0937B]">
                      Fabric selection
                    </span>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <span className="block font-serif text-2xl text-[#F3ECDD]">02</span>
                    <span className="block mt-1 text-[11px] uppercase tracking-[0.14em] text-[#A0937B]">
                      Finish inspection
                    </span>
                  </div>
                </div>
              </div>

              {/* Image + floating access card */}
              <div
                className="reveal lg:col-span-7 relative"
                style={{ '--reveal-delay': '120ms' } as React.CSSProperties}
              >
                <div className="relative min-h-[520px] h-full overflow-hidden rounded-[30px] border border-white/10 bg-[#1c1914]">
                  <Image
                    src="https://images.unsplash.com/photo-1551803091-e20673f15770?w=1800&auto=format&fit=crop&q=85"
                    alt="Fabric and stitch detail from an IcchaStore production lot"
                    fill
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.02]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />

                  <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 rounded-full bg-black/45 backdrop-blur-md border border-white/10 px-3.5 py-2 text-[11px] font-medium text-white/85">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D9AE68]" />
                      Production detail
                    </span>
                    <span className="hidden sm:block text-[10px] uppercase tracking-[0.2em] text-white/55">
                      IcchaStore / Archive
                    </span>
                  </div>

                  <div className="absolute inset-x-5 bottom-5 sm:inset-x-6 sm:bottom-6">
                    <div className="max-w-md rounded-[24px] bg-[#F5F0E6] text-[#18140D] p-5 sm:p-6 shadow-[0_24px_60px_-18px_rgba(0,0,0,0.6)]">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <span className="inline-flex items-center gap-1.5 bg-white/70 text-[#746A5A] text-[10px] font-semibold uppercase tracking-[0.12em] px-3 py-1.5 rounded-full">
                          <Lock className="w-3 h-3 text-[#B3823C]" />
                          Retailer access
                        </span>
                        <span className="font-serif text-sm text-[#A0937B]">B2B</span>
                      </div>

                      <h3 className="font-serif text-2xl sm:text-3xl font-medium leading-tight mb-2">
                        See the commercial side.
                      </h3>

                      <p className="text-[13px] sm:text-[14px] text-[#746A5A] leading-relaxed mb-5 max-w-sm">
                        Wholesale rates, live stock, and size ratios unlock once your GSTIN is verified.
                      </p>

                      <Link
                        href="/register"
                        className="inline-flex items-center justify-center gap-2 w-full bg-[#18140D] hover:bg-[#2A2318] text-[#F3ECDD] text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.14em] px-5 py-3.5 rounded-full transition-colors"
                      >
                        Apply for verification
                        <ArrowRight className="w-3.5 h-3.5 text-[#D9AE68]" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. REPRESENTATIVE COLLECTION (Sensitive B2B info hidden) */}
        {/* ========================================================================= */}
        <section className="py-24 sm:py-32 bg-[#ECE3D0] border-t border-[#E7DEC9]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <StepMarker index="02" label="Sample lot" />

            <div className="reveal mb-16 max-w-2xl">
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#18140D] tracking-tight leading-[1.05] mb-4">
                A sample of what we make
              </h2>
              <p className="text-[15px] text-[#746A5A] leading-relaxed">
                These pieces show our fabric cuts, embellishments, and stitching finishes.
                Wholesale rates, live stock, and size ratios unlock once your business is verified.
              </p>
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
        {/* 5. WHY RETAILERS CHOOSE ICCHASTORE — recast as cards, matching theme */}
        {/* ========================================================================= */}
        <section className="py-24 sm:py-32 bg-[#F5F0E6] border-t border-[#E7DEC9]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <StepMarker index="03" label="Why retailers stay" />

            <h2 className="reveal font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#18140D] tracking-tight leading-[1.05] max-w-3xl mb-16">
              Built for margin, not just volume
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

              {[
                {
                  icon: Scissors,
                  title: 'Organized set lots',
                  body:
                    'Every design is packed in standard, market-tested size combinations — M-38, L-40, XL-42, XXL-44 — so shelves rotate without dead sizes.',
                },
                {
                  icon: Building2,
                  title: 'Two GST entities, one order',
                  body:
                    'Direct billing from Surat (Chanderi, muslin and festive silk 3-piece sets) and Jaipur (60x60 cambric cotton, hand-block and 2-piece sets) for clean input tax credit.',
                },
                {
                  icon: Lock,
                  title: 'Wholesale rates stay private',
                  body:
                    'Your retail customers never see our margins or supplier prices. Commercial access is gated behind verified KYC, every time.',
                },
              ].map((item, idx) => (
                <div
                  key={item.title}
                  className="reveal rounded-[26px] bg-white border border-[#E7DEC9] p-7 sm:p-8 shadow-[0_1px_2px_rgba(24,20,13,0.05)] transition-shadow duration-300 hover:shadow-[0_24px_48px_-24px_rgba(24,20,13,0.35)]"
                  style={{ '--reveal-delay': `${idx * 100}ms` } as React.CSSProperties}
                >
                  <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[#F5F0E6] mb-6">
                    <item.icon className="w-4.5 h-4.5 text-[#B3823C]" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-[#18140D] mb-2.5">
                    {item.title}
                  </h3>
                  <p className="text-[15px] text-[#746A5A] leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. CRAFT, FACTORY VIDEO & REELS */}
        {/* ========================================================================= */}
        <section className="py-24 sm:py-32 bg-[#14110C] text-[#F3ECDD] overflow-hidden border-t border-black/30">

          {/* Giant edge-to-edge type banner */}
          <div className="px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
            <div className="max-w-7xl mx-auto">
              <span className="reveal block text-[13px] text-[#F3ECDD]/60 mb-4">04 — Finishing</span>
              <h2 className="reveal font-serif text-6xl sm:text-7xl lg:text-8xl font-normal text-[#F3ECDD] tracking-tight leading-[0.95]">
                Stitched.
                <br />
                Inspected. Shipped.
              </h2>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="reveal lg:col-span-5 space-y-6" style={{ '--reveal-delay': '0ms' } as React.CSSProperties}>
                <p className="text-[15px] text-[#F3ECDD]/80 leading-relaxed">
                  Watch how every kurti lot goes through 4-point fabric inspection,
                  lock-stitch reinforcement, interlock seam overcasting, and pressing
                  before packing.
                </p>

                <div className="space-y-3 text-[15px] text-[#F3ECDD] border-t border-white/10 pt-5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-1 h-1 rounded-full bg-[#D9AE68] shrink-0 mt-2" />
                    <span>Liva-certified heavy 14kg rayon and 60x60 cambric cotton</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1 h-1 rounded-full bg-[#D9AE68] shrink-0 mt-2" />
                    <span>Original zari weaving and pure organza cutwork embroidery</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1 h-1 rounded-full bg-[#D9AE68] shrink-0 mt-2" />
                    <span>Guaranteed colorfastness and zero shrinkage stitching allowance</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/videos"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#F3ECDD]/25 hover:border-[#F3ECDD]/60 text-[#F3ECDD] text-[13px] font-semibold uppercase tracking-[0.12em] px-6 py-3.5 transition-colors"
                  >
                    <span>Watch factory videos</span>
                  </Link>
                </div>
              </div>

              {/* Video Preview Graphic */}
              <div className="reveal lg:col-span-7" style={{ '--reveal-delay': '120ms' } as React.CSSProperties}>
                <Link href="/videos" className="relative aspect-video overflow-hidden rounded-[26px] bg-[#1c1a16] border border-white/10 group block">
                  <Image
                    src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop&q=80"
                    alt="IcchaStore kurti production and craft"
                    fill
                    className="object-cover opacity-60 transition-opacity duration-300 ease-out group-hover:opacity-75"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors duration-300 ease-out flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-white text-[#18140D] flex items-center justify-center transform transition-transform duration-300 ease-out group-hover:scale-110">
                      <Play className="w-6 h-6 fill-[#18140D] translate-x-0.5" />
                    </div>
                    <span className="text-sm font-semibold text-white/90">
                      Watch factory videos
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/60 rounded-full px-4 py-1.5 text-sm text-[#F3ECDD]">
                    Surat facility — 3-piece festive set inspection
                  </div>
                </Link>
              </div>
            </div>

            {/* Instagram / Lookbooks Gallery Strip */}
            <div className="mt-20 pt-12 border-t border-white/10">
              <div className="reveal flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-[#D9AE68]" />
                  <span className="font-serif text-lg text-[#F3ECDD]">Recent lookbooks</span>
                </div>
                <span className="text-sm text-[#F3ECDD]/60">@icchastore.official</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { img: 'https://images.unsplash.com/photo-1596783074418-9752b578d665?w=600', tag: 'Alia cut lot' },
                  { img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600', tag: 'Jaipuri cotton' },
                  { img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600', tag: 'Nayra cut sets' },
                  { img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600', tag: 'Chanderi 3-pc' },
                ].map((reel, idx) => (
                  <div
                    key={idx}
                    className="reveal relative aspect-[9/16] overflow-hidden rounded-2xl bg-[#1a1712] border border-white/10 group"
                    style={{ '--reveal-delay': `${idx * 70}ms` } as React.CSSProperties}
                  >
                    <Image
                      src={reel.img}
                      alt={reel.tag}
                      fill
                      className="object-cover transition-opacity duration-300 ease-out opacity-80 group-hover:opacity-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 text-sm font-medium text-white/90">
                      {reel.tag}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. RETAILER REGISTRATION CTA */}
        {/* ========================================================================= */}
        <section className="py-28 sm:py-36 bg-[#F5F0E6] border-t border-[#E7DEC9]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

            <div className="reveal w-11 h-11 rounded-full bg-[#18140D] text-[#F3ECDD] flex items-center justify-center font-serif text-xl mx-auto mb-8">
              इ
            </div>

            <h2 className="reveal font-serif text-5xl sm:text-6xl lg:text-7xl font-normal text-[#18140D] tracking-tight leading-[1.02] mb-6">
              Ready to stock
              <br />
              curated kurti sets?
            </h2>

            <p className="reveal text-base text-[#746A5A] max-w-lg mx-auto leading-relaxed mb-10">
              Join boutique owners and garment retailers across India already sourcing
              from us. Submit your GSTIN for prompt access.
            </p>

            <div className="reveal flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto rounded-full bg-[#18140D] hover:bg-[#2A2318] text-[#F3ECDD] text-[13px] font-semibold uppercase tracking-[0.12em] px-8 py-3.5 transition-colors"
              >
                <span>Apply as a retailer</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D9AE68]" />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full sm:w-auto rounded-full border border-[#18140D]/25 hover:border-[#18140D] text-[#18140D] text-[13px] font-semibold uppercase tracking-[0.12em] px-8 py-3.5 transition-colors"
              >
                Retailer login
              </Link>
            </div>

            <p className="reveal text-sm text-[#A0937B]">
              Registration requires a GSTIN or valid Shop and Establishment proof.
              Verification takes about 24 business hours.
            </p>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}