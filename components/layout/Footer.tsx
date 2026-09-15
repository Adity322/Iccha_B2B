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

export default function Footer() {
  const topCategories = MOCK_CATEGORIES.slice(0, 8);

  return (
    <footer className="bg-[#141414] text-[#d6cfc4] border-t border-black/30 text-sm">
      {/* 4 Pillar B2B Wholesale Highlights */}
      <div className="border-b border-white/10 bg-[#0f0f0f] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-sm bg-white/5 text-[#f9f7f2] border border-white/10 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-amber-400 block mb-0.5">Study 01</span>
              <h4 className="font-serif font-bold text-white text-sm">Direct Manufacturer</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Direct factory wholesale rates from Surat & Jaipur kurti production hubs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-sm bg-white/5 text-[#f9f7f2] border border-white/10 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-amber-400 block mb-0.5">Study 02</span>
              <h4 className="font-serif font-bold text-white text-sm">Verified GST B2B Portal</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Live wholesale pricing & inventory protected for approved retailers only.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-sm bg-white/5 text-[#f9f7f2] border border-white/10 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-amber-400 block mb-0.5">Study 03</span>
              <h4 className="font-serif font-bold text-white text-sm">Set-Based Assured Dispatch</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Standard wholesale set packing (M, L, XL, XXL) with full colorfastness test.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-sm bg-white/5 text-[#f9f7f2] border border-white/10 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-amber-400 block mb-0.5">Study 04</span>
              <h4 className="font-serif font-bold text-white text-sm">Multi-Entity GST Billing</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Compliant separate proforma estimates for Surat & Jaipur divisions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        
        {/* Brand Bio */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-white text-[#1a1a1a] flex items-center justify-center font-serif text-xl font-bold shadow">
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

          <div className="p-3.5 bg-black/40 rounded-sm border border-white/10 text-xs space-y-1.5">
            <div className="text-amber-400 font-semibold flex items-center gap-1.5 uppercase text-[10px] tracking-[0.2em]">
              <Lock className="w-3.5 h-3.5" /> B2B Price Protection Notice
            </div>
            <p className="text-[11px] text-stone-400">
              Wholesale lot prices and commercial stock counts are strictly confidential and accessible only to approved KYC retailers.
            </p>
          </div>
        </div>

        {/* 20 Kurti Categories Column */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-[10px] uppercase tracking-[0.25em]">
            Kurti Categories
          </h4>
          <ul className="space-y-2 text-xs">
            {topCategories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/categories/${cat.slug}`}
                  className="text-stone-400 hover:text-white transition line-clamp-1"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/categories" className="text-amber-400 hover:underline font-medium inline-flex items-center gap-1 uppercase text-[10px] tracking-[0.15em] pt-1">
                View All 20 Categories &rarr;
              </Link>
            </li>
          </ul>
        </div>

        {/* Retailer Services */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-[10px] uppercase tracking-[0.25em]">
            Retailer Portal
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/register" className="text-stone-400 hover:text-white flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" /> Apply as Retailer
              </Link>
            </li>
            <li>
              <Link href="/register/kyc" className="text-stone-400 hover:text-white">
                Submit KYC Verification
              </Link>
            </li>
            <li>
              <Link href="/application-status" className="text-stone-400 hover:text-white">
                Check KYC Application Status
              </Link>
            </li>
            <li>
              <Link href="/login" className="text-stone-400 hover:text-white">
                Retailer Secure Login
              </Link>
            </li>
            <li>
              <Link href="/collections" className="text-stone-400 hover:text-white">
                Seasonal Lookbooks
              </Link>
            </li>
            <li>
              <Link href="/videos" className="text-stone-400 hover:text-white">
                Factory & Craft Videos
              </Link>
            </li>
          </ul>
        </div>

        {/* Operational Hubs & Contact */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-[10px] uppercase tracking-[0.25em]">
            Manufacturing Hubs
          </h4>
          <div className="space-y-2.5 text-xs text-stone-400">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-200 block text-[11px] uppercase tracking-wider">Surat Hub:</strong>
                Millennium Textile Market-2, Ring Road, Surat - 395002
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-200 block text-[11px] uppercase tracking-wider">Jaipur Hub:</strong>
                RIICO Apparel Park, Sanganer, Jaipur - 302029
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1 text-stone-300">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>+91 98251 44550 / +91 94140 88220</span>
            </div>
            <div className="flex items-center gap-2 text-stone-300">
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              <span>wholesale@icchastore.com</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Legal Bar with Editorial Edition Marking */}
      <div className="border-t border-white/10 py-6 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <span>&copy; {new Date().getFullYear()} IcchaStore Wholesale Archive. All rights reserved.</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-stone-500 font-bold">Vol. 26 / Issue 04 &bull; Autumn/Festive</span>
          </div>
          <div className="flex items-center gap-6 uppercase text-[10px] tracking-[0.2em] font-bold">
            <Link href="/privacy-policy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <Link href="/contact" className="hover:text-white transition">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
