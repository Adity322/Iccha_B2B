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
import CategoryRail from '@/components/category/CategoryRail';
// import { ProductService, CategoryService } from '@/lib/services';
import { PublicCatalogService } from '@/lib/services/publicCatalog';

/**
 * ────────────────────────────────────────────────────────────────────────
 * REDESIGN NOTES
 *
 * Palette is intentionally reduced to three values doing all the work:
 *   black (#0a0a0a)  — dark sections, primary buttons, ink
 *   white (#ffffff)  — light sections, cards, primary text-on-dark
 *   stone grey scale — everything in between (borders, muted copy, tiers)
 * No hue anywhere. Hierarchy comes from weight, spacing and grey value,
 * not colour-coding — so this page no longer depends on the old
 * --brand-accent / --brand-secondary / --brand-accent-wine tokens.
 *
 * The two editorial sections (craft moment + factory video) now bleed
 * their photography edge-to-edge as a true background panel with a
 * vignette, rather than sitting in a rounded, bordered box — copy lives
 * in a solid black panel beside it. The "retailer access" panel is
 * styled like a garment hang-tag (notch + thread hole) since that's a
 * real physical object in this business, not a generic floating card.
 *
 * The three-up benefit section drops the identical-rounded-card treatment
 * for a flat, spec-sheet style grid (sharp corners, hairline rules) that
 * reads closer to a cutting ticket than a SaaS pricing table.
 * ────────────────────────────────────────────────────────────────────────
 */

const btnFill =
  'inline-flex items-center justify-center gap-2 rounded-full bg-black text-white px-8 py-3.5 text-sm font-medium tracking-wide transition-colors duration-200 hover:bg-neutral-800';
const btnOutline =
  'inline-flex items-center justify-center gap-2 rounded-full border border-black text-black px-8 py-3.5 text-sm font-medium tracking-wide transition-colors duration-200 hover:bg-black hover:text-white';
const btnOnDark =
  'inline-flex items-center justify-center gap-2 rounded-full border border-white/40 text-white px-6 py-3.5 text-sm font-medium tracking-wide transition-colors duration-200 hover:bg-white hover:text-black hover:border-white';

export default async function HomePage() {
  // const representativeProducts = await ProductService.getPublicRepresentativeProducts(8);
  // const categories = await CategoryService.getCategories();
  const representativeProducts = await PublicCatalogService.getRepresentativeProducts(8);
  const categories = await PublicCatalogService.getCategories();
  const featuredCategories = categories.slice(0, 8);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <RevealInit />
      <PublicHeader />

      <main className="flex-1">

        {/* ========================================================================= */}
        {/* 1. HERO SECTION — left untouched */}
        {/* ========================================================================= */}
        {/* <HeroSection /> */}

        {/* ========================================================================= */}
        {/* 2. CATEGORY DISCOVERY */}
        {/* ========================================================================= */}
        <section className="py-24 sm:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="reveal flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-black tracking-tight leading-[1.05] max-w-xl">
                Every category we manufacture
              </h2>

              <Link
                href="/categories"
                className="inline-flex items-center gap-1.5 text-[15px] font-medium text-black group pb-0.5 border-b border-black transition-opacity duration-200 ease-out hover:opacity-60 shrink-0"
              >
                <span>View full catalogue</span>
                <ChevronRight className="w-4 h-4 transform transition-transform duration-200 ease-out group-hover:translate-x-1" />
              </Link>
            </div>

            <p className="reveal text-[15px] text-neutral-500 leading-relaxed max-w-xl mb-16">
              {categories.length} styles, cut and stitched across our Surat and Jaipur units — from
              festive 3-piece sets to everyday cambric cotton.
            </p>

            {/* Category rail — hover/focus opens a strip on desktop, 2-up tiles on mobile */}
            <div className="reveal">
              <CategoryRail categories={featuredCategories} />
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. CRAFT MOMENT — full-bleed vignette photo + hang-tag verification panel */}
        {/* ========================================================================= */}
        <section className="relative bg-black text-white border-y border-white/10">

          {/* Full-bleed photo hero: image IS the background, copy sits on top of it */}
          <div className="relative min-h-[640px] sm:min-h-[720px]">
            <Image
              src="https://images.unsplash.com/photo-1551803091-e20673f15770?w=1800&auto=format&fit=crop&q=85"
              alt="Fabric and stitch detail from an IcchaStore production lot"
              fill
              sizes="100vw"
              className="object-cover object-[center_30%] grayscale-[15%]"
              referrerPolicy="no-referrer"
            />
            {/* Left-to-right + bottom fades so copy stays legible against the photo */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/55 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-transparent" />
            <div className="absolute inset-0 shadow-[inset_0_0_14vw_4vw_rgba(0,0,0,0.55)]" />

            <div className="absolute top-6 left-4 sm:left-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-black/50 backdrop-blur-md border border-white/15 px-3.5 py-2 text-[11px] font-medium text-white/85">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Surat unit, cutting floor
              </span>
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-56 sm:pb-16">
              <div className="max-w-xl">
                <h2 className="reveal font-serif text-5xl sm:text-6xl lg:text-7xl font-normal leading-[0.98] tracking-tight">
                  Woven to
                  <br />
                  outlast the
                  <br />
                  season.
                </h2>

                <p
                  className="reveal mt-8 max-w-md text-[15px] sm:text-base text-white/70 leading-relaxed"
                  style={{ '--reveal-delay': '80ms' } as React.CSSProperties}
                >
                  Thoughtful fabric selection, controlled finishing, and careful inspection
                  turn every production lot into something retailers can confidently put on
                  the floor.
                </p>

                <div
                  className="reveal grid grid-cols-2 gap-4 max-w-md mt-12"
                  style={{ '--reveal-delay': '140ms' } as React.CSSProperties}
                >
                  <div className="border-t-2 border-white pt-4">
                    <span className="block font-serif text-2xl text-white">01</span>
                    <span className="block mt-1 text-[13px] text-white/60">
                      Fabric selection
                    </span>
                  </div>
                  <div className="border-t-2 border-white/40 pt-4">
                    <span className="block font-serif text-2xl text-white">02</span>
                    <span className="block mt-1 text-[13px] text-white/60">
                      Finish inspection
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hang-tag style verification card, floating over the photo */}
            <div className="absolute inset-x-4 bottom-6 sm:inset-x-auto sm:right-10 sm:bottom-10 z-10">
              <div className="relative max-w-sm ml-auto rounded-md bg-white text-black p-6 sm:p-7 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)]">
                {/* thread hole, top-left, like a physical swing tag */}
                {/* <span className="absolute -top-3 left-6 w-4 h-4 rounded-full bg-black border-4 border-white" /> */}
                {/* <span className="absolute -top-6 left-[34px] w-px h-4 bg-neutral-400" /> */}

                <div className="flex items-center gap-1.5 mb-4">
                  <Lock className="w-3.5 h-3.5 text-black" />
                  <span className="text-[11px] font-semibold text-neutral-500">
                    Retailer access
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-medium leading-tight mb-2">
                  See the commercial side.
                </h3>

                <p className="text-[13px] sm:text-[14px] text-neutral-500 leading-relaxed mb-5 max-w-sm">
                  Wholesale rates, live stock, and size ratios unlock once your GSTIN is verified.
                </p>

                <Link href="/register" className={`${btnFill} w-full`}>
                  Apply for verification
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* 4. REPRESENTATIVE COLLECTION (Sensitive B2B info hidden) */}
        {/* ========================================================================= */}
        <section className="py-24 sm:py-32 bg-neutral-50 border-t border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="reveal mb-16 max-w-2xl">
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-black tracking-tight leading-[1.05] mb-4">
                A sample of what we make
              </h2>
              <p className="text-[15px] text-neutral-500 leading-relaxed">
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
        {/* 5. WHY RETAILERS CHOOSE ICCHASTORE — flat spec-sheet grid, no card kit */}
        {/* ========================================================================= */}
        <section className="py-24 sm:py-32 bg-white border-t border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <h2 className="reveal font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-black tracking-tight leading-[1.05] max-w-3xl mb-16">
              Built for margin, not just volume
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-neutral-200">

              {[
                {
                  icon: Scissors,
                  tier: 'border-t-black',
                  title: 'Organized set lots',
                  body:
                    'Every design is packed in standard, market-tested size combinations — M-38, L-40, XL-42, XXL-44 — so shelves rotate without dead sizes.',
                },
                {
                  icon: Building2,
                  tier: 'border-t-neutral-500',
                  title: 'Two GST entities, one order',
                  body:
                    'Direct billing from Surat (Chanderi, muslin and festive silk 3-piece sets) and Jaipur (60x60 cambric cotton, hand-block and 2-piece sets) for clean input tax credit.',
                },
                {
                  icon: Lock,
                  tier: 'border-t-neutral-300',
                  title: 'Wholesale rates stay private',
                  body:
                    'Your retail customers never see our margins or supplier prices. Commercial access is gated behind verified KYC, every time.',
                },
              ].map((item, idx) => (
                <div
                  key={item.title}
                  className={`reveal group border-r border-b border-neutral-200 border-t-2 ${item.tier} p-8 sm:p-10 transition-colors duration-200 hover:bg-neutral-50`}
                  style={{ '--reveal-delay': `${idx * 100}ms` } as React.CSSProperties}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <item.icon className="w-5 h-5 text-black" strokeWidth={1.75} />
                    <h3 className="font-serif text-xl font-medium text-black">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-[15px] text-neutral-500 leading-relaxed">
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
        <section className="relative bg-black text-white overflow-hidden border-t border-white/10">

          {/* Full-bleed photo hero: image IS the background, copy + CTA sit on top of it */}
          <div className="relative min-h-[600px] sm:min-h-[680px] flex items-end">
            <Image
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1800&auto=format&fit=crop&q=85"
              alt="IcchaStore kurti production and craft"
              fill
              sizes="100vw"
              className="object-cover object-[center_25%] grayscale-[15%]"
              referrerPolicy="no-referrer"
            />
            {/* Left-to-right + bottom fades so copy stays legible against the photo */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/55 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
            <div className="absolute inset-0 shadow-[inset_0_0_14vw_4vw_rgba(0,0,0,0.55)]" />

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
              <div className="max-w-xl">
                <h2 className="reveal font-serif text-5xl sm:text-6xl lg:text-7xl font-normal text-white tracking-tight leading-[0.98] mb-6">
                  Stitched.
                  <br />
                  Inspected. Shipped.
                </h2>

                <p
                  className="reveal text-[15px] text-white/70 leading-relaxed"
                  style={{ '--reveal-delay': '80ms' } as React.CSSProperties}
                >
                  Watch how every kurti lot goes through 4-point fabric inspection,
                  lock-stitch reinforcement, interlock seam overcasting, and pressing
                  before packing.
                </p>

                <div
                  className="reveal space-y-3 text-[15px] text-white border-t border-white/15 mt-6 pt-5"
                  style={{ '--reveal-delay': '140ms' } as React.CSSProperties}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-1 h-1 rounded-full bg-white shrink-0 mt-2" />
                    <span>Liva-certified heavy 14kg rayon and 60x60 cambric cotton</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1 h-1 rounded-full bg-white/60 shrink-0 mt-2" />
                    <span>Original zari weaving and pure organza cutwork embroidery</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1 h-1 rounded-full bg-white/30 shrink-0 mt-2" />
                    <span>Guaranteed colorfastness and zero shrinkage stitching allowance</span>
                  </div>
                </div>

                <div
                  className="reveal flex flex-wrap items-center gap-5 mt-8"
                  style={{ '--reveal-delay': '200ms' } as React.CSSProperties}
                >
                  <Link href="/videos" className={btnOnDark}>
                    Watch factory videos
                  </Link>

                  <Link href="/videos" className="inline-flex items-center gap-3 group">
                    <span className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shrink-0 transition-transform duration-200 ease-out group-hover:scale-110">
                      <Play className="w-4 h-4 fill-black translate-x-0.5" />
                    </span>
                    <span className="text-[13px] text-white/70 group-hover:text-white transition-colors duration-200">
                      Surat facility —
                      <br />
                      3-piece festive set inspection
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Instagram / Lookbooks Gallery Strip */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="pt-12 border-t border-white/10">
              <div className="reveal flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-white/70" />
                  <span className="font-serif text-lg text-white">Recent lookbooks</span>
                </div>
                <span className="text-sm text-white/50">@icchastore.official</span>
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
                    className="reveal relative aspect-[9/16] overflow-hidden bg-white/5 border border-white/10 group"
                    style={{ '--reveal-delay': `${idx * 70}ms` } as React.CSSProperties}
                  >
                    <Image
                      src={reel.img}
                      alt={reel.tag}
                      fill
                      className="object-cover transition-all duration-300 ease-out opacity-70 group-hover:opacity-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 text-sm font-medium text-white">
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
        <section className="py-28 sm:py-36 bg-white border-t border-neutral-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

            <div className="reveal w-11 h-11 rounded-full bg-black text-white flex items-center justify-center font-serif text-xl mx-auto mb-8">
              इ
            </div>

            <h2 className="reveal font-serif text-5xl sm:text-6xl lg:text-7xl font-normal text-black tracking-tight leading-[1.02] mb-6">
              Ready to stock
              <br />
              curated kurti sets?
            </h2>

            <p className="reveal text-base text-neutral-500 max-w-lg mx-auto leading-relaxed mb-10">
              Join boutique owners and garment retailers across India already sourcing
              from us. Submit your GSTIN for prompt access.
            </p>

            <div className="reveal flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <Link href="/register" className={`${btnFill} w-full sm:w-auto`}>
                Apply as a retailer
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link href="/login" className={`${btnOutline} w-full sm:w-auto`}>
                Retailer login
              </Link>
            </div>

            <p className="reveal text-sm text-neutral-400">
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