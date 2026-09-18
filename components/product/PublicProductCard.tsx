'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, ArrowRight, Layers, Ruler } from 'lucide-react';
import { Product } from '@/lib/types';

interface PublicProductCardProps {
  product: Product;
}

/**
 * Design system reference:
 * - surface:  #FFFFFF        card body
 * - ivory:    #F5F0E6        page/rest background this card sits on
 * - border:   #E7DEC9        hairline card border
 * - ink:      #18140D        primary text / CTA fill
 * - ink-soft: #F3ECDD        text on ink surfaces
 * - muted:    #746A5A        secondary text
 * - subtle:   #A0937B        tertiary text / labels
 * - gold:     #B3823C        minor accent only (icons, one badge dot)
 */
export default function PublicProductCard({ product }: PublicProductCardProps) {
  const primaryMedia = product.media[0] || {
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&auto=format&fit=crop&q=80',
    alt: product.name,
  };

  const typeLabel =
    product.clothingType === '3_piece'
      ? '3-Pc Set'
      : product.clothingType === '2_piece'
      ? '2-Pc Set'
      : 'Kurti';

  return (
    <div className="group flex flex-col h-full rounded-[18px] bg-white border border-black/[0.07] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_18px_42px_rgba(0,0,0,0.12)] hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#ECE3D0]">
        <Image
          src={primaryMedia.url}
          alt={primaryMedia.alt || product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          referrerPolicy="no-referrer"
        />

        {/* Type pill — top-left, matches reference badge treatment */}
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-[#18140D] text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B3823C]" />
          {typeLabel}
        </div>

        {/* Lock pill — top-right, quiet until hover */}
        <div className="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#18140D]/85 text-[#F3ECDD] shadow-sm">
          <Lock className="w-3.5 h-3.5" />
        </div>

        {/* Hover reveal — protected pricing message */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#18140D]/92 via-[#18140D]/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-5 text-center">
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#D9AE68] mb-1.5">
            Protected lot
          </span>
          <p className="text-[12px] text-[#F3ECDD]/90 leading-relaxed max-w-[220px]">
            Wholesale rates unlock once your GSTIN is verified.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between p-3.5 sm:p-4 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-[#B3823C] tracking-wide">
              {product.categoryName}
            </span>
            <span className="text-[10px] font-mono text-[#A0937B]">
              DES-{product.designNumber}
            </span>
          </div>

          <h3 className="text-[15px] font-semibold leading-snug text-[#18140D] mb-2 line-clamp-1 group-hover:text-[#8C6428] transition">
            {product.name}
          </h3>

          <div className="flex items-center gap-3 text-[11px] text-[#746A5A]">
            <span className="inline-flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#A0937B]" />
              {product.fabric}
            </span>
            <span className="w-px h-3 bg-[#E7DEC9]" />
            <span className="inline-flex items-center gap-1">
              <Ruler className="w-3 h-3 text-[#A0937B]" />
              {product.style}
            </span>
          </div>
        </div>

        <Link
          href="/register"
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#18140D] hover:bg-[#2A2318] text-[#F3ECDD] text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-3 transition-colors"
        >
          <span>Unlock Wholesale Rates</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#D9AE68]" />
        </Link>
      </div>
    </div>
  );
}