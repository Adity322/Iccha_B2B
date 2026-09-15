import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ArrowRight, Lock, BookOpen, Layers, ShieldCheck } from 'lucide-react';
import PublicHeader from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';

export default function CollectionsPage() {
  const lookbooks = [
    {
      title: 'Noor-e-Zari: Festive 3-Piece Silk & Chanderi',
      hub: 'Surat Manufacturing Unit',
      season: 'Festive & Wedding 2026',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=80',
      description: 'Opulent Chanderi silk kurtis paired with heavy woven Zari dupattas and tailored cigarette pants with gold scallop borders.',
      categories: ['Chanderi 3-Piece', 'Silk Zari Sets', 'Organza Dupatta Lots']
    },
    {
      title: 'Sanganeri Blooms: Pure Cambric 60x60 2-Piece',
      hub: 'Jaipur Cotton Printing Unit',
      season: 'Spring / Summer 2026',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=900&auto=format&fit=crop&q=80',
      description: 'Handblock-inspired botanical floral prints on premium 60x60 breathable combed cotton with matching comfort-fit trousers.',
      categories: ['Daily Wear Cotton', 'Straight Cut 2-Piece', 'Office Wear Sets']
    },
    {
      title: 'Aayat: Heavy Rayon Foil-Print & Alia Cut',
      hub: 'Surat Manufacturing Unit',
      season: 'Boutique Special 2026',
      image: 'https://images.unsplash.com/photo-1596783074418-9752b578d665?w=900&auto=format&fit=crop&q=80',
      description: 'Trendsetting Alia cut V-yoke kurtis in heavy 14kg Liva rayon with gold discharge foil and lace trims.',
      categories: ['Alia Cut Sets', 'Heavy Rayon', 'Nayra Cut 3-Piece']
    },
    {
      title: 'Riyasat: Velvet & Zardozi Royal Winter Edition',
      hub: 'Surat Manufacturing Unit',
      season: 'Autumn / Winter Preview',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=900&auto=format&fit=crop&q=80',
      description: 'Micro-velvet stitched suits with intricate neckline zardozi threadwork and Banarasi brocade silk stoles.',
      categories: ['Velvet Sets', 'Winter Wear', 'Brocade Dupattas']
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      <main className="flex-1 py-12 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-12 space-y-3">
            <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#831843]">
              Curated Lookbooks
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              Wholesale Seasonal Lookbooks
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              Curated ethnic design edits crafted for boutique buyers seeking high-turnover festival, everyday, and bridal collections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {lookbooks.map((book, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
                  <Image
                    src={book.image}
                    alt={book.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-stone-900/85 backdrop-blur-md text-amber-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow">
                    {book.season}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-stone-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-800">{book.hub}</span>
                    <span className="text-[10px] text-stone-500 font-mono">Set Packing M-XXL</span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-serif text-xl font-bold text-stone-900">
                      {book.title}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {book.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {book.categories.map((c, i) => (
                        <span key={i} className="text-[11px] bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-md font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-stone-500 font-medium">
                      <Lock className="w-3.5 h-3.5 text-rose-800" />
                      <span>Wholesale rates protected</span>
                    </div>
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#831843] hover:underline"
                    >
                      <span>Unlock Lookbook Stock &rarr;</span>
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
