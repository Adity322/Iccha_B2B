'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, Sparkles, Eye, ShieldCheck, ArrowRight } from 'lucide-react';
import { Product } from '@/lib/types';

interface PublicProductCardProps {
  product: Product;
}

export default function PublicProductCard({ product }: PublicProductCardProps) {
  const primaryMedia = product.media[0] || {
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&auto=format&fit=crop&q=80',
    alt: product.name
  };

  return (
    <div className="group bg-[#f9f7f2] border border-black/10 hover:border-black/40 transition-all duration-300 flex flex-col h-full overflow-hidden">
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] w-full bg-[#ded9d0] overflow-hidden">
        <Image
          src={primaryMedia.url}
          alt={primaryMedia.alt || product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />

        {/* Representative Collection Tag */}
        <div className="absolute top-3 left-3 bg-[#1a1a1a] text-[#f9f7f2] text-[9px] uppercase font-bold tracking-[0.25em] px-2.5 py-1 flex items-center gap-1 shadow-sm">
          <Sparkles className="w-3 h-3 text-amber-300" />
          Representative Lot
        </div>

        {/* Clothing Type Badge */}
        <div className="absolute top-3 right-3 bg-white/90 text-[#1a1a1a] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm border border-black/5">
          {product.clothingType === '3_piece' ? '3-Pc Set' : product.clothingType === '2_piece' ? '2-Pc Set' : 'Kurti'}
        </div>

        {/* B2B Price Shield Overlay (appears on hover) */}
        <div className="absolute inset-0 bg-[#1a1a1a]/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center text-white backdrop-blur-[2px]">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center mb-2 border border-white/20">
            <Lock className="w-4 h-4 text-amber-300" />
          </div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-amber-300 mb-1">
            Protected Lot
          </span>
          <p className="text-[11px] text-stone-300 max-w-[200px] mb-4">
            Commercial inventory & lot rates unlock upon KYC approval.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f9f7f2] hover:bg-white text-[#1a1a1a] text-[10px] font-bold uppercase tracking-[0.2em] shadow transition"
          >
            Apply for Access
          </Link>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-[#f9f7f2]">
        <div>
          <div className="flex items-center justify-between text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-1">
            <span className="text-amber-800 tracking-[0.15em]">{product.categoryName}</span>
            <span className="font-mono text-stone-400">DES-{product.designNumber}</span>
          </div>

          <h3 className="font-serif text-base font-normal text-[#1a1a1a] line-clamp-1 group-hover:italic transition">
            {product.name}
          </h3>

          <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
            {product.fabric} &bull; {product.workType} &bull; {product.style}
          </p>
        </div>

        {/* Price & Stock Restrictions Banner */}
        <div className="pt-3 border-t border-black/10 space-y-2">
          <div className="bg-[#f5f2ea] p-2.5 border border-black/5 text-left space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Wholesale Rate:</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-900">
                <Lock className="w-3 h-3 text-rose-800" />
                Verified Retailers Only
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Stock Status:</span>
              <span className="text-[11px] text-stone-700 font-medium">Live for Approved KYC</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Link
              href="/register"
              className="flex-1 py-2.5 px-3 bg-[#1a1a1a] hover:bg-black text-[#f9f7f2] text-[10px] uppercase tracking-[0.2em] font-bold text-center transition flex items-center justify-center gap-1.5"
            >
              <span>Unlock Wholesale Rates</span>
              <ArrowRight className="w-3 h-3 text-amber-300" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
