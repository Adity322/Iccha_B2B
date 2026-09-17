import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  Lock,
  Sparkles
} from 'lucide-react';
import { MOCK_CATEGORIES } from '@/lib/data/mockData';
import Reveal from '@/components/ui/Reveal';

export default function Footer() {
  const topCategories = MOCK_CATEGORIES.slice(0, 8);

  return (
    <footer className="bg-[#141414] text-[#d6cfc4] border-t border-black/30 text-sm">
      {/* 4 Pillar B2B Wholesale Highlights */}
      <div className="border-b border-white/10 bg-[#0f0f0f] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {[
            { icon: Building2, title: 'Direct manufacturer', body: 'Direct factory wholesale rates from Surat & Jaipur kurti production hubs.' },
            { icon: ShieldCheck, title: 'Verified GST B2B portal', body: 'Live wholesale pricing & inventory protected for approved retailers only.' },
            { icon: Truck, title: 'Set-based assured dispatch', body: 'Standard wholesale set packing (M, L, XL, XXL) with full colorfastness test.' },
            { icon: FileText, title: 'Multi-entity GST billing', body: 'Compliant separate proforma estimates for Surat & Jaipur divisions.' },
          ].map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 70} className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-[var(--radius-sm)] bg-white/5 text-stone-200 border border-white/10 shrink-0">
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-serif text-[15px] text-white mb-1">{title}</h4>
                <p className="text-xs text-stone-400 leading-relaxed">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        
        {/* Brand Bio */}
        <Reveal className="lg:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-white text-[#1a1a1a] flex items-center justify-center font-serif text-xl font-bold">
              इ
            </div>
            <div>
              <span className="font-serif italic text-2xl tracking-tighter text-white font-normal block leading-none">
                Iccha<span className="font-bold not-italic">Store.</span>
              </span>
              <span className="text-[9px] tracking-[0.35em] uppercase text-stone-400 font-semibold block mt-1">
                B2B Women&apos;s Ethnic Archive
              </span>
            </div>
          </Link>

          <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
            IcchaStore is India&apos;s premier wholesale semi-ecommerce platform for stitched 2-piece and 3-piece women&apos;s kurtis, pants, and dupattas. Supplying 1,200+ verified boutiques, retail chains, and wholesale distributors nationwide.
          </p>

          <div className="p-3.5 bg-black/40 rounded-[var(--radius-sm)] border border-white/10 text-xs space-y-1.5">
            <div className="text-stone-200 font-medium flex items-center gap-1.5 text-[11px]">
              <Lock className="w-3.5 h-3.5 text-amber-400" /> B2B price protection notice
            </div>
            <p className="text-[11px] text-stone-400">
              Wholesale lot prices and commercial stock counts are strictly confidential and accessible only to approved KYC retailers.
            </p>
          </div>
        </Reveal>

        {/* 20 Kurti Categories Column */}
        <Reveal delay={60} className="space-y-3">
          <h4 className="font-medium text-white text-[13px]">
            Kurti categories
          </h4>
          <ul className="space-y-2 text-xs">
            {topCategories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/categories/${cat.slug}`}
                  className="text-stone-400 hover:text-white transition-colors duration-200 ease-out line-clamp-1"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/categories" className="text-stone-200 hover:text-white transition-colors duration-200 ease-out font-medium inline-flex items-center gap-1 text-xs pt-1">
                View all 20 categories &rarr;
              </Link>
            </li>
          </ul>
        </Reveal>

        {/* Retailer Services */}
        <Reveal delay={120} className="space-y-3">
          <h4 className="font-medium text-white text-[13px]">
            Retailer portal
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/register" className="text-stone-400 hover:text-white transition-colors duration-200 ease-out flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" /> Apply as retailer
              </Link>
            </li>
            <li>
              <Link href="/register/kyc" className="text-stone-400 hover:text-white transition-colors duration-200 ease-out">
                Submit KYC verification
              </Link>
            </li>
            <li>
              <Link href="/application-status" className="text-stone-400 hover:text-white transition-colors duration-200 ease-out">
                Check KYC application status
              </Link>
            </li>
            <li>
              <Link href="/login" className="text-stone-400 hover:text-white transition-colors duration-200 ease-out">
                Retailer secure login
              </Link>
            </li>
            <li>
              <Link href="/collections" className="text-stone-400 hover:text-white transition-colors duration-200 ease-out">
                Seasonal lookbooks
              </Link>
            </li>
            <li>
              <Link href="/videos" className="text-stone-400 hover:text-white transition-colors duration-200 ease-out">
                Factory & craft videos
              </Link>
            </li>
          </ul>
        </Reveal>

        {/* Operational Hubs & Contact */}
        <Reveal delay={180} className="space-y-3">
          <h4 className="font-medium text-white text-[13px]">
            Manufacturing hubs
          </h4>
          <div className="space-y-2.5 text-xs text-stone-400">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-200 block text-[11px]">Surat hub</strong>
                Millennium Textile Market-2, Ring Road, Surat - 395002
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-200 block text-[11px]">Jaipur hub</strong>
                RIICO Apparel Park, Sanganer, Jaipur - 302029
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1 text-stone-300">
              <Phone className="w-3.5 h-3.5 text-stone-500" />
              <span>+91 98251 44550 / +91 94140 88220</span>
            </div>
            <div className="flex items-center gap-2 text-stone-300">
              <Mail className="w-3.5 h-3.5 text-stone-500" />
              <span>wholesale@icchastore.com</span>
            </div>
          </div>
        </Reveal>

      </div>

      {/* Bottom Legal Bar with Editorial Edition Marking */}
      <div className="border-t border-white/10 py-6 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <span>&copy; {new Date().getFullYear()} IcchaStore Wholesale Archive. All rights reserved.</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-stone-500 font-bold">Vol. 26 / Issue 04 &bull; Autumn/Festive</span>
          </div>
          <div className="flex items-center gap-6 text-xs font-medium text-stone-400">
            <Link href="/privacy-policy" className="hover:text-white transition-colors duration-200 ease-out">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors duration-200 ease-out">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors duration-200 ease-out">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}