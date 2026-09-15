import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  Scissors, 
  MapPin, 
  Award, 
  CheckCircle2 
} from 'lucide-react';
import PublicHeader from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      <main className="flex-1 py-12 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Header */}
          <div className="max-w-3xl space-y-3">
            <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#831843]">
              Manufacturing Heritage
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 leading-tight">
              Direct Textile Powerhouse from Surat & Jaipur
            </h1>
            <p className="text-base text-stone-600 leading-relaxed">
              IcchaStore is an integrated B2B women&apos;s ethnic wear manufacturing house specializing exclusively in high-turnover stitched 2-piece and 3-piece kurti sets.
            </p>
          </div>

          {/* Dual Manufacturing Hubs Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#831843] text-white flex items-center justify-center font-serif text-xl font-bold">
                A
              </div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Surat Manufacturing Division
                </h3>
                <span className="text-[10px] bg-rose-50 text-rose-900 font-bold px-2 py-0.5 rounded border border-rose-200">
                  GST Entity A
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Operating out of Millennium Textile Market-2, Ring Road, Surat. Specializing in heavy festive Chanderi, Jacquard weaves, organza cutwork embroidery, and 3-piece celebration suits.
              </p>
              <div className="pt-2 text-xs text-stone-500 space-y-1">
                <div>&bull; Monthly Capacity: 85,000+ Stitched Sets</div>
                <div>&bull; Specialized in: Jacquard, Chanderi, Muslin, Velvet</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#9a3412] text-white flex items-center justify-center font-serif text-xl font-bold">
                B
              </div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Jaipur Cotton Printing Unit
                </h3>
                <span className="text-[10px] bg-amber-50 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-200">
                  GST Entity B
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Located in RIICO Apparel Park, Sanganer, Jaipur. Renowned for authentic handblock motifs, screen prints on pure 60x60 Cambric cotton, and comfortable daily-wear 2-piece sets.
              </p>
              <div className="pt-2 text-xs text-stone-500 space-y-1">
                <div>&bull; Monthly Capacity: 65,000+ Stitched Sets</div>
                <div>&bull; Specialized in: Pure 60x60 Cambric, Bagru & Indigo Prints</div>
              </div>
            </div>
          </div>

          {/* Quality & Assurance Grid */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Our 4-Point Wholesale Quality Assurance
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Standard Lot Sizing', desc: 'Precise grading across M-38, L-40, XL-42, XXL-44 with Indian body measurement accuracy.' },
                { title: 'Seam Reinforcement', desc: 'Overlock 5-thread safety stitching with 2-inch margins for boutique customer alterations.' },
                { title: 'Colorfast Guarantee', desc: 'Reactive dye fixation tested for repeated washes without bleeding or dullness.' },
                { title: 'Protected B2B Pricing', desc: 'Zero leakages of wholesale factory rates to retail consumers.' },
              ].map((q, idx) => (
                <div key={idx} className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  <h4 className="font-semibold text-stone-900 text-sm">{q.title}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">{q.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
