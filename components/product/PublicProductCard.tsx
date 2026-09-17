'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, ArrowRight } from 'lucide-react';
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
    <div className="group bg-[#f9f7f2] border border-black/10 hover:border-black transition-all duration-300 flex flex-col h-full overflow-hidden">
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] w-full bg-[#ded9d0] overflow-hidden">
        <Image
          src={primaryMedia.url}
          alt={primaryMedia.alt || product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />

        {/* Clothing Type Badge — the only badge on the image now */}
        <div className="absolute top-3 right-3 bg-white/90 text-[#1a1a1a] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm border border-black/5">
          {product.clothingType === '3_piece' ? '3-Pc Set' : product.clothingType === '2_piece' ? '2-Pc Set' : 'Kurti'}
        </div>

        {/* B2B Price Shield Overlay (appears on hover) — the single place "protected" messaging lives */}
        <div className="absolute inset-0 bg-[#1a1a1a]/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center text-white backdrop-blur-[2px]">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center mb-2 border border-white/20">
            <Lock className="w-4 h-4 text-[var(--brand-accent)]" />
          </div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-[var(--brand-accent)] mb-1">
            Protected Lot
          </span>
          <p className="text-[11px] text-stone-300 max-w-[200px]">
            Commercial rates unlock upon KYC approval.
          </p>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-[#f9f7f2]">
        <div>
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
            <span className="text-[var(--brand-accent)] tracking-[0.15em]">{product.categoryName}</span>
            <span className="font-mono text-[var(--text-subtle)]">DES-{product.designNumber}</span>
          </div>

          <h3 className="font-serif text-base font-normal text-[#1a1a1a] line-clamp-1 group-hover:italic transition">
            {product.name}
          </h3>

          <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1 leading-relaxed">
            {product.fabric} &bull; {product.workType} &bull; {product.style}
          </p>
        </div>

        {/* Single CTA */}
        <div className="pt-3 border-t border-black/10">
          <Link
            href="/register"
            className="w-full py-2.5 px-3 bg-[#1a1a1a] hover:bg-black text-[#f9f7f2] text-[10px] uppercase tracking-[0.2em] font-bold text-center transition flex items-center justify-center gap-1.5"
          >
            <span>Unlock Wholesale Rates</span>
            <ArrowRight className="w-3 h-3 text-[var(--brand-accent)]" />
          </Link>
        </div>
      </div>
    </div>
  );
}